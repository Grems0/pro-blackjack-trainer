import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://plfwygdldijodcftejtl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZnd5Z2RsZGlqb2RjZnRlanRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjY1MjksImV4cCI6MjA5ODI0MjUyOX0.xuJurbBPwndZYaOeJtfjH20h9Y0txgr286SHgiQH9aQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Hash password with SHA-256 (Web Crypto API — dispo dans tous les navigateurs)
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
