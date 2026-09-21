import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts', { recursive: true })
const errors = []
try {
  for (const [width, height] of [[1920, 1080], [1440, 1000], [1280, 800], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    const diagram = page.getByRole('complementary', { name: 'Phobos flight computer architecture' })
    assert.equal(await diagram.count(), 0, 'Inactive schematic exposed to assistive technology')
    await page.getByRole('button', { name: 'Visa ELECTRONICS', exact: true }).click()
    await page.waitForTimeout(2100)
    assert.equal(await diagram.isVisible(), true)
    assert.equal(await diagram.locator('.avionics-detail:visible').count(), 0, 'Default details must be hidden')
    const frame = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
      return { diagram: bounds('.avionics'), nav: bounds('.rocket-progress'), copy: bounds('.callout-electronics'),
        nodes: [...document.querySelectorAll('.avionics-node')].map(node => node.getBoundingClientRect().toJSON()),
        descriptionOpacity: getComputedStyle(document.querySelector('.callout-electronics .subteam-description')).opacity,
        rocketX: new DOMMatrix(getComputedStyle(document.querySelector('.rocket-image')).transform).m41,
        overflow: document.documentElement.scrollWidth > innerWidth }
    })
    assert.equal(frame.overflow, false)
    assert.equal(frame.rocketX, 0, 'Rocket moved off center')
    assert.equal(frame.descriptionOpacity, '1')
    for (const node of frame.nodes) {
      assert.ok(node.x >= 0 && node.right <= width && node.y > 75 && node.bottom < height, 'Clipped capability')
      assert.ok(node.width >= 24 && node.height >= 24, 'Undersized interaction target')
    }
    if (width > 900) {
      assert.ok(frame.diagram.right < frame.nav.left, 'Schematic overlaps far-right navigation')
      assert.ok(frame.diagram.left > width / 2 + 95, 'Schematic overlaps rocket')
    } else {
      assert.ok(frame.diagram.bottom < frame.copy.top, 'Compact schematic overlaps Electronics copy')
    }
    await page.screenshot({ path: `artifacts/avionics-default-${width}.png` })
    for (const [name, content] of [
      ['SENSING', ['BMP390 — ALTITUDE', 'MPU6050 — MOTION / ORIENTATION']],
      ['RECOVERY', ['INITIAL PARACHUTE', 'MAIN PARACHUTE']],
      ['TELEMETRY', ['LoRa // 868 MHz', 'REMOTE COMMANDS', 'FLIGHT DATA', 'GROUND STATION']],
      ['CONTROL', ['VALVE FLOWRATE', 'PARAFFIN WARMUP']],
    ]) {
      const button = diagram.getByRole('button', { name, exact: true })
      await button.click()
      await page.mouse.move(0, 0)
      assert.equal(await button.getAttribute('aria-expanded'), 'true', `${name} click did not persist`)
      assert.equal(await diagram.locator('.avionics-detail:visible').count(), 1)
      for (const text of content) assert.equal(await (text === 'GROUND STATION' ? diagram : diagram.locator('.avionics-detail:visible')).getByText(text, { exact: true }).isVisible(), true)
      await page.waitForTimeout(300)
      assert.equal(await diagram.locator('.avionics-node:not(.is-selected)').first().evaluate(node => Number(getComputedStyle(node).opacity) < .7), true)
      assert.equal(await page.locator('.callout-electronics .subteam-description').evaluate(node => getComputedStyle(node).opacity), '1')
      if (name === 'TELEMETRY') await page.screenshot({ path: `artifacts/avionics-telemetry-${width}.png` })
      await button.press('Escape')
      assert.equal(await diagram.locator('.avionics-detail:visible').count(), 0)
    }
    const sensing = diagram.getByRole('button', { name: 'SENSING', exact: true })
    await sensing.hover()
    assert.equal(await sensing.getAttribute('aria-expanded'), 'true')
    await page.mouse.move(0, 0)
    await page.waitForFunction(() => document.querySelector('.avionics-node--sensing').getAttribute('aria-expanded') === 'false')
    assert.equal(await sensing.getAttribute('aria-expanded'), 'false')
    await page.getByRole('button', { name: 'Visa ELECTRONICS', exact: true }).focus()
    await sensing.focus()
    await sensing.press('Enter')
    assert.equal(await sensing.getAttribute('aria-expanded'), 'true')
    await sensing.press('Escape')
    await page.getByRole('button', { name: 'Visa PROPULSION', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.avionics').getAttribute('aria-hidden') === 'true')
    assert.equal(await diagram.count(), 0)
    assert.equal(await page.locator('.avionics button:not([tabindex="-1"])').count(), 0)
    await page.getByRole('button', { name: 'Visa ELECTRONICS', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.avionics').getAttribute('aria-hidden') === 'false')
    assert.equal(await diagram.locator('.avionics-detail:visible').count(), 0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(150)
    await sensing.scrollIntoViewIfNeeded()
    await sensing.click()
    assert.equal(await sensing.getAttribute('aria-expanded'), 'true')
    assert.equal(await diagram.evaluate(root => root.getAnimations({ subtree: true }).length), 0, 'Reduced motion retained animations')
    await page.screenshot({ path: `artifacts/avionics-reduced-${width}.png` })
    console.log(`PASS ${width}px: layout, all subsystems, hover, click, keyboard, section exit/reentry, reduced motion`)
    await page.close()
  }
  for (const [width, height] of [[375, 667], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('.rocket-experience').getAttribute('data-mode'), 'static')
    const diagram = page.locator('.avionics')
    await diagram.scrollIntoViewIfNeeded()
    await diagram.getByRole('button', { name: 'TELEMETRY', exact: true }).click()
    assert.equal(await diagram.getByText('GROUND STATION', { exact: true }).isVisible(), true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.screenshot({ path: `artifacts/avionics-short-${width}.png` })
    console.log(`PASS ${width} × ${height}: short-screen reading layout and interactions`)
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log('PASS no browser runtime errors')
} finally {
  await browser.close()
}
