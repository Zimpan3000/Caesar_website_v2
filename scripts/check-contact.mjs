import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
await mkdir('artifacts/contact', { recursive: true })
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => { window.__contactNavigation = true })
    if (width <= 900) await page.locator('.menu-toggle').click()
    await page.locator('.nav-main-links > a').getByText('Contact', { exact: true }).click()
    await page.locator('.contact-page').waitFor()
    assert.equal(await page.evaluate(() => window.__contactNavigation), true, 'Contact navigation reloaded the document')
    assert.equal(await page.title(), 'Contact | CAESAR')
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('.nav-main-links > a[aria-current="page"]').innerText(), 'Contact')
    assert.equal(await page.locator('.home-toggle.is-active, .project-toggle.is-active').count(), 0)
    assert.equal(await page.locator('.contact-address').getAttribute('href'), 'mailto:info@caesar.se')
    assert.equal(await page.locator('.contact-social a').count(), 4)
    const layoutIssues = await page.locator('.contact-page').evaluate(article => {
      const issues = []
      if (document.documentElement.scrollWidth > innerWidth) issues.push('Page overflow')
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim() || walker.currentNode.parentElement.closest('.contact-sr-only')) continue
        const range = document.createRange()
        range.selectNodeContents(walker.currentNode)
        for (const rect of range.getClientRects()) if (rect.left < 0 || rect.right > innerWidth) issues.push(walker.currentNode.textContent)
      }
      return issues
    })
    assert.deepEqual(layoutIssues, [], `Clipped content at ${width}px`)
    await page.locator('.contact-page').screenshot({ path: `artifacts/contact/page-${width}.png`, style: '.site-header, .skip-link { visibility: hidden !important; }' })
    await page.locator('.contact-options a').getByText('Become a Sponsor', { exact: true }).click()
    await page.locator('.sponsor-page').waitFor()
    assert.equal(await page.title(), 'Become a Sponsor | CAESAR')
    await page.goBack()
    await page.locator('.contact-page').waitFor()
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Contact | CAESAR')
    await page.locator('.contact-back').click()
    await page.locator('.rocket-experience').waitFor()
    assert.notEqual(await page.title(), 'Contact | CAESAR')
    await page.locator('footer').getByRole('link', { name: 'Contact', exact: true }).click()
    await page.locator('.contact-page').waitFor()
    console.log(`PASS ${width}px: contact content, responsive layout, header/footer navigation, history and reload`)
  }
  await page.goto(`${base}contact`, { waitUntil: 'networkidle' })
  await page.locator('.contact-page').waitFor()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.contact-social').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => !document.querySelector('.contact-social').classList.contains('reveal-pending'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await page.locator('.contact-page .reveal-pending').count(), 0)
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS direct route, scroll reveal and reduced motion')
} finally { await browser.close() }
