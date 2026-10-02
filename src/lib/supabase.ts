import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY were configured at
 * build time. When false, `supabase` is `null` and the app still renders —
 * only the reports feature degrades with a clear error.
 *
 * IMPORTANT: do NOT throw at module scope here. A missing env var is visible
 * at build time, but throwing here crashes the entire entry chunk during
 * module evaluation, which blanks the whole page (the "blank site on Vercel"
 * bug). The env var is gitignored, so Vercel must have it configured in the
 * dashboard — but if it ever goes missing, the site keeps working.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;