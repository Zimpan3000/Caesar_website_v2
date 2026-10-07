import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { assertEnglishRoutes } from './assert-english-routes.mjs'

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
    await page.locator('.rocket-featured').waitFor()
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('#senaste, .news-card').count(), 0)
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
      await page.getByRole('button', { name: 'Projects', exact: true }).click()
      await page.locator('.project-destinations').getByRole('link', { name: 'All Projects', exact: true }).click()
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
      await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('is-scrolled'))
      await page.evaluate(() => window.scrollTo(0, 0))
    }
    await page.screenshot({ path: `artifacts/home-${width}.png`, fullPage: true })
    if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/hero-${width}.png` })
    console.log(`PASS ${width}px: layout, images, anchors${width <= 900 ? ', mobile menu' : ''}`)
  }
  for (const path of ['', 'partners/', 'projects/phobos/', 'electronics', 'propulsion', 'structures', 'marketing', 'join-us/', 'become-a-sponsor/', 'support-us/']) {
    await page.goto(`${baseURL.replace(/\/$/, '')}/${path}`, { waitUntil: 'networkidle' })
    assert.equal(await page.getByText(/deimos/i).count(), 0, `Removed project on ${path}`)
    const oldLinks = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => new URL(a.href)).filter(url => /^(www\.)?caesar\.se$/.test(url.hostname) && /^https?:$/.test(url.protocol) && !url.pathname.startsWith('/new/')).map(url => url.href))
    assert.deepEqual(oldLinks, [], `Old website links on ${path}`)
    assert.equal(await page.locator('.project-archive').count(), 0)
  }
  console.log('PASS all public pages: no removed project, archive or old website links')
  await assertEnglishRoutes(page, baseURL)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.locator('#partners').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => !document.querySelector('#partners [data-reveal]').classList.contains('reveal-pending'))
  console.log('PASS scroll reveal')
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS no browser runtime errors')
} finally { await browser.close() }
