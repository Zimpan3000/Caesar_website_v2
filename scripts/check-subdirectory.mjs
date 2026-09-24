import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../frontend/dist/', import.meta.url))
const html = await readFile(path.join(root, 'index.html'), 'utf8')
assert.match(html, /src="\/new\/assets\/[^" ]+\.js"/)
assert.match(html, /href="\/new\/assets\/[^" ]+\.css"/)
assert.match(html, /href="\/new\/assets\/inter-variable\.woff2"/)
assert.equal(await readFile(path.join(root, '.htaccess'), 'utf8'),
  await readFile(new URL('../frontend/public/.htaccess', import.meta.url), 'utf8'))

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2' }

// Model the subdirectory fallback using actual build files. This is not an
// Apache configuration test; live .htaccess support must be checked on the host.
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname
  if (pathname === '/new') { res.writeHead(302, { Location: '/new/' }); res.end(); return }
  if (!pathname.startsWith('/new/')) { res.writeHead(404); res.end(); return }
  const relative = decodeURIComponent(pathname.slice('/new/'.length))
  const filename = path.resolve(root, relative || 'index.html')
  if (!filename.startsWith(root) || relative.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(404); res.end(); return
  }
  try {
    if ((await stat(filename)).isFile()) {
      res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' })
      res.end(await readFile(filename))
      return
    }
  } catch { /* Unknown app routes fall back to index.html below. */ }
  if (/^(assets|data)(\/|$)/.test(relative)) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(html)
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
let browser
try {
  browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  const badResponses = []
  const escapedRequests = []
  const requests = new Set()
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.url().startsWith(origin) && response.status() >= 400) badResponses.push(response.url())
  })
  page.on('request', request => {
    if (!request.url().startsWith(origin)) return
    const pathname = new URL(request.url()).pathname
    requests.add(pathname)
    if (!pathname.startsWith('/new/') && pathname !== '/favicon.ico') escapedRequests.push(pathname)
  })

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 })
    await page.goto(`${origin}/new/`, { waitUntil: 'networkidle' })
    await page.locator('.archive-project').waitFor()
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('.archive-project-name').textContent(), 'Deimos')
    assert.equal(await page.locator('.archive-project').getAttribute('href'), 'https://caesar.se/projekt/deimos/')
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => {
      image.loading = 'eager'
      return image.decode()
    })))
    await page.evaluate(() => document.fonts.ready)
    const assets = await page.locator('img, image').evaluateAll(images => images.map(image =>
      image instanceof HTMLImageElement ? image.currentSrc : image.href.baseVal))
    for (const asset of assets) assert.ok(new URL(asset, origin).pathname.startsWith('/new/assets/'), asset)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.equal(await page.locator('.brand').first().getAttribute('href'), '/new/')

    if (width <= 900) await page.locator('.menu-toggle').click()
    await page.locator('.nav-main-links a[href="/new/ga-med-i-caesar/"]').click()
    await page.waitForURL('**/new/ga-med-i-caesar/')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Bli medlem | CAESAR')
    assert.equal(await page.locator('.membership-back').getAttribute('href'), '/new/')
    assert.equal(await page.locator('.membership-copy .button').count(), 2)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    if (width <= 900) await page.locator('.menu-toggle').click()
    if (width <= 900) await page.locator('.project-toggle').click()
    else await page.locator('.project-toggle').hover()
    await page.locator('.project-heading').click()
    await page.waitForURL('**/new/#projekt')
    await page.waitForFunction(() => Math.abs(document.getElementById('projekt')?.getBoundingClientRect().top ?? Infinity) < 250)
    console.log(`PASS ${width}px: assets, font, project data, membership refresh and navigation`)
    if (width <= 900) await page.locator('.menu-toggle').click()
    if (width <= 900) await page.locator('.home-toggle').click()
    else await page.locator('.home-toggle').hover()
    assert.equal(await page.locator('.home-destinations a').count(), 11)
    await page.locator('.home-destinations').getByRole('link', { name: 'Partners', exact: true }).click()
    await page.waitForURL(`${origin}/new/#partners`)
    await page.waitForFunction(() => Math.abs(document.getElementById('partners').getBoundingClientRect().top) < 200)
  }

  await page.goto(`${origin}/new/ga-med-i-caesar`, { waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Bli medlem | CAESAR')
  await page.goto(`${origin}/new/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => { window.__routeMarker = true })
  await page.locator('.menu-toggle').click()
  await page.locator('.project-toggle').click()
  await page.locator('.project-destinations').getByRole('link', { name: 'Electronics', exact: true }).click()
  await page.waitForURL(`${origin}/new/electronics`)
  assert.equal(await page.evaluate(() => window.__routeMarker), true, 'Electronics CTA reloaded the page')
  assert.equal(await page.title(), 'Electronics · Phobos | CAESAR')
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('.electronics-page').count(), 1)
  await page.locator('.menu-toggle').click()
  await page.locator('.project-toggle').click()
  await page.locator('.project-destinations').getByRole('link', { name: 'Propulsion', exact: true }).click()
  await page.waitForURL(`${origin}/new/propulsion`)
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Propulsion · Phobos | CAESAR')
  await page.locator('.menu-toggle').click()
  await page.locator('.project-toggle').click()
  await page.locator('.project-destinations').getByRole('link', { name: 'Structures', exact: true }).click()
  await page.waitForURL(`${origin}/new/structures`)
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Structures · Phobos | CAESAR')
  await page.locator('.menu-toggle').click()
  await page.locator('.project-toggle').click()
  await page.locator('.project-destinations').getByRole('link', { name: 'Marketing', exact: true }).click()
  await page.waitForURL(`${origin}/new/marketing`)
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Marketing · Phobos | CAESAR')
  await page.locator('.marketing-browser img').evaluate(async image => { image.loading = 'eager'; await image.decode() })
  assert.ok((await page.locator('.marketing-browser img').getAttribute('src')).startsWith('/new/assets/'))
  await page.locator('#engineering-stories').getByRole('link', { name: 'Explore Structures', exact: true }).click()
  await page.waitForURL(`${origin}/new/structures`)
  await page.locator('.structures-crosslinks').getByRole('link', { name: 'Explore Propulsion', exact: true }).click()
  await page.waitForURL(`${origin}/new/propulsion`)
  await page.locator('.propulsion-closing').getByRole('link', { name: 'Explore Electronics', exact: true }).click()
  await page.waitForURL(`${origin}/new/electronics`)
  await page.getByRole('link', { name: 'Explore the Phobos project', exact: true }).click()
  await page.waitForURL(`${origin}/new/#projekt`)
  await page.waitForFunction(() => Math.abs(document.getElementById('projekt')?.getBoundingClientRect().top ?? Infinity) < 250)
  await page.goto(`${origin}/new/projekt/phobos`, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('.rocket-experience').count(), 1, 'Preserve existing unknown-route homepage fallback')
  await page.route('https://caesar.se/projekt/deimos/', route => route.fulfill({
    contentType: 'text/html', body: '<h1>Existing WordPress Deimos page</h1>',
  }))
  await page.goto(`${origin}/new/projects/deimos`)
  await page.waitForURL('https://caesar.se/projekt/deimos/')
  assert.equal((await fetch(`${origin}/new/assets/missing.js`)).status, 404)
  assert.equal((await fetch(`${origin}/api/projects`)).status, 404)
  assert.ok(requests.has('/new/data/projects.json'))
  assert.ok(requests.has('/new/assets/inter-variable.woff2'))
  assert.deepEqual(escapedRequests, [], 'App requests must stay under /new/')
  assert.deepEqual(badResponses, [], 'Production asset or data failures')
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS deep-link refresh, legacy redirect, scoped requests and no runtime errors')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
