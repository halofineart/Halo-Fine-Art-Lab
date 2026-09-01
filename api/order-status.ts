// GET /api/order-status?code=HALO-123456
// Public, read-only lookup used by the post-payment return screen (safe for
// a logged-out shopper, since knowing the order code — which only the
// person who just placed it sees — is the "auth" here, same as any e-commerce
// order-confirmation link). Returns the full row so the client can build the
// same TrackedOrder shape used everywhere else (see src/lib/orderMapper.ts).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  if (!/^HALO-\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Código de orden inválido.' });
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

  if (error || !data) {
    return res.status(404).json({ error: 'Orden no encontrada.' });
  }

  return res.status(200).json({ order: data });
}
