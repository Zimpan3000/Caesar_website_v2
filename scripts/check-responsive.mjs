import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.CHECK_URL || 'http://127.0.0.1:5180/'
const baseline = process.argv.includes('--baseline')
const routes = ['', 'projects/phobos/', 'electronics', 'propulsion', 'structures', 'marketing', 'join-us/', 'support-us/', 'become-a-sponsor/', 'partners/', 'contact/']
const directory = 'artifacts/responsive'
await mkdir(directory, { recursive: true })
const executablePath = process.env.BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser = await chromium.launch({ executablePath, headless: true })
const failures = []
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  page.on('pageerror', error => failures.push(error.message))
  // Make the random decorative star canvas repeatable for desktop comparisons.
  await page.addInitScript(() => { let seed = 123; Math.random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646 })
  for (const width of (baseline ? [1440, 1024] : [1440, 1024, 320, 375, 390, 430, 768, 900])) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) })))
      const slug = route.replaceAll('/', '-') || 'home'
      const geometry = await page.locator('body *').evaluateAll(elements => elements.filter(el => {
        const r = el.getBoundingClientRect(); return r.width && r.height && getComputedStyle(el).visibility !== 'hidden'
      }).map(el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return [el.tagName, el.className?.baseVal ?? el.className, ...[r.x, r.y, r.width, r.height].map(n => Math.round(n * 100) / 100), s.fontSize, s.display] }))
      if (width > 900) {
        const file = `${directory}/desktop-${width}-${slug}.json`
        if (baseline) await writeFile(file, JSON.stringify(geometry))
        else assert.deepEqual(geometry, JSON.parse(await readFile(file, 'utf8')), `Desktop changed: ${route} at ${width}`)
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      if (overflow) failures.push(`Overflow: ${route || 'home'} at ${width}`)
      if (baseline || width > 900 || width === 390 || width === 320 || width === 768) await page.screenshot({ path: `${directory}/${baseline ? 'before' : 'after'}-${width}-${slug}.png`, fullPage: true, animations: 'disabled' })
      console.log(`${baseline ? 'BASELINE' : 'CHECK'} ${width} ${route || 'home'}${overflow ? ' OVERFLOW' : ''}`)
    }
  }
  await writeFile(`${directory}/${baseline ? 'baseline' : 'result'}.json`, JSON.stringify(failures, null, 2))
  if (!baseline) assert.deepEqual(failures, [])
} finally { await browser.close() }
