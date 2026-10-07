import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts/hero-layout', { recursive: true })
const desktopSizes = [1920, 1440, 1366, 1280, 1024, 901].flatMap(width =>
  [1080, 900, 768, 650, 601, 600, 480].map(height => [width, height]))
const mobileSizes = [[900, 1024], [900, 721], [768, 1024], [768, 721], [768, 720],
  [390, 844], [390, 721], [390, 667], [375, 812], [320, 740], [320, 721], [320, 568], [844, 390]]

try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion })
    for (const [width, height] of [...desktopSizes, ...mobileSizes]) {
      await page.setViewportSize({ width, height })
      await page.goto(baseURL, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.locator('.rocket-image').evaluate(image => image.decode())
      const result = await page.evaluate(() => {
        const issues = []
        const bounds = selector => document.querySelector(selector).getBoundingClientRect()
        const header = bounds('.site-header')
        const intro = bounds('.rocket-intro')
        const selectors = ['.rocket-origin', '.rocket-intro h1', '.rocket-intro-note', '.scroll-prompt', '.skip-experience']
        const items = selectors.map(selector => ({ selector, rect: bounds(selector) }))
        const overlaps = (a, b) => a.left < b.right - .5 && a.right > b.left + .5 && a.top < b.bottom - .5 && a.bottom > b.top + .5
        for (const { selector, rect } of items) {
          if (!rect.width || !rect.height) issues.push(`${selector} is hidden`)
          if (rect.top < header.bottom || rect.bottom > intro.bottom + .5) issues.push(`${selector} outside hero bounds`)
          if (rect.left < 0 || rect.right > innerWidth) issues.push(`${selector} outside viewport width`)
        }
        const visible = selector => getComputedStyle(document.querySelector(selector)).display !== 'none'
        for (const selector of ['.rocket-progress', '.rocket-viewport-footer']) {
          if (visible(selector)) items.push({ selector, rect: bounds(selector) })
        }
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            if (overlaps(items[i].rect, items[j].rect)) issues.push(`${items[i].selector} overlaps ${items[j].selector}`)
          }
        }
        const navItems = [...document.querySelectorAll('.header-inner > .brand, .menu-toggle, .nav-main-links > *')]
          .filter(element => element.getClientRects().length)
          .map(element => element.getBoundingClientRect())
        for (let i = 0; i < navItems.length; i++) {
          for (let j = i + 1; j < navItems.length; j++) {
            if (overlaps(navItems[i], navItems[j])) issues.push('Header navigation collision')
          }
        }
        // Text ranges catch overflowing glyphs even when their parent box fits.
        for (const selector of [...items.map(item => item.selector), '.header-inner']) {
          const walker = document.createTreeWalker(document.querySelector(selector), NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(walker.currentNode)
            for (const rect of range.getClientRects()) {
              if (rect.width && (rect.left < -.5 || rect.right > innerWidth + .5)) issues.push(`Text overflow in ${selector}`)
            }
          }
        }
        const mode = document.querySelector('.rocket-experience').dataset.mode
        if (mode === 'scroll' && items.some(({ rect }) => rect.bottom > innerHeight)) issues.push('Pinned hero content below viewport')
        if (document.documentElement.scrollWidth > innerWidth) issues.push('Horizontal page overflow')
        return { issues, mode }
      })
      assert.deepEqual(result.issues, [], `${width}x${height} / ${reducedMotion}`)
      if (reducedMotion === 'no-preference' && ([1920, 1440, 1366, 1280].includes(width) && [900, 650].includes(height) || [768, 390, 320, 844].includes(width))) {
        await page.screenshot({ path: `artifacts/hero-layout/${width}x${height}.png` })
      }
      console.log(`PASS ${width}x${height}: ${reducedMotion}, ${result.mode}, visible text, spacing and bounds`)
    }
  }
  assert.deepEqual(errors, [], 'Browser runtime errors')
} finally { await browser.close() }
