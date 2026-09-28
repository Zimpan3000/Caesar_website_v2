import { checkOrganization } from './check-organization-flows.mjs'
// Real migration/permissions in embedded PostgreSQL; local Auth/PostgREST test
// transport. No requests or mutations are sent to the hosted Supabase project.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { chromium, request } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const db = new PGlite()
const artifacts = path.join(root, 'artifacts', 'supabase')
await mkdir(artifacts, { recursive: true })
const children = new Set()
const clients = []
let browser
let mock
let failDatabase = false
let conflictNextSave = false
const passwords = new Map()
const secret = 'sb_secret_LOCAL_TEST_ONLY'
const publicKey = 'sb_publishable_LOCAL_TEST_ONLY'
const headers = { 'X-Caesar-Client': 'members' }
function start(script, args = [], extraEnv = {}) {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'test', MEMBERS_PROVIDER: 'supabase', SUPABASE_URL: mockURL, SUPABASE_PUBLISHABLE_KEY: publicKey, SUPABASE_SECRET_KEY: secret, PORT: '3118', ...extraEnv },
  })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  children.add(child)
  child.on('exit', () => children.delete(child))
  return { child, output: () => output }
}
async function finish(server) {
  const code = server.child.exitCode ?? await new Promise(resolve => server.child.once('exit', resolve))
  return { code, output: server.output() }
}
async function stop(server) { if (server.child.exitCode === null) { const ended = finish(server); server.child.kill(); await ended } }
async function ready(url, server) {
  for (let i = 0; i < 100; i++) {
    if (server.child.exitCode !== null) throw new Error(server.output())
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  throw new Error(`Server did not start: ${server.output()}`)
}
async function client() { const result = await request.newContext({ baseURL: apiURL, extraHTTPHeaders: headers }); clients.push(result); return result }
const apiURL = 'http://127.0.0.1:3118'
const baseURL = 'http://127.0.0.1:5188'
let mockURL
const userJSON = row => ({ id: row.id, email: row.email, aud: 'authenticated', role: 'authenticated', app_metadata: row.raw_app_meta_data, user_metadata: {}, created_at: new Date().toISOString() })
async function provision(email, password, metadata) {
  // Match hosted Auth: custom app_metadata arrives in an UPDATE after INSERT.
  const { rows } = await db.transaction(async tx => {
    const inserted = await tx.query('insert into auth.users (email) values ($1) returning id', [email])
    return tx.query('update auth.users set raw_app_meta_data = $1 where id = $2 returning *', [JSON.stringify(metadata), inserted.rows[0].id])
  })
  passwords.set(rows[0].id, password)
  return userJSON(rows[0])
}

try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text unique not null, raw_app_meta_data jsonb default '{}');`)
  await db.exec(await readFile(path.join(root, 'supabase/migrations/202609270001_members.sql'), 'utf8'))
  const recovered = await provision('recovered@members.caesar.invalid', 'Recovery-password-2026', { caesar_workspace: true, caesar_username: 'recovered', caesar_name: 'Recovered', caesar_role: 'admin' })
  assert.equal((await db.query('select * from caesar_profiles where id = $1', [recovered.id])).rows.length, 0, 'Original INSERT-only trigger misses hosted Auth metadata')
  const repair = await readFile(path.join(root, 'supabase/migrations/202609280001_profile_provisioning.sql'), 'utf8')
  await db.exec(repair)
  const recoveredProfile = (await db.query('select * from caesar_profiles where id = $1', [recovered.id])).rows[0]
  assert.equal(recoveredProfile.role, 'admin', 'Repair backfills existing accounts')
  await db.exec(repair)
  await db.query('update auth.users set raw_app_meta_data = raw_app_meta_data where id = $1', [recovered.id])
  assert.equal((await db.query('select session_epoch from caesar_profiles where id = $1', [recovered.id])).rows[0].session_epoch, recoveredProfile.session_epoch, 'Repeat repair and metadata updates preserve existing profiles and sessions')
  await db.query('delete from auth.users where id = $1', [recovered.id])
  console.log('PASS staged Auth metadata provisioning, existing-account repair and idempotency')
  assert.equal((await db.query('select * from caesar_profiles')).rows.length, 0)
  for (const role of ['anon', 'authenticated']) {
    for (const table of ['caesar_profiles', 'caesar_sessions', 'caesar_workspace']) {
      await assert.rejects(db.transaction(async tx => { await tx.exec(`set local role ${role}`); await tx.query(`select * from ${table}`) }), /permission denied/)
      await assert.rejects(db.transaction(async tx => { await tx.exec(`set local role ${role}`); await tx.query(`delete from ${table}`) }), /permission denied/)
    }
    await assert.rejects(db.transaction(async tx => { await tx.exec(`set local role ${role}`); await tx.query('select public.caesar_provision_profile()') }), /permission denied/)
  }
  const stranger = await provision('outsider@members.caesar.invalid', 'Outsider-password-2026', {})
  assert.equal((await db.query('select * from caesar_profiles where id = $1', [stranger.id])).rows.length, 0)
  console.log('PASS PostgreSQL migration, RLS/grants and unprovisioned account isolation')

  mock = createServer(async (req, res) => {
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' }); res.end(data === undefined ? undefined : JSON.stringify(data)) }
    try {
      const url = new URL(req.url, 'http://localhost')
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined
      if (url.pathname === '/auth/v1/token') {
        assert.equal(req.headers.apikey, publicKey)
        const { rows } = await db.query('select * from auth.users where email = $1', [body.email])
        const row = rows[0]
        if (!row || passwords.get(row.id) !== body.password) return send(400, { code: 'invalid_credentials', msg: 'Invalid login credentials' })
        const claims = Buffer.from(JSON.stringify({ sub: row.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')
        return send(200, { access_token: `eyJhbGciOiJIUzI1NiJ9.${claims}.test`, refresh_token: randomUUID(), token_type: 'bearer', expires_in: 3600, user: userJSON(row) })
      }
      if (url.pathname === '/auth/v1/logout') return send(204)
      if (url.pathname.startsWith('/auth/v1/admin/users')) {
        assert.equal(req.headers.apikey, secret)
        if (req.method === 'POST') {
          const existing = await db.query('select id from auth.users where email = $1', [body.email])
          if (existing.rows.length) return send(422, { code: 'email_exists', msg: 'Email already exists' })
          return send(200, await provision(body.email, body.password, body.app_metadata))
        }
        const id = url.pathname.split('/').pop()
        const { rows } = await db.query('select * from auth.users where id = $1', [id])
        if (!rows.length) return send(404, { msg: 'Not found' })
        passwords.set(id, body.password)
        return send(200, userJSON(rows[0]))
      }
      if (!url.pathname.startsWith('/rest/v1/')) return send(404, {})
      assert.equal(req.headers.apikey, secret, 'All database operations use the backend service key')
      if (failDatabase) return send(503, { message: 'Database unavailable' })
      const table = url.pathname.split('/').pop()
      assert.ok(['caesar_profiles', 'caesar_sessions', 'caesar_workspace'].includes(table))
      const ident = name => { assert.match(name, /^[a-z_]+$/); return `"${name}"` }
      const columns = url.searchParams.get('select') || '*'
      const select = columns === '*' ? '*' : columns.split(',').map(value => ident(value.trim())).join(',')
      const values = []
      const bind = value => { values.push(value); return `$${values.length}` }
      const predicates = []
      for (const [key, value] of url.searchParams) {
        if (['select', 'order', 'limit'].includes(key)) continue
        assert.ok(value.startsWith('eq.'))
        predicates.push(`${ident(key)} = ${bind(value.slice(3))}`)
      }
      const where = predicates.length ? ` where ${predicates.join(' and ')}` : ''
      if (conflictNextSave && req.method === 'PATCH' && table === 'caesar_workspace') {
        conflictNextSave = false
        await db.query('update caesar_workspace set revision = revision + 1 where id = 1')
        return send(200, [])
      }
      let sql
      if (['GET', 'HEAD'].includes(req.method)) sql = `select ${select} from ${table}${where}${url.searchParams.has('order') ? ' order by username' : ''}`
      else if (req.method === 'DELETE') sql = `delete from ${table}${where} returning *`
      else if (req.method === 'POST') {
        const keys = Object.keys(body)
        sql = `insert into ${table} (${keys.map(ident).join(',')}) values (${keys.map(key => bind(typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key])).join(',')}) returning *`
      } else if (req.method === 'PATCH') sql = `update ${table} set ${Object.entries(body).map(([key, value]) => `${ident(key)} = ${bind(typeof value === 'object' ? JSON.stringify(value) : value)}`).join(',')}${where} returning ${select}`
      else throw new Error('Unexpected REST operation')
      const { rows } = await db.transaction(async tx => { await tx.exec('set local role service_role'); return tx.query(sql, values) })
      if (req.method === 'HEAD') { res.setHeader('Content-Range', `0-${Math.max(0, rows.length - 1)}/${rows.length}`); return send(200) }
      if (req.headers.accept?.includes('application/vnd.pgrst.object+json')) {
        if (rows.length !== 1) return send(406, { code: 'PGRST116', message: 'Not exactly one row' })
        return send(200, rows[0])
      }
      return send(200, rows)
    } catch (error) { console.error('Local test transport:', error.message); send(500, { message: 'Local test transport error' }) }
  })
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve))
  mockURL = `http://127.0.0.1:${mock.address().port}`
  const bootstrapEnv = { BOOTSTRAP_ADMIN_USERNAME: 'captain', BOOTSTRAP_ADMIN_NAME: 'Captain', BOOTSTRAP_ADMIN_PASSWORD: 'Admin-password-2026' }
  let result = await finish(start('backend/dist/create-admin.js', [], bootstrapEnv))
  assert.equal(result.code, 0, result.output)
  result = await finish(start('backend/dist/create-admin.js', [], bootstrapEnv))
  assert.equal(result.code, 1)
  assert.match(result.output, /administrator already exists/)
  result = await finish(start('backend/dist/index.js', [], { SUPABASE_SECRET_KEY: '' }))
  assert.equal(result.code, 1)
  assert.match(result.output, /SUPABASE_SECRET_KEY/)
  console.log('PASS explicit administrator bootstrap, repeat protection and missing-key fail-closed behavior')

  let backend = start('backend/dist/index.js')
  await ready(`${apiURL}/api/members/auth/session`, backend)
  const admin = await client()
  const member = await client()
  const guest = await client()
  const login = (ctx, username, password) => ctx.post('/api/members/auth/login', { data: { username, password } })
  assert.equal((await guest.get('/api/members/users')).status(), 401)
  assert.equal((await login(guest, 'admin', '123')).status(), 401)
  assert.equal((await login(guest, 'outsider', 'Outsider-password-2026')).status(), 401)
  const signedIn = await login(admin, 'CAPTAIN', 'Admin-password-2026')
  assert.equal(signedIn.status(), 200, await signedIn.text())
  assert.match(signedIn.headers()['set-cookie'], /HttpOnly/)
  assert.match(signedIn.headers()['set-cookie'], /SameSite=Strict/)
  assert.equal((await signedIn.json()).member.role, 'admin')
  assert.doesNotMatch(await signedIn.text(), /sessionEpoch|access_token|refresh_token/)
  const create = input => admin.post('/api/members/users', { data: input })
  assert.equal((await create({ username: 'bad@name', name: 'Bad', password: 'Valid-password-2026' })).status(), 400)
  assert.equal((await create({ username: 'engineer', name: 'Engineer', password: 'short' })).status(), 400)
  assert.equal((await create({ username: 'Engineer', name: 'Engineer', password: 'Member-password-2026', role: 'admin' })).status(), 201)
  assert.equal((await create({ username: 'engineer', name: 'Duplicate', password: 'Member-password-2026' })).status(), 400)
  const users = (await (await admin.get('/api/members/users')).json()).users
  const engineer = users.find(user => user.username === 'engineer')
  const captain = users.find(user => user.username === 'captain')
  assert.equal(engineer.role, 'member')
  assert.doesNotMatch(JSON.stringify(users), /password|session_epoch/)
  assert.equal((await login(member, 'engineer', 'Member-password-2026')).status(), 200)
  assert.equal((await member.get('/api/members/users')).status(), 403)
  assert.equal((await member.post('/api/members/users', { data: { username: 'hacker' } })).status(), 403)
  assert.equal((await member.patch(`/api/members/users/${captain.id}`, { data: { password: 'Changed-password-2026' } })).status(), 403)
  assert.equal((await admin.patch(`/api/members/users/${captain.id}`, { data: { active: false } })).status(), 400)
  assert.equal((await admin.patch(`/api/members/users/${engineer.id}`, { data: { role: 'admin' } })).status(), 400)
  assert.equal((await admin.post('/api/members/users', { headers: { 'X-Caesar-Client': '' }, data: {} })).status(), 403)
  assert.equal((await member.get('/api/members/workspace')).status(), 200)
  const empty = await (await member.get('/api/members/workspace')).json()
  assert.deepEqual(empty.teams, [])
  const teamInput = { name: 'Avionics', description: 'Real team', members: ['Engineer'], projectId: '', status: 'Planned' }
  conflictNextSave = true
  const teamSave = await member.post('/api/members/teams', { data: teamInput })
  assert.equal(teamSave.status(), 200, await teamSave.text())
  assert.equal((await teamSave.json()).activity[0].actor, 'Engineer')
  assert.equal((await (await admin.get('/api/members/workspace')).json()).teams[0].name, 'Avionics')
  const concurrent = await Promise.all(['Structures', 'Propulsion'].map(name => member.post('/api/members/teams', { data: { ...teamInput, name } })))
  for (const response of concurrent) assert.equal(response.status(), 200)
  assert.equal((await (await member.get('/api/members/workspace')).json()).teams.length, 3)
  await stop(backend)
  backend = start('backend/dist/index.js')
  await ready(`${apiURL}/api/members/auth/session`, backend)
  assert.equal((await member.get('/api/members/workspace')).status(), 200, 'Database sessions survive restart')
  assert.equal((await (await admin.get('/api/members/workspace')).json()).teams.length, 3)
  console.log('PASS separate identities, admin/member authorization, shared data, concurrent writes and restart persistence')

  failDatabase = true
  assert.equal((await member.get('/api/members/workspace')).status(), 503)
  failDatabase = false
  assert.equal((await admin.patch(`/api/members/users/${engineer.id}`, { data: { password: 'Reset-password-2026' } })).status(), 200)
  assert.equal((await member.get('/api/members/workspace')).status(), 401)
  assert.equal((await login(member, 'engineer', 'Member-password-2026')).status(), 401)
  assert.equal((await login(member, 'engineer', 'Reset-password-2026')).status(), 200)
  assert.equal((await admin.patch(`/api/members/users/${engineer.id}`, { data: { active: false } })).status(), 200)
  assert.equal((await member.get('/api/members/workspace')).status(), 401)
  assert.equal((await login(member, 'engineer', 'Reset-password-2026')).status(), 401)
  assert.equal((await admin.patch(`/api/members/users/${engineer.id}`, { data: { active: true } })).status(), 200)
  assert.equal((await member.get('/api/members/workspace')).status(), 401, 'Old session must stay invalid after re-enable')
  assert.equal((await login(member, 'engineer', 'Reset-password-2026')).status(), 200)
  await member.post('/api/members/auth/logout')
  assert.equal((await member.get('/api/members/workspace')).status(), 401)
  console.log('PASS password reset, old-password rejection, session revocation, disable/re-enable, logout and database failure handling')

  const vite = start('node_modules/vite/bin/vite.js', ['frontend', '--host', '127.0.0.1', '--port', '5188', '--strictPort'], { API_PROXY_TARGET: apiURL })
  await ready(`${baseURL}/login`, vite)
  const installedBrowser = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(file => existsSync(file))
  browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || installedBrowser, headless: true })
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await adminContext.newPage()
  page.setDefaultTimeout(12000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${baseURL}/login`)
  await page.getByLabel('Username', { exact: true }).fill('captain')
  await page.getByLabel('Password', { exact: true }).fill('Admin-password-2026')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('link', { name: 'Users', exact: true }).click()
  await page.getByRole('heading', { name: 'Member accounts' }).waitFor()
  await page.getByLabel('Display name', { exact: true }).fill('UI Member')
  await page.getByLabel('Username', { exact: true }).fill('ui-member')
  await page.getByLabel('Password', { exact: true }).fill('Browser-password-2026')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Account created' }).waitFor()
  assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), '')
  await page.getByRole('button', { name: 'Reset password for ui-member', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('New password').fill('Browser-reset-2026')
  await dialog.getByRole('button', { name: 'Save password' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('status').filter({ hasText: 'Password changed' }).waitFor()
  await page.getByRole('button', { name: 'Disable ui-member', exact: true }).click()
  await page.getByRole('button', { name: 'Enable ui-member', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Enable ui-member', exact: true }).click()
  await page.getByRole('button', { name: 'Disable ui-member', exact: true }).waitFor()
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Users page overflow at ${width}`)
    await page.screenshot({ path: path.join(artifacts, `users-${width}.png`), fullPage: true })
  }
  const memberContext = await browser.newContext()
  const memberPage = await memberContext.newPage()
  memberPage.setDefaultTimeout(12000)
  memberPage.on('pageerror', error => errors.push(error.message))
  await memberPage.goto(`${baseURL}/login`)
  await memberPage.getByLabel('Username', { exact: true }).fill('ui-member')
  await memberPage.getByLabel('Password', { exact: true }).fill('Browser-reset-2026')
  await memberPage.getByRole('button', { name: 'Sign in', exact: true }).click()
  await memberPage.getByRole('heading', { name: 'Welcome back, UI Member.' }).waitFor()
  assert.equal(await memberPage.getByRole('link', { name: 'Users', exact: true }).count(), 0)
  await checkOrganization(memberPage, baseURL, 'supabase-organization', artifacts)
  await memberPage.goto(`${baseURL}/dashboard/users`)
  await memberPage.getByRole('heading', { name: 'Administrator access required' }).waitFor()
  await page.getByRole('button', { name: 'Disable ui-member', exact: true }).click()
  await page.getByRole('button', { name: 'Enable ui-member', exact: true }).waitFor()
  await memberPage.reload()
  await memberPage.waitForURL(`${baseURL}/login`)
  assert.deepEqual(errors, [])
  console.log('PASS browser account creation/reset/access changes, member restrictions, disabled-session redirect and responsive layouts')

  await db.query("update caesar_profiles set role = 'member' where id = $1", [captain.id])
  assert.equal((await admin.get('/api/members/users')).status(), 401, 'Role changes revoke existing sessions')
  const rawSessions = (await db.query('select token_hash from caesar_sessions')).rows
  const cookieTokens = (await admin.storageState()).cookies.map(cookie => cookie.value)
  assert.ok(rawSessions.every(row => /^[a-f0-9]{64}$/.test(row.token_hash) && !cookieTokens.includes(row.token_hash)))
  console.log('PASS live role changes and hashed session-token storage')
} catch (error) {
  for (const context of browser?.contexts() || []) {
    for (const [index, page] of context.pages().entries()) {
      console.error('Browser location at failure:', page.url())
      console.error((await page.locator('body').innerText().catch(() => '')).slice(-2500))
      await page.screenshot({ path: path.join(artifacts, `failure-${index}.png`), fullPage: true }).catch(() => undefined)
    }
  }
  throw error
} finally {
  await browser?.close()
  for (const ctx of clients) await ctx.dispose()
  for (const child of children) child.kill()
  if (mock) { mock.closeAllConnections(); await new Promise(resolve => mock.close(resolve)) }
  await db.close()
}
