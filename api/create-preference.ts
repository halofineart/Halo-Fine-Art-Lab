// POST /api/create-preference
// Creates a real Mercado Pago Checkout Pro preference for one order and
// persists the order in Supabase (using the service role key, server-side
// only) with payment_status = 'pending'. Returns the URL to redirect the
// shopper to. The Mercado Pago Access Token never reaches the browser.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getSupabaseAdmin } from './_supabaseAdmin';

interface CartItemPayload {
  title: string;
  format?: string;
  cover?: string;
  foil?: string;
  pages?: number;
  price: number;
  previewUrl?: string;
  hasGiftBox?: boolean;
}

interface CreatePreferenceBody {
  orderCode: string;
  items: CartItemPayload[];
  subtotal: number;
  discountAmount?: number;
  shippingCost?: number;
  total: number;
  payer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: string;
  city: string;
  postalCode?: string;
  shippingMethod: 'pilar_direct' | 'correo_nacional';
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!isNonEmptyString(accessToken)) {
    console.error('[create-preference] Falta MP_ACCESS_TOKEN en las variables de entorno del servidor.');
    return res.status(500).json({ error: 'Mercado Pago no está configurado en el servidor todavía.' });
  }

  const body = req.body as CreatePreferenceBody;

  // --- Basic payload validation ---------------------------------------
  if (!body || !isNonEmptyString(body.orderCode) || !/^HALO-\d{6}$/.test(body.orderCode)) {
    return res.status(400).json({ error: 'Código de orden inválido.' });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío.' });
  }
  if (!body.payer || !isNonEmptyString(body.payer.email) || !isNonEmptyString(body.payer.name)) {
    return res.status(400).json({ error: 'Faltan datos del comprador.' });
  }

  const subtotal = Number(body.subtotal) || 0;
  const discountAmount = Number(body.discountAmount) || 0;
  const shippingCost = Number(body.shippingCost) || 0;
  const total = Math.round(Number(body.total) || 0);

  // Sanity: the total must be a positive number that roughly matches the
  // components sent, and can't be absurdly low (guards against a stray 0/1
  // from a tampered client — full catalog-price recomputation server-side
  // is a good future hardening step, tracked as a known limitation).
  const expectedTotal = Math.round(subtotal - discountAmount + shippingCost);
  if (total < 1000 || Math.abs(total - expectedTotal) > 5) {
    return res.status(400).json({ error: 'El total de la orden no es válido.' });
  }

  const siteUrl = (process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error('[create-preference] Falta configuración de Supabase (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    return res.status(500).json({ error: 'La base de datos no está configurada en el servidor todavía.' });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const mpResult = await preference.create({
      body: {
        items: [
          {
            id: body.orderCode,
            title: `HALO Fine Art Lab · Pedido ${body.orderCode}`,
            description: body.items.map((it) => it.title).join(' + ').slice(0, 250),
            quantity: 1,
            unit_price: total,
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: body.payer.name.slice(0, 100),
          email: body.payer.email,
          phone: body.payer.phone ? { number: body.payer.phone.slice(0, 30) } : undefined,
        },
        external_reference: body.orderCode,
        back_urls: {
          success: `${siteUrl}/?mp_return=success&order=${encodeURIComponent(body.orderCode)}`,
          pending: `${siteUrl}/?mp_return=pending&order=${encodeURIComponent(body.orderCode)}`,
          failure: `${siteUrl}/?mp_return=failure&order=${encodeURIComponent(body.orderCode)}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/mp-webhook`,
        statement_descriptor: 'HALOFINEARTLAB',
      },
    });

    if (!mpResult.id) {
      throw new Error('Mercado Pago no devolvió un id de preferencia.');
    }

    const isTestToken = accessToken.startsWith('TEST-');
    const initPoint = (isTestToken ? mpResult.sandbox_init_point : mpResult.init_point) || mpResult.init_point;

    if (!initPoint) {
      throw new Error('Mercado Pago no devolvió una URL de checkout.');
    }

    // Persist the order now — payment_status stays 'pending' until the
    // webhook (the authoritative source) confirms what actually happened.
    const { error: insertError } = await (supabaseAdmin.from('orders') as any).insert([
      {
        order_code: body.orderCode,
        customer_name: body.payer.name,
        customer_email: body.payer.email,
        customer_phone: body.payer.phone || null,
        shipping_address: body.shippingAddress,
        city: body.city,
        postal_code: body.postalCode || null,
        shipping_method: body.shippingMethod,
        format_title: body.items[0]?.title || 'Fotolibro Fine Art',
        cover_type: body.items[0]?.cover || null,
        paper_type: null,
        total_price: total,
        subtotal,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        items_json: body.items,
        status: 'pendiente_pago',
        payment_status: 'pending',
        payment_provider: 'mercadopago',
        mp_preference_id: mpResult.id,
      },
    ]);

    if (insertError) {
      // Most likely cause: order_code collision (extremely unlikely with a
      // 6-digit random suffix, but the DB enforces uniqueness). Ask the
      // client to retry with a fresh code rather than sending them to pay
      // for an order we never saved.
      console.error('[create-preference] Error guardando la orden en Supabase:', insertError.message);
      return res.status(409).json({ error: 'No se pudo registrar la orden (código duplicado). Probá de nuevo.' });
    }

    return res.status(200).json({ initPoint, preferenceId: mpResult.id, orderCode: body.orderCode });
  } catch (err: any) {
    console.error('[create-preference] Error creando la preferencia de Mercado Pago:', err?.message || err);
    return res.status(502).json({ error: 'No se pudo iniciar el pago con Mercado Pago. Intentá nuevamente en unos segundos.' });
  }
}
