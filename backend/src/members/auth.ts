import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { Member } from './models'
import { authenticateAccount, AuthenticatedAccount, asMember, profileColumns } from './accounts'
import { supabaseAdmin, usesSupabase } from './supabase'

const cookieName = 'caesar_member'
const lifetime = 12 * 60 * 60 * 1000
const sessions = new Map<string, { member: Member; expires: number }>()
const attempts = new Map<string, { count: number; reset: number }>()
// Server-only scrypt hash for the requested prototype account. Override through
// environment variables, or replace this provider with a real identity service.
const prototypeHash = 'a2a7fe88ca7305b737622766bcc7436a:33144f988f911c72a9dd0d5d81f19609df280b54ed555049275ae9795d23792d00fa584e721296d57d9a9073bdb725e2024252316dff66bf87df1ab40bf8246f'
export const authProvider = {
  async authenticate(username: string, password: string): Promise<AuthenticatedAccount | null> {
    if (usesSupabase) return authenticateAccount(username, password)
    const [salt, encoded] = (process.env.MEMBER_PASSWORD_HASH || prototypeHash).split(':')
    if (!salt || !/^[a-f0-9]{128}$/i.test(encoded || '')) throw new Error('Invalid member password hash configuration')
    const actual = await new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key)))
    const valid = timingSafeEqual(actual, Buffer.from(encoded, 'hex'))
    return valid && username === (process.env.MEMBER_USERNAME || 'admin') ? { member: { id: 'admin', name: 'Admin', username, role: 'admin', provider: 'local' } } : null
  },
}
function token(req: Request) {
  return req.headers.cookie?.split(';').map(item => item.trim()).find(item => item.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
}
function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/api/members' }
}
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex')
export async function currentMember(req: Request): Promise<Member | null> {
  const id = token(req)
  if (!id || !/^[a-f0-9]{64}$/.test(id)) return null
  if (usesSupabase) {
    const admin = supabaseAdmin()
    const { data: session, error } = await admin.from('caesar_sessions').select('user_id, session_epoch, expires_at').eq('token_hash', hashToken(id)).maybeSingle()
    if (error) throw error
    if (!session || Date.parse(session.expires_at) <= Date.now()) return null
    const { data: profile, error: profileError } = await admin.from('caesar_profiles').select(`${profileColumns}, session_epoch`).eq('id', session.user_id).maybeSingle()
    if (profileError) throw profileError
    return profile?.active && profile.session_epoch === session.session_epoch ? asMember(profile) : null
  }
  const session = id ? sessions.get(id) : undefined
  if (!session) return null
  if (session.expires <= Date.now()) { sessions.delete(id!); return null }
  return session.member
}
export async function requireMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await currentMember(req)
    if (!member) { res.status(401).json({ error: 'Your session has ended. Please sign in again.' }); return }
    res.locals.member = member
    next()
  } catch { res.status(503).json({ error: 'The members service is unavailable. Please try again.' }) }
}
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.member?.role !== 'admin') { res.status(403).json({ error: 'Administrator access is required.' }); return }
  next()
}
export async function startSession(req: Request, res: Response, account: AuthenticatedAccount) {
  await endSession(req, res)
  const id = randomBytes(32).toString('hex')
  if (usesSupabase) {
    const { error } = await supabaseAdmin().from('caesar_sessions').insert({ token_hash: hashToken(id), user_id: account.member.id, session_epoch: account.sessionEpoch, expires_at: new Date(Date.now() + lifetime).toISOString() })
    if (error) throw error
  } else sessions.set(id, { member: account.member, expires: Date.now() + lifetime })
  res.cookie(cookieName, id, { ...cookieOptions(), maxAge: lifetime })
}
export async function endSession(req: Request, res: Response) {
  const id = token(req)
  if (id && /^[a-f0-9]{64}$/.test(id)) {
    if (usesSupabase) {
      const { error } = await supabaseAdmin().from('caesar_sessions').delete().eq('token_hash', hashToken(id))
      if (error) throw error
    } else sessions.delete(id)
  }
  res.clearCookie(cookieName, cookieOptions())
}
export function limitLogin(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown'
  const now = Date.now()
  const record = attempts.get(key)
  if (record && record.reset > now && record.count >= 15) {
    res.setHeader('Retry-After', Math.ceil((record.reset - now) / 1000))
    res.status(429).json({ error: 'Too many sign-in attempts. Please try again in 15 minutes.' }); return
  }
  attempts.set(key, { count: record && record.reset > now ? record.count + 1 : 1, reset: record && record.reset > now ? record.reset : now + 15 * 60 * 1000 })
  next()
}
const cleanup = setInterval(() => {
  for (const [key, value] of sessions) if (value.expires <= Date.now()) sessions.delete(key)
  for (const [key, value] of attempts) if (value.reset <= Date.now()) attempts.delete(key)
}, 60_000)
cleanup.unref()
