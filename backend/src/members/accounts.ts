import { randomUUID } from 'crypto'
import { ManagedMember, Member } from './models'
import { ValidationError } from './repository'
import { supabaseAdmin, supabaseLogin } from './supabase'

export const profileColumns = 'id, username, name, role, active, created_at'
export const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,31}$/
export function normalizeUsername(value: unknown): string {
  if (typeof value !== 'string' || !usernamePattern.test(value.trim().toLowerCase())) {
    throw new ValidationError('Use 3–32 letters, numbers, dots, underscores or hyphens for the username. Start with a letter or number.')
  }
  return value.trim().toLowerCase()
}
export function validatePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128 || !value.trim()) {
    throw new ValidationError('Choose a password between 12 and 128 characters.')
  }
  return value
}
// Supabase password auth requires an email identifier. These reserved, non-deliverable
// aliases are internal only; members enter their username and admins reset passwords.
export const accountEmail = (username: string) => `${username}@members.caesar.invalid`
export const asMember = (profile: ManagedMember): Member => ({ id: profile.id, name: profile.name, username: profile.username, role: profile.role, provider: 'supabase' })

export interface AuthenticatedAccount { member: Member; sessionEpoch?: string }
export async function authenticateAccount(username: string, password: string): Promise<AuthenticatedAccount | null> {
  let normalized: string
  try { normalized = normalizeUsername(username) } catch { return null }
  const admin = supabaseAdmin()
  const { data: before, error: beforeError } = await admin.from('caesar_profiles').select('id, session_epoch').eq('username', normalized).maybeSingle()
  if (beforeError) throw beforeError
  const client = supabaseLogin()
  const { data, error } = await client.auth.signInWithPassword({ email: accountEmail(normalized), password })
  if (error) {
    if (error.status && error.status >= 500) throw new Error('Authentication unavailable.')
    return null
  }
  if (!data.user || !data.session) return null
  // The app owns a revocable database session; Supabase tokens never reach the browser.
  await client.auth.signOut({ scope: 'local' })
  const { data: profile, error: profileError } = await admin.from('caesar_profiles').select(`${profileColumns}, session_epoch`).eq('id', data.user.id).maybeSingle()
  if (profileError) throw profileError
  return profile?.active && before?.id === profile.id && before?.session_epoch === profile.session_epoch
    ? { member: asMember(profile as ManagedMember), sessionEpoch: profile.session_epoch } : null
}
export async function listAccounts(): Promise<ManagedMember[]> {
  const { data, error } = await supabaseAdmin().from('caesar_profiles').select(profileColumns).order('username').limit(1000)
  if (error) throw error
  return data as ManagedMember[]
}
export async function createAccount(input: unknown, role: 'admin' | 'member' = 'member'): Promise<void> {
  const body = input as Record<string, unknown> | null
  const username = normalizeUsername(body?.username)
  const password = validatePassword(body?.password)
  if (typeof body?.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) throw new ValidationError('Enter a display name of 1–100 characters.')
  const admin = supabaseAdmin()
  const { data, error } = await admin.auth.admin.createUser({
    email: accountEmail(username), password, email_confirm: true,
    app_metadata: { caesar_workspace: true, caesar_username: username, caesar_name: body.name.trim(), caesar_role: role },
  })
  if (error) {
    if (['email_exists', 'user_already_exists'].includes(error.code || '')) throw new ValidationError('That username is already in use.')
    if (error.code === 'weak_password') throw new ValidationError('Supabase rejected this password. Choose a stronger password.')
    throw new Error('Account creation failed. Check the database migration and Supabase Auth configuration.')
  }
  const profile = data.user && await admin.from('caesar_profiles').select('id').eq('id', data.user.id).maybeSingle()
  if (!profile?.data || profile.error) {
    throw new Error('Auth account created, but its workspace profile is unavailable. Apply all migrations in supabase/migrations, including 202609280001_profile_provisioning.sql, before retrying.')
  }
}
export async function updateAccount(id: string, input: unknown): Promise<void> {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new ValidationError('Invalid user ID.')
  const body = input as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('Invalid account change.')
  const keys = Object.keys(body)
  if (keys.length !== 1 || !['password', 'active'].includes(keys[0])) throw new ValidationError('Choose either a password reset or an access change.')
  if ('password' in body) validatePassword(body.password)
  if ('active' in body && typeof body.active !== 'boolean') throw new ValidationError('Invalid account status.')
  const admin = supabaseAdmin()
  const { data: target, error } = await admin.from('caesar_profiles').select(profileColumns).eq('id', id).maybeSingle()
  if (error) throw error
  if (!target || target.role !== 'member') throw new ValidationError('Only member accounts can be changed here.')
  // New random epoch invalidates every previous session, even across server instances.
  // The trigger changes the epoch on every profile update.
  const { error: updateError } = await admin.from('caesar_profiles').update('active' in body ? { active: body.active } : { session_epoch: randomUUID() }).eq('id', id)
  if (updateError) throw updateError
  if ('password' in body) {
    const { error: resetError } = await admin.auth.admin.updateUserById(id, { password: body.password as string })
    if (resetError) throw new ValidationError('Password was not changed. Choose a different password and try again. Existing sessions have been signed out.')
    // Also invalidate logins that raced with the password change.
    const { error: revokeError } = await admin.from('caesar_profiles').update({ session_epoch: randomUUID() }).eq('id', id)
    if (revokeError) throw new Error('Password changed, but session revocation failed. Disable this account and retry.')
  }
}
