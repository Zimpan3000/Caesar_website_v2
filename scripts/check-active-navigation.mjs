import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const errors = []
const activeSelector = '.nav-main-links > a[aria-current], .nav-main-links .navigation-toggle.is-active'

try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    const checkActive = async label => {
      if (width <= 900 && await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false') {
        await page.locator('.menu-toggle').click()
      }
      await page.waitForFunction(({ selector, label }) => {
        const active = [...document.querySelectorAll(selector)]
        return active.length === 1 && active[0].textContent.trim().startsWith(label)
      }, { selector: activeSelector, label })
      const style = await page.locator(activeSelector).evaluate(el => {
        const css = getComputedStyle(el)
        const expected = document.createElement('span')
        expected.style.color = 'var(--accent)'
        el.append(expected)
        const accent = getComputedStyle(expected).color
        expected.remove()
        return { color: css.color, accent, decoration: css.textDecorationLine }
      })
      assert.equal(style.color, style.accent)
      assert.equal(style.decoration, 'underline')
      assert.equal(await page.locator(activeSelector).isVisible(), true)
    }

    await page.goto(`${base}contact`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('.contact-hero .eyebrow').filter({ hasText: 'Contact / CAESAR' }).count(), 0)
    await checkActive('Contact')
    // Check navigation without reloading, including browser history.
    await page.evaluate(() => { window.__activeNavigationCheck = true })
    for (const label of ['Join Us', 'Partners', 'Become a Sponsor', 'Support Us', 'Contact']) {
      await page.locator('.nav-main-links > a').getByText(label, { exact: false }).click()
      await checkActive(label)
      assert.equal(await page.evaluate(() => window.__activeNavigationCheck), true)
    }
    await page.goBack()
    await checkActive('Support Us')
    await page.goForward()
    await checkActive('Contact')

    for (const route of ['projects/phobos', 'electronics', 'propulsion', 'structures', 'marketing']) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
      await checkActive('Projects')
      await page.locator('.project-toggle').click()
      assert.equal(await page.locator('.project-destinations [aria-current="page"]').count(), 1)
    }
    for (const [hash, label] of [['', 'Home'], ['#om-oss', 'About Us'], ['#projekt', 'Projects']]) {
      await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' })
      await checkActive(label)
    }
    console.log(`PASS ${width}px: current page styling, dropdowns, homepage sections, SPA navigation and browser history`)
    await page.close()
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
