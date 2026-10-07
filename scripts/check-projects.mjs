import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const devBase = (process.env.CHECK_URL || 'http://localhost:5174/').replace(/\/?$/, '/')
const previewBase = 'http://127.0.0.1:5198/new/'
await mkdir('artifacts/projects', { recursive: true })
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', 'frontend', '--host', '127.0.0.1', '--port', '5198', '--strictPort'], { windowsHide: true, stdio: 'ignore' })
let browser
try {
  let ready = false
  for (let i = 0; i < 60; i++) {
    if (preview.exitCode !== null) throw new Error('Production preview failed to start')
    try { if ((await fetch(previewBase)).ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  assert.ok(ready)
  const installed = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
  browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || installed, headless: true })
  for (const base of [devBase, previewBase]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
    const errors = [], failures = [], paths = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => { if (response.url().startsWith(new URL(base).origin) && response.status() >= 400) failures.push(response.url()) })
    page.on('request', request => { if (request.url().startsWith(new URL(base).origin)) paths.push(new URL(request.url()).pathname) })
    await page.goto(base + '#projekt', { waitUntil: 'networkidle' })
    await page.locator('.rocket-featured').waitFor()
    const showcase = page.locator('#projekt')
    await showcase.getByRole('heading', { name: 'Our Projects', exact: true }).waitFor()
    assert.equal(await showcase.locator('.project-archive').count(), 0)
    assert.equal(await showcase.locator('.rocket-project-teams a').count(), 3)
    assert.equal(await showcase.getByRole('link', { name: 'Explore Phobos', exact: true }).getAttribute('href'), new URL(base).pathname + 'projects/phobos/')
    await page.evaluate(() => { window.projectNavigationMarker = true })
    await showcase.getByRole('link', { name: 'Explore Phobos', exact: true }).click()
    await page.waitForURL(base + 'projects/phobos/')
    assert.equal(await page.evaluate(() => window.projectNavigationMarker), true)
    const detail = page.locator('.rocket-project-page')
    await detail.getByRole('heading', { level: 1, name: 'PHOBOS', exact: true }).waitFor()
    assert.equal(await page.title(), 'PHOBOS | CAESAR')
    assert.equal(await detail.locator('.rocket-project-facts').innerText().then(text => /Hybrid rocket/.test(text) && /3\s+km/.test(text)), true)
    for (const width of [1440, 1024, 901, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 950 })
      await page.evaluate(() => document.fonts.ready)
      await detail.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Detail overflow at ${width}`)
      assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)), [])
      assert.equal(await page.locator('a[href^="https://caesar.se/projects/phobos"]').count(), 0)
      if (width <= 900) await page.locator('.menu-toggle').click()
      await page.locator('.project-toggle').focus()
      await page.keyboard.press('ArrowDown')
      await page.locator('.project-destinations').getByRole('link', { name: 'Phobos', exact: true }).waitFor()
      assert.equal(await page.locator('.project-destinations [aria-current="page"]').innerText(), 'Phobos')
      await page.keyboard.press('Escape')
      if (width <= 900) await page.keyboard.press('Escape')
      await page.locator('.rocket-project-sections').getByRole('link', { name: 'The Goal', exact: true }).click()
      await page.waitForFunction(() => {
        const top = document.getElementById('malet').getBoundingClientRect().top
        return top >= 70 && top < 180
      }, undefined, { timeout: 5000 }).catch(async () => { throw new Error(`Target anchor at ${width}px: ${await page.locator('#malet').evaluate(el => el.getBoundingClientRect().top)}`) })
      await page.evaluate(() => scrollTo(0, 0))
      if ([1440, 390, 320].includes(width)) await page.screenshot({ path: `artifacts/projects/${base === previewBase ? 'production' : 'development'}-detail-${width}.png`, fullPage: true })
      await page.locator('.rocket-project-back').click()
      await page.waitForURL(base + '#projekt')
      await showcase.locator('.rocket-featured').waitFor()
      await page.waitForFunction(() => Math.abs(document.getElementById('projekt').getBoundingClientRect().top) < 200)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Showcase overflow at ${width}`)
      if ([1440, 390, 320].includes(width)) await showcase.screenshot({ path: `artifacts/projects/${base === previewBase ? 'production' : 'development'}-showcase-${width}.png` })
      await showcase.getByRole('link', { name: 'Explore Phobos', exact: true }).click()
      await page.waitForURL(base + 'projects/phobos/')
    }
    for (const team of ['Propulsion', 'Electronics', 'Structures']) {
      await detail.locator('.rocket-team-link').filter({ has: page.getByRole('heading', { name: team, exact: true }) }).click()
      await page.waitForURL(base + team.toLowerCase())
      await page.locator('h1').waitFor()
      assert.equal(await page.evaluate(() => window.projectNavigationMarker), true)
      await page.goBack()
      await detail.waitFor()
    }
    await page.goto(base + 'projects/phobos')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'PHOBOS | CAESAR')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.reload()
    await detail.locator('#projektstatus').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => !document.querySelector('#projektstatus').classList.contains('reveal-pending'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => document.querySelectorAll('.rocket-project-page .reveal-pending').length === 0)
    assert.deepEqual(errors, [])
    assert.deepEqual(failures, [])
    if (base === previewBase) assert.ok(paths.every(path => path.startsWith('/new/') || path === '/favicon.ico'), 'Assets stay under /new/')
    assert.ok(paths.every(path => !path.endsWith('/data/projects.json') && path !== '/api/projects'), 'The public project page does not fetch the removed archive')
    await page.close()
    console.log(`PASS ${base}: internal Phobos links, facts, teams, keyboard navigation, anchors, history, direct refresh, motion preferences and six responsive sizes`)
  }
} finally {
  await browser?.close()
  if (preview.exitCode === null) {
    const stopped = new Promise(resolve => preview.once('exit', resolve))
    preview.kill()
    await stopped
  }
}
