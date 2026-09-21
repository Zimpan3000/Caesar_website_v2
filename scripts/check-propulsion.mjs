import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts', { recursive: true })
const errors = []
try {
  for (const [width, height] of [[1440, 1000], [1280, 800], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    const drawing = page.getByRole('complementary', { name: 'Phobos hybrid propulsion architecture' })
    assert.equal(await drawing.count(), 0)
    await page.getByRole('button', { name: 'Visa PROPULSION', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.hybrid-propulsion').getAttribute('aria-hidden') === 'false')
    await page.waitForTimeout(1600)
    assert.equal(await drawing.locator('.hybrid-detail:visible').count(), 0)
    assert.equal(await page.getByText('235.98 s', { exact: true }).isVisible(), false)
    assert.equal(await page.locator('.avionics').getAttribute('aria-hidden'), 'true')
    const geometry = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
      return { copy: bounds('.callout-propulsion'), drawing: bounds('.hybrid-propulsion'), navigation: bounds('.rocket-progress'),
        center: new DOMMatrix(getComputedStyle(document.querySelector('.rocket-image')).transform).m41 }
    })
    assert.equal(geometry.center, 0)
    if (width > 900) {
      assert.ok(geometry.copy.right < width / 2, 'Copy must remain left of the centered rocket')
      assert.ok(geometry.drawing.left > width / 2 + 95)
      assert.ok(geometry.drawing.right < geometry.navigation.left)
    }
    await page.screenshot({ path: `artifacts/propulsion-default-${width}.png` })
    for (const [name, text] of [['OXIDIZER', 'LIQUID N2O // OXIDIZER'], ['FLUID SYSTEM', 'MAIN OXIDIZER VALVE'], ['COMBUSTION', 'HYBRID ENGINE'], ['PERFORMANCE', 'DESIGN PARAMETERS / INITIAL SIZING']]) {
      const button = drawing.getByRole('button', { name, exact: true })
      await button.click()
      await page.mouse.move(0, 0)
      await page.waitForTimeout(300)
      assert.equal(await button.getAttribute('aria-expanded'), 'true')
      assert.equal(await drawing.locator('.hybrid-detail:visible').count(), 1)
      assert.equal(await drawing.getByText(text, { exact: true }).isVisible(), true)
      const detail = await drawing.locator('.hybrid-detail:visible').boundingBox()
      assert.ok(detail.x >= 0 && detail.x + detail.width <= width && detail.y + detail.height < height - 60, 'Clipped detail')
      if (width <= 900) assert.ok(detail.y + detail.height < geometry.copy.y, `${name} details overlap mobile copy`)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (name === 'COMBUSTION') assert.equal(await drawing.locator('.hybrid-fuel-grain').evaluate(node => getComputedStyle(node).opacity), '1')
      if (name === 'PERFORMANCE') {
        assert.deepEqual(await drawing.locator('.hybrid-parameters dd').allTextContents(), ['30 BAR', '6.0', '~1 kN', '~10 s', '235.98 s'])
        assert.equal(await drawing.locator('.hybrid-flow-pulse').evaluate(node => getComputedStyle(node).animationName), 'none')
      }
      await page.screenshot({ path: `artifacts/propulsion-${name.toLowerCase().replaceAll(' ', '-')}-${width}.png` })
      await button.press('Escape')
      assert.equal(await drawing.locator('.hybrid-detail:visible').count(), 0)
    }
    const oxidizer = drawing.getByRole('button', { name: 'OXIDIZER', exact: true })
    await oxidizer.hover()
    assert.equal(await oxidizer.getAttribute('aria-expanded'), 'true')
    await page.mouse.move(0, 0)
    assert.equal(await oxidizer.getAttribute('aria-expanded'), 'false')
    await oxidizer.focus()
    await oxidizer.press('Enter')
    assert.equal(await oxidizer.getAttribute('aria-expanded'), 'true')
    await oxidizer.press('Escape')
    await page.getByRole('button', { name: 'Visa STRUCTURES', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.hybrid-propulsion').getAttribute('aria-hidden') === 'true')
    assert.equal(await page.locator('.hybrid-propulsion button:not([tabindex="-1"])').count(), 0)
    await page.getByRole('button', { name: 'Visa PROPULSION', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.hybrid-propulsion').getAttribute('aria-hidden') === 'false')
    assert.equal(await drawing.locator('.hybrid-detail:visible').count(), 0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(200)
    await oxidizer.scrollIntoViewIfNeeded()
    await oxidizer.click()
    assert.equal(await drawing.evaluate(node => node.getAnimations({ subtree: true }).length), 0)
    assert.equal(await oxidizer.getAttribute('aria-expanded'), 'true')
    await page.screenshot({ path: `artifacts/propulsion-reduced-${width}.png` })
    console.log(`PASS ${width}px: layout, supplied sizing, all interactions, keyboard, reverse navigation, reduced motion`)
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log('PASS no browser errors')
} finally { await browser.close() }
