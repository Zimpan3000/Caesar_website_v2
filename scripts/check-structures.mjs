import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
const errors = []
await mkdir('artifacts', { recursive: true })
try {
  for (const [width, height] of [[1440, 1000], [1280, 800], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    const drawing = page.getByRole('complementary', { name: 'Phobos vehicle architecture' })
    assert.equal(await drawing.count(), 0)
    await page.getByRole('button', { name: 'Visa STRUCTURES', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.vehicle-architecture').getAttribute('aria-hidden') === 'false')
    await page.waitForTimeout(2350)
    assert.equal(await drawing.locator('.architecture-detail:visible').count(), 0)
    assert.equal(await drawing.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), 0, 'Default view should settle completely')
    assert.equal(await page.locator('.avionics').getAttribute('aria-hidden'), 'true')
    assert.equal(await page.locator('.hybrid-propulsion').getAttribute('aria-hidden'), 'true')
    const geometry = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
      return { copy: bounds('.callout-structures'), drawing: bounds('.vehicle-architecture'), navigation: bounds('.rocket-progress'),
        center: new DOMMatrix(getComputedStyle(document.querySelector('.rocket-image')).transform).m41 }
    })
    assert.equal(geometry.center, 0)
    if (width > 900) {
      assert.ok(geometry.copy.right < width / 2)
      assert.ok(geometry.drawing.left > width / 2 + 95)
      assert.ok(geometry.drawing.right < geometry.navigation.left)
    } else assert.ok(geometry.drawing.bottom < geometry.copy.top, 'Cutaway overlaps Structures copy')
    await page.screenshot({ path: `artifacts/structures-default-${width}.png` })
    for (const [name, text] of [['Aerodynamics: nose cone', '2–3 CALIBERS'], ['Recovery', 'RECOVERY // DEPLOYMENT SEQUENCE'], ['Payload', '4 × POCKETSAT'], ['Electronics bay', 'RF TRANSPARENT']]) {
      const button = drawing.getByRole('button', { name, exact: true })
      await button.click()
      await page.mouse.move(0, 0)
      await page.waitForTimeout(450)
      assert.equal(await button.getAttribute('aria-expanded'), 'true')
      assert.equal(await drawing.locator('.architecture-detail:visible').count(), 1)
      assert.equal(await drawing.getByText(text, { exact: true }).isVisible(), true)
      const detail = await drawing.locator('.architecture-detail:visible').boundingBox()
      assert.ok(detail.x >= 0 && detail.x + detail.width <= width && detail.y + detail.height < height - 60, 'Clipped annotation')
      if (width <= 900) assert.ok(detail.y + detail.height < geometry.copy.y, `${name} overlaps mobile copy`)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (name === 'Payload') {
        assert.equal(await drawing.locator('.architecture-cube').count(), 4)
        for (const value of ['50 × 50 × 50 mm', '250 g // EACH', 'NON-DEPLOYABLE']) assert.equal(await drawing.getByText(value, { exact: true }).isVisible(), true)
      }
      if (name === 'Electronics bay') {
        assert.deepEqual(await drawing.locator('.architecture-requirements li').allTextContents(), ['RF TRANSPARENT', 'PRESSURE EQUALIZATION', 'THERMAL PROTECTION', 'CABLE MANAGEMENT'])
      }
      if (name === 'Recovery' && (width === 1440 || width === 320)) {
        const mechanism = drawing.locator(width > 900 ? '.recovery-mechanical--wide' : '.recovery-mechanical--compact')
        assert.equal(await mechanism.locator('.recovery-main').evaluate(node => getComputedStyle(node).opacity), '0')
        await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)).opacity === '1', width > 900 ? '.recovery-mechanical--wide .recovery-main' : '.recovery-mechanical--compact .recovery-main')
        assert.equal(await mechanism.locator('.recovery-top').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m42), -7)
        assert.equal(await mechanism.locator('.recovery-bolt--left').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m41), -5)
        await page.screenshot({ path: `artifacts/structures-recovery-complete-${width}.png` })
        const previous = await mechanism.elementHandle()
        await button.click()
        assert.equal(await mechanism.evaluate((node, previous) => node === previous, previous), false, 'Recovery click should replay the mechanism')
        assert.equal(await button.getAttribute('aria-expanded'), 'true')
      }
      await page.screenshot({ path: `artifacts/structures-${name.split(':')[0].toLowerCase().replaceAll(' ', '-')}-${width}.png` })
      await button.press('Escape')
      assert.equal(await drawing.locator('.architecture-detail:visible').count(), 0)
    }
    const payload = drawing.getByRole('button', { name: 'Payload', exact: true })
    await payload.hover()
    assert.equal(await payload.getAttribute('aria-expanded'), 'true')
    await page.mouse.move(0, 0)
    assert.equal(await payload.getAttribute('aria-expanded'), 'false')
    await payload.focus()
    await payload.press('Enter')
    assert.equal(await payload.getAttribute('aria-expanded'), 'true')
    await payload.press('Escape')
    await page.getByRole('button', { name: 'Visa MARKETING', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.vehicle-architecture').getAttribute('aria-hidden') === 'true')
    assert.equal(await page.locator('.vehicle-architecture button:not([tabindex="-1"])').count(), 0)
    await page.getByRole('button', { name: 'Visa STRUCTURES', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.vehicle-architecture').getAttribute('aria-hidden') === 'false')
    assert.equal(await drawing.locator('.architecture-detail:visible').count(), 0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(200)
    const recovery = drawing.getByRole('button', { name: 'Recovery', exact: true })
    await recovery.scrollIntoViewIfNeeded()
    await recovery.click()
    assert.equal(await drawing.evaluate(node => node.getAnimations({ subtree: true }).length), 0)
    assert.equal(await drawing.locator('.recovery-main').first().evaluate(node => getComputedStyle(node).opacity), '1')
    await page.screenshot({ path: `artifacts/structures-reduced-${width}.png` })
    console.log(`PASS ${width}px: layout, all four views, supplied payload details, recovery replay, keyboard, reduced motion`)
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log('PASS no browser errors')
} finally { await browser.close() }
