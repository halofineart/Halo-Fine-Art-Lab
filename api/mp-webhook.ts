// POST /api/mp-webhook
// Mercado Pago calls this URL every time a payment's status changes. This
// is the ONLY source of truth for whether an order was actually paid —
// never trust the browser redirect alone, since a shopper can close the
// tab or tamper with the return URL.
//
// Configure this URL in the Mercado Pago dashboard (Tu aplicación →
// Webhooks → https://<tu-dominio>/api/mp-webhook, evento "Pagos") and copy
// the "Firma secreta" it generates into MP_WEBHOOK_SECRET.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSupabaseAdmin } from './_supabaseAdmin';

function verifySignature(req: VercelRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured yet — allow the webhook to work out of the box, but
    // this should be turned on before taking real payments at scale.
    console.warn('[mp-webhook] MP_WEBHOOK_SECRET no configurado — la firma no se está validando.');
    return true;
  }

  const signatureHeader = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  if (typeof signatureHeader !== 'string' || typeof requestId !== 'string') {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

function mapMpStatusToOrderStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved':
      return 'confirmado';
    case 'rejected':
      return 'rechazado';
    case 'cancelled':
      return 'cancelado';
    case 'refunded':
    case 'charged_back':
      return 'reembolsado';
    default:
      return 'pendiente_pago';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Mercado Pago sometimes probes the URL with a GET when you register it.
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  const supabaseAdmin = getSupabaseAdmin();

  // Mercado Pago's notification shape: either a JSON body { type/action, data: { id } }
  // or query params ?type=payment&data.id=...  — handle both.
  const body = (req.body || {}) as { type?: string; action?: string; data?: { id?: string } };
  const queryType = typeof req.query.type === 'string' ? req.query.type : undefined;
  const queryDataId = typeof req.query['data.id'] === 'string' ? (req.query['data.id'] as string) : undefined;

  const eventType = body.type || body.action?.split('.')[0] || queryType;
  const paymentId = body.data?.id || queryDataId;

  // Always ack quickly with 200 for anything that isn't a payment event, so
  // Mercado Pago doesn't keep retrying notifications we don't care about.
  if (eventType !== 'payment' || !paymentId) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  if (!verifySignature(req, String(paymentId))) {
    console.warn('[mp-webhook] Firma inválida, se rechaza la notificación.');
    return res.status(401).json({ error: 'Firma inválida' });
  }

  if (!accessToken || !supabaseAdmin) {
    console.error('[mp-webhook] Falta MP_ACCESS_TOKEN o configuración de Supabase.');
    // Still ack 200 — the misconfiguration is ours, retrying won't help,
    // and we don't want Mercado Pago hammering this endpoint forever.
    return res.status(200).json({ ok: false });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const payment = await new Payment(client).get({ id: String(paymentId) });

    const orderCode = payment.external_reference;
    if (!orderCode) {
      console.warn('[mp-webhook] Pago sin external_reference, no se puede asociar a una orden:', paymentId);
      return res.status(200).json({ ok: true });
    }

    const mpStatus = payment.status || 'pending';

    const { error } = await (supabaseAdmin.from('orders') as any)
      .update({
        payment_status: mpStatus,
        status: mapMpStatusToOrderStatus(mpStatus),
        mp_payment_id: String(payment.id),
        mp_payment_method: payment.payment_method_id || null,
        mp_installments: payment.installments || null,
        mp_status_detail: payment.status_detail || null,
      })
      .eq('order_code', orderCode);

    if (error) {
      console.error('[mp-webhook] Error actualizando la orden en Supabase:', error.message);
      // Return 500 so Mercado Pago retries this notification later.
      return res.status(500).json({ error: 'DB update failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[mp-webhook] Error procesando la notificación:', err?.message || err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
