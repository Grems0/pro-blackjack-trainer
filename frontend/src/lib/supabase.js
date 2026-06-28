import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://plfwygdldijodcftejt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WyEIYdUfcyEwu3voir6v1g_fls_9FE8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Hash password with SHA-256 (Web Crypto API — dispo dans tous les navigateurs)
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
