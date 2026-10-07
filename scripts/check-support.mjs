import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const paymentURL = 'https://app.swish.nu/1/p/sw/?sw=1231145127&msg=G%C3%A5va'
const artifacts = 'artifacts/support'
await mkdir(artifacts, { recursive: true })
assert.deepEqual(await readFile('frontend/dist/assets/swish-qr.png'), await readFile('frontend/public/assets/swish-qr.png'), 'QR image is copied unchanged')
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', 'frontend', '--host', '127.0.0.1', '--port', '5196', '--strictPort'], { windowsHide: true, stdio: 'ignore' })
let browser
try {
  const previewBase = 'http://127.0.0.1:5196/new/'
  let ready = false
  for (let i = 0; i < 60; i++) {
    if (preview.exitCode !== null) throw new Error('Production preview failed to start')
    try { if ((await fetch(previewBase)).ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  assert.ok(ready)
  const installed = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
  browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || installed })
  for (const base of ['http://localhost:5173/', previewBase]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
    const errors = []
    const failures = []
    const localPaths = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => { if (response.url().startsWith(new URL(base).origin) && response.status() >= 400) failures.push(response.url()) })
    page.on('request', req => { if (req.url().startsWith(new URL(base).origin)) localPaths.push(new URL(req.url()).pathname) })
    await page.goto(base + 'join-us/')
    await page.evaluate(() => { window.supportNavigationMarker = 'same-document' })
    await page.locator('.nav-support').click()
    await page.waitForURL(base + 'support-us/')
    await page.getByRole('heading', { name: 'Support CAESAR with Swish', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.supportNavigationMarker), 'same-document', 'Support navigation stays inside the app')
    assert.equal(await page.locator('.nav-support').getAttribute('aria-current'), 'page')
    assert.equal(await page.title(), 'Support Us | CAESAR')
    const qr = page.locator('.support-qr img')
    const button = page.getByRole('link', { name: 'Open Swish', exact: true })
    for (const width of [1440, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await qr.evaluate(image => image.decode())
      assert.equal(await qr.evaluate(image => image.naturalWidth), 500)
      assert.equal(await qr.evaluate(image => image.naturalHeight), 500)
      assert.ok((await qr.getAttribute('src')).startsWith(new URL(base).pathname + 'assets/'))
      await page.getByText('123 114 51 27', { exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`)
      if (width <= 900) {
        assert.equal(await button.isVisible(), true)
        assert.equal(await button.getAttribute('href'), paymentURL)
        assert.equal(await button.getAttribute('target'), null, 'Payment opens directly in the same tab')
      } else assert.equal(await button.count(), 0, 'Desktop uses the prominent QR code')
      await page.screenshot({ path: `${artifacts}/${base === previewBase ? 'production' : 'development'}-${width}.png`, fullPage: true })
    }
    await page.locator('.support-back').click()
    await page.waitForURL(base)
    await page.goBack()
    await page.waitForURL(base + 'support-us/')
    await page.reload()
    await qr.evaluate(image => image.decode())
    await page.goto(base + 'support-us')
    await page.reload()
    await page.getByRole('heading', { name: 'Support CAESAR with Swish', exact: true }).waitFor()
    // Intercept the payment link; never contact Swish or initiate a real payment.
    await page.route('https://app.swish.nu/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Swish link verified</h1>' }))
    await button.click()
    await page.waitForURL(paymentURL)
    assert.deepEqual(errors, [])
    assert.deepEqual(failures, [])
    if (base === previewBase) assert.ok(localPaths.every(path => path.startsWith('/new/') || path === '/favicon.ico'), 'Built assets and routes stay under /new/')
    await page.close()
    console.log(`PASS ${base}: support navigation, QR image, exact Swish link, desktop/mobile layout, history, deep links and no errors`)
  }
} finally {
  await browser?.close()
  if (preview.exitCode === null) {
    const stopped = new Promise(resolve => preview.once('exit', resolve))
    preview.kill(); await stopped
  }
}
