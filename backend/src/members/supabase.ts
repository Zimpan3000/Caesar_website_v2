import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const memberProvider = process.env.MEMBERS_PROVIDER || (process.env.NODE_ENV === 'production' ? 'supabase' : 'local')
if (!['local', 'supabase'].includes(memberProvider)) throw new Error('MEMBERS_PROVIDER must be local or supabase.')
export const usesSupabase = memberProvider === 'supabase'
if (!usesSupabase && process.env.NODE_ENV === 'production' && !process.env.MEMBER_PASSWORD_HASH) {
  throw new Error('Production local mode requires MEMBER_PASSWORD_HASH. The prototype password is development-only.')
}

const url = process.env.SUPABASE_URL || ''
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY || ''
const secretKey = process.env.SUPABASE_SECRET_KEY || ''
if (usesSupabase && (!url || !publicKey || !secretKey)) {
  throw new Error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in backend/.env.local or the server environment. See SUPABASE.md.')
}
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
let service: SupabaseClient | undefined
export function supabaseAdmin(): SupabaseClient {
  if (!usesSupabase) throw new Error('Supabase is not configured.')
  // Never sign in with this client: it must retain its server-only service credentials.
  return service ||= createClient(url, secretKey, options)
}
export function supabaseLogin() { return createClient(url, publicKey, options) }
