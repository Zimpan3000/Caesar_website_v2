import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts', { recursive: true })
const errors = []
try {
  for (const [width, height] of [[1920,1080], [1440,1000], [1280,800], [1024,768], [768,1024], [390,844], [320,740]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    const root = page.locator('.marketing-outreach')
    assert.equal(await root.getAttribute('aria-hidden'), 'true')
    assert.equal(await root.locator('button:not([tabindex="-1"])').count(), 0)
    await page.locator('.rocket-progress [data-stage="marketing"]').click()
    await page.waitForTimeout(2200)
    assert.equal(await root.getAttribute('aria-hidden'), 'false')
    assert.equal(await root.locator('.outreach-detail:visible').count(), 0)
    assert.equal(await root.locator('button:visible').count(), width <= 900 ? 4 : 5)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.equal(await page.locator('.rocket-image').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41), 0)
    const network = await root.boundingBox()
    const copy = await page.locator('.callout-marketing').boundingBox()
    if (width > 900) assert.ok(network.x + network.width < width / 2 - 100, 'Network overlaps rocket')
    else assert.ok(network.y + network.height < copy.y, 'Network overlaps existing description')
    for (const node of await root.locator('button:visible').all()) {
      const bounds = await node.boundingBox()
      assert.ok(bounds.width >= 30 && bounds.height >= 30, 'Undersized interaction target')
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y > 75 && bounds.y + bounds.height < height, 'Clipped node')
    }
    await page.screenshot({ path: `artifacts/marketing-default-${width}.png` })
    for (const [id, texts] of [
      ['partners', ['PARTNERSHIPS','SPONSOR RELATIONS','COLLABORATION']],
      ['students', ['RECRUITMENT','COMMUNITY','STUDENT ENGAGEMENT']],
      ...(width > 900 ? [['industry', ['INDUSTRY OUTREACH','COLLABORATION','TECHNICAL NETWORK']]] : []),
      ['public', ['EVENTS','OUTREACH','PUBLIC ENGAGEMENT']],
      ['digital', ['WEB','CONTENT','VISUAL COMMUNICATION','SOCIAL MEDIA']],
    ]) {
      const button = root.locator(`.outreach-node--${id}`)
      await button.click()
      await page.mouse.move(width - 1, 1)
      assert.equal(await button.getAttribute('aria-expanded'), 'true')
      const detail = root.locator('.outreach-detail:visible')
      assert.equal(await detail.count(), 1)
      for (const text of texts) assert.equal(await detail.locator('li').getByText(text, { exact: true }).isVisible(), true)
      if (id === 'public' || id === 'digital') assert.match(await detail.locator('.outreach-story').innerText(), /ENGINEERING.*STORY.*PEOPLE/s)
      await page.waitForTimeout(300)
      const bounds = await detail.boundingBox()
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'Clipped detail text')
      if (width <= 900) assert.ok(bounds.y + bounds.height < copy.y, 'Details overlap existing copy')
      assert.ok(await root.locator('.outreach-node:not(.is-selected)').first().evaluate(el => Number(getComputedStyle(el).opacity) < .6))
      assert.equal(await page.locator('.callout-marketing .subteam-description').evaluate(el => getComputedStyle(el).opacity), '1')
      if (id === 'digital') await page.screenshot({path:`artifacts/marketing-digital-${width}.png`})
      await button.press('Escape')
      assert.equal(await root.locator('.outreach-detail:visible').count(), 0)
    }
    const partners = root.locator('.outreach-node--partners')
    await partners.hover()
    assert.equal(await partners.getAttribute('aria-expanded'), 'true')
    await page.mouse.move(width - 1, 1)
    await page.waitForFunction(() => document.querySelector('.outreach-node--partners').getAttribute('aria-expanded') === 'false')
    await page.locator('.rocket-progress [data-stage="marketing"]').focus()
    await partners.focus()
    await partners.press('Enter')
    assert.equal(await partners.getAttribute('aria-expanded'), 'true')
    await partners.press('Escape')
    // A selected connection sends a real moving packet, then settles at rest.
    await root.locator('.outreach-node--digital').click()
    const wires = width <= 900 ? '.outreach-wires--compact' : '.outreach-wires--full'
    const packet = root.locator(`${wires} .is-selected .outreach-packet`).first()
    await page.waitForTimeout(300)
    const first = await packet.evaluate(el => getComputedStyle(el).offsetDistance)
    await page.waitForTimeout(300)
    assert.notEqual(await packet.evaluate(el => getComputedStyle(el).offsetDistance), first)
    await page.waitForTimeout(1200)
    assert.equal(await packet.evaluate(el => getComputedStyle(el).opacity), '0')
    await page.locator('.rocket-progress [data-stage="structures"]').click()
    await page.waitForFunction(() => document.querySelector('.marketing-outreach').getAttribute('aria-hidden') === 'true')
    assert.equal(await root.locator('button:not([tabindex="-1"])').count(),0)
    await page.locator('.rocket-progress [data-stage="marketing"]').click()
    await page.waitForFunction(() => document.querySelector('.marketing-outreach').getAttribute('aria-hidden') === 'false')
    assert.equal(await root.locator('.outreach-detail:visible').count(),0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await partners.scrollIntoViewIfNeeded()
    await partners.click()
    assert.equal(await partners.getAttribute('aria-expanded'),'true')
    assert.equal(await root.evaluate(el => el.getAnimations({subtree:true}).length),0)
    await page.screenshot({path:`artifacts/marketing-reduced-${width}.png`})
    console.log(`PASS ${width}: layout, details, keyboard, hover, pulses, exit/reentry, reduced motion`)
    await page.close()
  }
  for (const [width,height] of [[375,667],[844,390]]) {
    const page = await browser.newPage({viewport:{width,height}})
    await page.goto(baseURL,{waitUntil:'networkidle'})
    assert.equal(await page.locator('.rocket-experience').getAttribute('data-mode'),'static')
    await page.locator('.marketing-outreach').scrollIntoViewIfNeeded()
    await page.locator('.outreach-node--digital').click()
    assert.equal(await page.locator('#outreach-detail-digital').isVisible(),true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false)
    await page.screenshot({path:`artifacts/marketing-short-${width}.png`})
    console.log(`PASS ${width} × ${height}: static reading layout`)
    await page.close()
  }
  assert.deepEqual(errors,[])
  console.log('PASS no browser runtime errors')
} finally { await browser.close() }
