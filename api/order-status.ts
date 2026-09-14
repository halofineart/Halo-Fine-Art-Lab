// GET /api/order-status?code=HALO-123456&email=cliente@example.com
// Public, read-only lookup used by the post-payment return screen. The
// order code alone is NOT treated as sufficient "auth": it's only 6 digits
// (~900k combinations), so without a second factor anyone could script a
// loop against this endpoint and scrape every customer's name, email,
// phone and address. Requiring the code AND the exact customer email
// (stashed in localStorage by CartCheckoutModal right before the Mercado
// Pago redirect — see PaymentResultModal.tsx) mirrors the standard
// "order number + email" pattern most stores use, without needing any new
// infrastructure. A code/email mismatch returns the same generic 404 as a
// nonexistent code, so this endpoint can't be used to test which codes are
// valid either.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  if (!/^HALO-\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Código de orden inválido.' });
  }

  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  if (!email) {
    // Same generic message as "not found" — don't give an attacker a way
    // to distinguish "wrong email" from "no such order".
    return res.status(404).json({ error: 'Orden no encontrada.' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'No disponible.' });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_code', code)
    .single();

  if (error || !data || String(data.customer_email || '').trim().toLowerCase() !== email) {
    return res.status(404).json({ error: 'Orden no encontrada.' });
  }

  return res.status(200).json({ order: data });
}
