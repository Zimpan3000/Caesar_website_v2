import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

// Set BROWSER_PATH to an installed Chromium/Chrome/Edge executable, or install
// Playwright Chromium with `npx playwright install chromium`.
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts', { recursive: true })
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const [width, height] of [[1440, 1000], [1280, 800], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height })
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.archive-project').waitFor()
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('.news-card').count(), 3)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    assert.equal(overflow, false, `Horizontal overflow at ${width}px`)
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate(image => image.decode())
    }
    const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src))
    assert.deepEqual(broken, [], `Broken images at ${width}px`)
    const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.filter(anchor => !document.getElementById(anchor.getAttribute('href').slice(1))).map(anchor => anchor.getAttribute('href')))
    assert.deepEqual(brokenAnchors, [])
    await page.evaluate(() => window.scrollTo(0, 0))
    const headingBounds = await page.locator('h1').boundingBox()
    assert.ok(headingBounds.x >= 0 && headingBounds.x + headingBounds.width <= width, `Clipped hero heading at ${width}px`)
    if (width <= 900) {
      const toggle = page.locator('.menu-toggle')
      assert.equal(await page.locator('#main-navigation').isVisible(), false)
      await toggle.click()
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('Escape')
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
      assert.equal(await toggle.evaluate(element => document.activeElement === element), true)
      await toggle.click()
      await page.getByRole('button', { name: 'Projekt', exact: true }).click()
      await page.locator('.project-heading').click()
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
      await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('is-scrolled'))
      await page.evaluate(() => window.scrollTo(0, 0))
    }
    await page.screenshot({ path: `artifacts/home-${width}.png`, fullPage: true })
    if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/hero-${width}.png` })
    console.log(`PASS ${width}px: layout, images, anchors, API${width <= 900 ? ', mobile menu' : ''}`)
  }
  await page.route('**/api/projects', route => route.fulfill({ status: 503, body: '{}' }))
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  assert.equal(await page.getByText('Projektlistan kunde inte laddas.', { exact: false }).count(), 1)
  assert.equal(await page.locator('.project-copy').getByRole('link', { name: 'Utforska Phobos', exact: true }).isVisible(), true)
  console.log('PASS project API failure: visible fallback and Phobos link')
  await page.unroute('**/api/projects')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.locator('#partners').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => !document.querySelector('#partners [data-reveal]').classList.contains('reveal-pending'))
  console.log('PASS scroll reveal')
  await page.route('https://caesar.se/projekt/deimos/', route => route.fulfill({ contentType: 'text/html', body: '<h1>Deimos</h1>' }))
  await page.goto(`${baseURL}/projects/deimos`)
  await page.waitForURL('https://caesar.se/projekt/deimos/')
  console.log('PASS preserved Deimos route')
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS no browser runtime errors')
} finally { await browser.close() }
