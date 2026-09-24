import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const errors = []
await mkdir('artifacts', { recursive: true })
try {
  for (const [width, height] of [[1440, 1000], [1100, 800], [1024, 768], [901, 700], [900, 700], [768, 1024], [390, 844], [320, 740], [1024, 390], [844, 390]]) {
    const mobile = width <= 900
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}electronics`, { waitUntil: 'networkidle' })
    const trigger = page.locator('.project-toggle')
    const panel = page.locator('#phobos-navigation')
    const links = panel.locator('.project-destinations a')
    const headerBefore = await page.locator('.site-header').boundingBox()
    const headingBefore = await page.locator('h1').boundingBox()
    assert.ok(headerBefore.height <= 79, 'Header is not compact')
    assert.equal(await page.locator('.nav-subteams').count(), 0)
    if (mobile) await page.locator('.menu-toggle').click()
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
    assert.ok((await trigger.getAttribute('class')).includes('is-active'))
    if (mobile) {
      await trigger.hover()
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Mobile opened on hover')
      await trigger.click()
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true')
      await trigger.click()
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      await trigger.click()
    } else {
      await trigger.hover()
      const box = await panel.boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + 40, { steps: 12 })
    }
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
    assert.equal(await panel.isVisible(), true)
    assert.equal(await links.count(), 6)
    assert.equal(await panel.locator('[aria-current="page"]').innerText(), 'Electronics')
    assert.equal((await links.nth(1).getAttribute('href')), `${new URL(base).pathname}electronics`)
    assert.deepEqual(await page.locator('.site-header').boundingBox(), headerBefore, 'Opening changed header layout')
    assert.deepEqual(await page.locator('h1').boundingBox(), headingBefore, 'Opening shifted page content')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    const panelBounds = await panel.boundingBox()
    assert.ok(panelBounds.x >= 0 && panelBounds.x + panelBounds.width <= width, 'Dropdown clipped horizontally')
    await links.last().scrollIntoViewIfNeeded()
    if (width === 1440 || width === 390 || width === 901) await page.screenshot({ path: `artifacts/navigation-${width}.png` })
    await page.keyboard.press('Escape')
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true)
    // Enter toggles the disclosure; Tab follows native link order.
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('.project-heading').evaluate(el => el === document.activeElement), true)
    await page.keyboard.press('Tab')
    assert.equal(await links.first().evaluate(el => el === document.activeElement), true)
    await page.keyboard.press('Escape')
    await page.keyboard.press('ArrowDown')
    await page.waitForFunction(() => document.activeElement === document.querySelector('.project-destinations a'))
    // Desktop disclosures close on focus exit; mobile accordions stay expanded.
    await links.last().focus()
    await page.keyboard.press('Tab')
    assert.equal(await trigger.getAttribute('aria-expanded'), mobile ? 'true' : 'false')
    if (mobile) await page.keyboard.press('Escape')
    // A pointer outside closes even if the trigger previously retained focus.
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page.mouse.click(width - 5, height - 5)
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
    if (mobile) {
      if (await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false') await page.locator('.menu-toggle').click()
    }
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    await page.evaluate(() => { window.__navigationMarker = true })
    await panel.getByRole('link', { name: 'Structures', exact: true }).click()
    await page.waitForURL(`${base}structures`)
    await page.locator('.structures-page').waitFor()
    assert.equal(await page.evaluate(() => window.__navigationMarker), true, 'Project section navigation reloaded the document')
    if (mobile) await page.locator('.menu-toggle').click()
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    assert.equal(await panel.locator('[aria-current="page"]').innerText(), 'Structures')
    await panel.getByRole('link', { name: 'Electronics', exact: true }).click()
    await page.waitForURL(`${base}electronics`)
    assert.equal(await page.evaluate(() => window.__navigationMarker), true, 'Electronics navigation reloaded the document')
    await page.reload({ waitUntil: 'networkidle' })
    assert.ok((await trigger.getAttribute('class')).includes('is-active'))
    console.log(`PASS ${width} × ${height}: disclosure, keyboard, active links, SPA navigation, direct load and stable layout`)
    await page.close()
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Visa STRUCTURES', exact: true }).click()
  await page.waitForTimeout(1500)
  await page.locator('.project-toggle').hover()
  assert.equal(await page.locator('.project-destinations [aria-current]').innerText(), 'Structures')
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.locator('.project-toggle').getAttribute('aria-expanded'), 'false')
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false')
  await page.goto(`${base}ga-med-i-caesar/`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.project-toggle.is-active').count(), 0)
  await page.locator('.menu-toggle').click()
  await page.locator('.project-toggle').click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => document.querySelector('.project-dropdown-inner').getAnimations().length === 0)
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS animated scene tracking, breakpoint changes, membership state, and reduced motion')
  await page.close()

  const sections = [
    ['Översikt', 'top'], ['Electronics', 'electronics'], ['Propulsion', 'propulsion'],
    ['Structures', 'structures'], ['Marketing', 'marketing'], ['Vår vision', 'vision'],
    ['Om oss', 'om-oss'], ['Projekt', 'projekt'], ['Senaste nytt', 'senaste'],
    ['Partners', 'partners'], ['Kontakt', 'kontakt'],
  ]
  for (const [width, height] of [[1440, 1000], [901, 700], [390, 844], [320, 740], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}electronics`, { waitUntil: 'networkidle' })
    await page.evaluate(() => { window.__homeMenuMarker = true })
    const mobile = width <= 900
    const trigger = page.locator('.home-toggle')
    const openHome = async () => {
      if (mobile && await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false') await page.locator('.menu-toggle').click()
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      await page.waitForFunction(() => document.activeElement === document.querySelector('.home-destinations a'))
    }
    const before = await page.locator('.site-header').boundingBox()
    await openHome()
    assert.equal(await page.locator('.home-destinations a').count(), 11)
    assert.equal(await page.locator('.home-destinations [aria-current]').count(), 0)
    assert.deepEqual(await page.locator('.site-header').boundingBox(), before)
    if (mobile) await page.locator('.project-toggle').click()
    else await page.locator('.project-toggle').hover()
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Both dropdowns are open')
    assert.equal(await page.locator('.project-toggle').getAttribute('aria-expanded'), 'true')
    await openHome()
    assert.equal(await page.locator('.project-toggle').getAttribute('aria-expanded'), 'false')
    if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/home-navigation-${width}.png` })
    // Every home destination stays within the homepage, including Electronics.
    for (const [label, id] of sections) {
      await openHome()
      await page.locator('.home-destinations').getByRole('link', { name: label, exact: true }).click()
      await page.waitForURL(`${base}#${id}`)
      await page.waitForFunction(id => {
        const top = document.getElementById(id).getBoundingClientRect().top
        return Math.abs(top) < 200 || (scrollY + innerHeight >= document.documentElement.scrollHeight - 2 && top >= 0 && top < innerHeight)
      }, id, { timeout: 5000 }).catch(async () => {
        throw new Error(`Home destination ${id} at ${width}px did not come into view: ${await page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().top)}`)
      })
      assert.equal(await page.evaluate(() => window.__homeMenuMarker), true)
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      await openHome()
      await page.waitForFunction(id => document.querySelector('.home-destinations [aria-current]')?.getAttribute('href') === `#${id}`, id)
      await page.keyboard.press('Escape')
      assert.equal(await trigger.evaluate(el => el === document.activeElement), true)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    console.log(`PASS ${width} × ${height}: all 11 home sections, active indicators, exclusive menus and navigation without reloads`)
    await page.close()
  }
  assert.deepEqual(errors, [], 'Browser runtime errors')
} finally { await browser.close() }
