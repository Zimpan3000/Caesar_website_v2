// Read-only checks against the configured hosted project. Never print credentials.
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

loadEnvFile(fileURLToPath(new URL('../backend/.env.local', import.meta.url)))
const env = process.env
for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY']) {
  if (!env[key]) { console.error(`FAIL Missing ${key}`); process.exit(1) }
}
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }) },
}
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, options)
const publicClient = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, options)
function check(ok, message, code) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${message}${code ? ` (${code})` : ''}`)
  if (!ok) process.exitCode = 1
}
try {
  check(env.MEMBERS_PROVIDER === 'supabase', 'Backend selects Supabase')
  // Use GET: HEAD responses can omit useful errors and row counts at the gateway.
  const schemas = {
    caesar_profiles: 'id,username,name,role,active,session_epoch,created_at',
    caesar_sessions: 'token_hash,user_id,session_epoch,expires_at',
    caesar_workspace: 'id,revision,data',
  }
  for (const [table, columns] of Object.entries(schemas)) {
    const { error } = await admin.from(table).select(columns).limit(0)
    check(!error, `${table}: required columns accessible`, error?.code)
    const denied = await publicClient.from(table).select(columns).limit(0)
    check(denied.error?.code === '42501', `${table}: public access denied`, denied.error?.code)
  }
  const workspace = await admin.from('caesar_workspace').select('data,revision').eq('id', 1).single()
  check(!workspace.error && ['teams', 'projects', 'goals', 'updates', 'entries', 'activity'].every(key => Array.isArray(workspace.data?.data?.[key])), 'Workspace singleton and data structure', workspace.error?.code)
  const profiles = await admin.from('caesar_profiles').select('id,username').eq('role', 'admin').eq('active', true)
  check(!profiles.error && profiles.data?.length > 0, 'Active administrator exists', profiles.error?.code)
  for (const profile of profiles.data || []) {
    const { data, error } = await admin.auth.admin.getUserById(profile.id)
    check(!error && !!data.user?.email_confirmed_at && data.user.email === `${profile.username}@members.caesar.invalid`, 'Administrator has a confirmed matching Auth account', error?.code)
  }
  const response = await options.global.fetch(`${env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY } })
  const settings = await response.json()
  check(response.ok && settings.disable_signup === true, 'Public signup disabled')
  check(response.ok && settings.external?.email === true, 'Email/password authentication enabled')
} catch {
  console.error('FAIL Hosted check could not complete. Check network access and server configuration.')
  process.exitCode = 1
}
