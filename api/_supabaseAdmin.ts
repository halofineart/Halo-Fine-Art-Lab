// Server-only Supabase client used by the /api functions. Uses the SERVICE
// ROLE key, which bypasses Row Level Security entirely — this file must
// never be imported from client-side code, and SUPABASE_SERVICE_ROLE_KEY
// must never be prefixed with VITE_ (that would ship it to the browser).
import { createClient } from '@supabase/supabase-js';

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      `[_supabaseAdmin] Diagnostico: VITE_SUPABASE_URL ${url ? 'presente (len ' + url.length + ')' : 'FALTA'}, SUPABASE_SERVICE_ROLE_KEY ${serviceKey ? 'presente (len ' + serviceKey.length + ')' : 'FALTA'}.`
    );
    return null;
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
