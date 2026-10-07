import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
await mkdir('artifacts/partners', { recursive: true })
const errors = []
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  page.on('pageerror', error => errors.push(error.message))
  for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [390, 844], [320, 740], [844, 390]]) {
    await page.setViewportSize({ width, height })
    await page.goto(`${base}partners/`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.title(), 'Our Partners | CAESAR')
    assert.equal(await page.locator('h1').count(), 1)
    assert.deepEqual(await page.locator('.partnership-story h2').allTextContents(), ['Tranemo', 'Astronomisk Ungdom', 'Chalmers', 'Axjo'])
    assert.equal(await page.locator('.partnership-story').count(), 4)
    assert.equal(await page.locator('.nav-main-links > a[aria-current="page"]').textContent(), 'Partners')
    for (const image of await page.locator('.partnership-logo img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate(image => image.decode())
    }
    const issues = await page.evaluate(() => {
      const issues = []
      if (document.documentElement.scrollWidth > innerWidth) issues.push('Page overflow')
      const article = document.querySelector('.partnership-page')
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(walker.currentNode)
        for (const rect of range.getClientRects()) {
          if (rect.width && (rect.left < -.5 || rect.right > innerWidth + .5)) issues.push(`Clipped text: ${walker.currentNode.textContent}`)
        }
      }
      for (const section of article.querySelectorAll('.partnership-story')) {
        const copy = section.querySelector('.partnership-story-copy').getBoundingClientRect()
        const logo = section.querySelector('.partnership-identity').getBoundingClientRect()
        if (copy.left < logo.right && copy.right > logo.left && copy.top < logo.bottom && copy.bottom > logo.top) issues.push('Copy overlaps logo')
      }
      for (const anchor of article.querySelectorAll('a[href^="#"]')) {
        if (!document.getElementById(anchor.hash.slice(1))) issues.push(`Broken anchor ${anchor.hash}`)
      }
      return issues
    })
    assert.deepEqual(issues, [], `Layout at ${width}x${height}`)
    for (const id of ['tranemo', 'astronomisk-ungdom', 'chalmers', 'axjo']) {
      await page.locator(`.partnership-index a[href="#${id}"]`).click()
      const title = await page.locator(`#${id} h2`).boundingBox()
      const header = await page.locator('.site-header').boundingBox()
      assert.ok(title.y >= header.height && title.y < height, `Anchor obscured at ${width}px: ${id}`)
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: `artifacts/partners/page-${width}.png`, fullPage: true })
    console.log(`PASS ${width}x${height}: copy, logos, bounds, section anchors`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => { window.__partnersNavigation = true })
  await page.locator('.nav-main-links > a').getByText('Partners', { exact: true }).click()
  await page.locator('.partnership-page').waitFor()
  assert.equal(await page.evaluate(() => window.__partnersNavigation), true, 'Partners navigation reloaded the document')
  assert.equal(await page.locator('.home-toggle.is-active, .project-toggle.is-active').count(), 0)
  await page.locator('.partnership-invitation a').click()
  await page.locator('.sponsor-page').waitFor()
  await page.goBack()
  await page.locator('.partnership-page').waitFor()
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Our Partners | CAESAR')
  await page.goto(`${base}sponsorer/`, { waitUntil: 'networkidle' })
  await page.locator('.partnership-page').waitFor()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(`${base}partners/`, { waitUntil: 'networkidle' })
  assert.ok(await page.locator('.reveal-pending').count() > 0)
  await page.locator('#chalmers').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => !document.querySelector('#chalmers .partnership-story-copy').classList.contains('reveal-pending'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => document.querySelectorAll('.reveal-pending').length === 0)
  assert.equal(await page.locator('.reveal-pending').count(), 0)
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('PASS SPA navigation, sponsor link, back, reload, legacy route, scroll reveal and reduced motion')
} finally { await browser.close() }
