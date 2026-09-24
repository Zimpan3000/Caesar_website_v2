import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
await mkdir('artifacts', { recursive: true })
const errors = []
try {
  for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1024], [390, 844], [320, 740], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}electronics/`, { waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Electronics · Phobos | CAESAR')
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    assert.equal(await page.locator('.electronics-requirements article').count(), 8)
    assert.equal(await page.locator('.euroc-grid li').count(), 13)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Page overflow at ${width}`)
    for (const figure of await page.locator('.electronics-page figure').all()) {
      const box = await figure.boundingBox()
      assert.ok(box.x >= 0 && box.x + box.width <= width, `Diagram clipped at ${width}`)
    }
    await page.screenshot({ path: `artifacts/electronics-${width}.png`, fullPage: true })
    if (width === 1440 || width === 390) {
      await page.locator('.electronics-hero').screenshot({ path: `artifacts/electronics-hero-${width}.png` })
      await page.locator('.is-detailed').screenshot({ path: `artifacts/electronics-architecture-${width}.png` })
    }
    await page.evaluate(() => { window.__electronicsNavigation = 'same-document' })
    await page.getByRole('link', { name: 'Explore the Phobos project', exact: true }).click()
    await page.waitForURL(`${base}#projekt`)
    await page.waitForFunction(() => Math.abs(document.getElementById('projekt')?.getBoundingClientRect().top ?? Infinity) < 250)
    assert.equal(await page.evaluate(() => window.__electronicsNavigation), 'same-document')
    await page.goBack()
    await page.locator('.electronics-page').waitFor()
    await page.goForward()
    await page.locator('.rocket-experience').waitFor()
    await page.getByRole('link', { name: 'Explore Electronics', exact: true }).click()
    await page.waitForURL(`${base}electronics`)
    assert.equal(await page.evaluate(() => window.__electronicsNavigation), 'same-document')
    await page.waitForFunction(() => document.activeElement === document.getElementById('main'))
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('.electronics-page').count(), 1)
    console.log(`PASS ${width} × ${height}: content, diagrams, layout, SPA navigation, history and refresh`)
    await page.close()
  }

  for (const [width, height] of [[1440, 1000], [1024, 768], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    const cta = page.locator('.electronics-cta')
    assert.equal(await cta.getAttribute('tabindex'), '-1')
    await page.getByRole('button', { name: 'Visa ELECTRONICS', exact: true }).click()
    await page.waitForTimeout(1500)
    const bounds = await cta.boundingBox()
    assert.ok(bounds.y >= 75 && bounds.y + bounds.height < height, `Homepage CTA clipped at ${width}`)
    assert.equal(await cta.getAttribute('tabindex'), '0')
    await page.screenshot({ path: `artifacts/electronics-cta-${width}.png` })
    await cta.click()
    await page.locator('.electronics-page').waitFor()
    await page.waitForFunction(() => window.scrollY === 0)
    const closing = page.locator('.electronics-closing')
    await closing.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    assert.equal(await closing.locator('[data-reveal]').evaluate(el => getComputedStyle(el).opacity), '1')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => document.querySelectorAll('.reveal-pending').length === 0)
    console.log(`PASS ${width}px: animated homepage CTA, reveal, live reduced motion`)
    await page.close()
  }
  assert.deepEqual(errors, [], 'Browser runtime errors')
} finally { await browser.close() }
