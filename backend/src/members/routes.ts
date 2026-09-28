import { Router } from 'express'
import { authProvider, currentMember, endSession, limitLogin, requireAdmin, requireMember, startSession } from './auth'
import { FileMembersRepository, ValidationError } from './repository'
import { Entity } from './models'
import { usesSupabase } from './supabase'
import { SupabaseMembersRepository } from './supabase-repository'
import { createAccount, listAccounts, updateAccount } from './accounts'

export const membersRouter = Router()
const repository = usesSupabase ? new SupabaseMembersRepository() : new FileMembersRepository()
membersRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  // Custom header + no cross-origin CORS allowance prevents cross-site writes.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Caesar-Client') !== 'members') {
    res.status(403).json({ error: 'Invalid request origin.' }); return
  }
  next()
})
membersRouter.post('/auth/login', limitLogin, async (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 200 || password.length > 1024) { res.status(400).json({ error: 'Enter your username and password.' }); return }
  try {
    const account = await authProvider.authenticate(username, password)
    if (!account) { res.status(401).json({ error: 'Incorrect username or password.' }); return }
    await startSession(req, res, account)
    res.json({ member: account.member })
  } catch { res.status(503).json({ error: 'Sign-in is temporarily unavailable.' }) }
})
membersRouter.get('/auth/session', async (req, res) => {
  try { res.json({ member: await currentMember(req) }) }
  catch { res.status(503).json({ error: 'The members service is unavailable. Please try again.' }) }
})
membersRouter.post('/auth/logout', async (req, res) => {
  try { await endSession(req, res); res.status(204).end() }
  catch { res.status(503).json({ error: 'Sign-out could not be completed. Please try again.' }) }
})
membersRouter.use(requireMember)
membersRouter.use('/users', requireAdmin, (_req, res, next) => {
  if (!usesSupabase) { res.status(503).json({ error: 'User management requires Supabase. Complete the setup in SUPABASE.md.' }); return }
  next()
})
membersRouter.get('/users', async (_req, res) => {
  try { res.json({ users: await listAccounts() }) }
  catch { res.status(503).json({ error: 'Accounts could not be loaded. Please try again.' }) }
})
membersRouter.post('/users', async (req, res) => {
  try { await createAccount(req.body); res.status(201).json({ saved: true }) }
  catch (error) { res.status(error instanceof ValidationError ? 400 : 503).json({ error: error instanceof ValidationError ? error.message : 'Account creation failed. Check the Supabase configuration and try again.' }) }
})
membersRouter.patch('/users/:id', async (req, res) => {
  try { await updateAccount(req.params.id, req.body); res.json({ saved: true }) }
  catch (error) { res.status(error instanceof ValidationError ? 400 : 503).json({ error: error instanceof ValidationError ? error.message : 'The account change could not be completed. Reload the account list before retrying.' }) }
})
membersRouter.get('/workspace', async (_req, res) => {
  try { res.json(await repository.read()) }
  catch { res.status(503).json({ error: 'Workspace data could not be loaded. Please try again.' }) }
})
membersRouter.all('/:entity/:id?', async (req, res) => {
  const entity = req.params.entity as Entity
  if (!['teams', 'projects', 'goals', 'updates', 'entries'].includes(entity)) { res.status(404).json({ error: 'Not found.' }); return }
  if (!(req.method === 'POST' && !req.params.id) && !(['PUT', 'DELETE'].includes(req.method) && req.params.id)) { res.status(405).json({ error: 'Method not allowed.' }); return }
  try { res.json(req.method === 'DELETE' ? await repository.remove(entity, req.params.id, res.locals.member.name) : await repository.save(entity, req.body, res.locals.member.name, req.params.id)) }
  catch (error) { res.status(error instanceof ValidationError ? 400 : 503).json({ error: error instanceof ValidationError ? error.message : 'Changes could not be saved. Please try again.' }) }
})
