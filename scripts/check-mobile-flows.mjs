import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { seedData } from '../backend/dist/members/seed.js'

const base = process.env.CHECK_URL || 'http://127.0.0.1:5180/'
const artifacts = 'artifacts/responsive'
await mkdir(artifacts, { recursive: true })
const executablePath = process.env.BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser = await chromium.launch({ executablePath, headless: true })
const errors = []
const resizeOnly = process.argv.includes('--resize-only')
const portalOnly = process.argv.includes('--portal-only')
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
try {
  for (const [width, height] of (resizeOnly || portalOnly ? [] : [[320, 568], [375, 667], [390, 844], [430, 932], [768, 1024], [900, 700], [844, 390]])) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('.rocket-experience').getAttribute('data-mode'), 'static')
    assert.equal(await page.locator('.earth-story').count(), 0)
    assert.ok((await page.locator('.rocket-image').getAttribute('src')).endsWith('mobile.webp'))
    assert.equal(await page.locator('.reveal-pending').count(), 0)
    for (const details of await page.locator('.mobile-diagram').all()) {
      await details.locator('summary').tap()
      await details.locator('aside').waitFor()
      for (const button of await details.locator('button').all()) {
        const box = await button.boundingBox()
        assert.ok(box && box.height >= 44 && box.width >= 44, `Diagram touch target: ${await button.getAttribute('class')} ${JSON.stringify(box)}`)
        await button.tap()
        assert.equal(await button.getAttribute('aria-expanded'), 'true')
        const target = await button.getAttribute('aria-controls')
        assert.equal(await page.locator(`[id="${target}"]`).isVisible(), true)
        assert.equal(await overflow(page), false, `Expanded diagram at ${width}`)
      }
      if (width === 390) await details.screenshot({ path: `${artifacts}/diagram-${await details.locator('aside').getAttribute('class').then(s => s.split(' ')[0])}.png` })
      await details.locator('summary').tap()
    }
    await page.locator('.menu-toggle').tap()
    assert.equal(await page.locator('#main').evaluate(el => el.inert), true)
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
    await page.locator('.home-toggle').tap()
    await page.locator('.home-destinations a[href$="#om-oss"]').tap()
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false')
    assert.equal(await page.locator('#main').evaluate(el => el.inert), false)
    await page.waitForFunction(() => { const y = document.getElementById('om-oss').getBoundingClientRect().top; return y >= 70 && y < 140 })
    await page.locator('.menu-toggle').tap()
    await page.locator('.nav-support').tap()
    await page.waitForURL(base + 'support-us/')
    const swish = page.getByRole('link', { name: 'Open Swish', exact: true })
    const paymentURL = 'https://app.swish.nu/1/p/sw/?sw=1231145127&msg=G%C3%A5va'
    assert.equal(await swish.getAttribute('href'), paymentURL)
    await page.locator('.support-qr img').evaluate(image => image.decode())
    assert.equal(await page.locator('.support-qr img').evaluate(image => image.naturalWidth), 500)
    assert.ok((await swish.boundingBox()).y < (await page.locator('.support-qr').boundingBox()).y)
    // Verify handoff without contacting Swish or initiating payment.
    await page.route('https://app.swish.nu/**', route => route.fulfill({ contentType: 'text/html', body: 'Verified Swish handoff' }))
    await swish.tap()
    await page.waitForURL(paymentURL)
    for (const route of ['projects/phobos/', 'electronics', 'propulsion', 'structures', 'marketing', 'join-us/', 'become-a-sponsor/', 'partners/', 'contact/']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      assert.equal(await overflow(page), false, `${route} normal motion at ${width}`)
      assert.equal(await page.locator('.reveal-pending').count(), 0)
      if (route === 'contact/') assert.equal(await page.locator('.contact-address').getAttribute('href'), 'mailto:info@caesar.se')
      if (route === 'partners/') assert.ok(await page.locator('main a[href^="https://"]').count() > 0)
      if (route === 'structures') {
        for (const button of await page.locator('.structures-deployment-steps button').all()) await button.tap()
        await page.locator('.structures-calculations summary').tap()
        assert.equal(await overflow(page), false)
      }
    }
    await page.locator('.menu-toggle').tap()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false')
    assert.equal(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement), true)
    await page.close()
    console.log(`PASS mobile flows ${width}x${height}: diagrams, menu, anchors, Swish, links, recovery and public routes`)
  }
  const resizePage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' })
  resizePage.on('pageerror', error => errors.push(error.message))
  await resizePage.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await resizePage.locator('.rocket-experience').getAttribute('data-mode'), 'scroll')
  await resizePage.setViewportSize({ width: 390, height: 844 })
  await resizePage.waitForFunction(() => document.querySelector('.rocket-experience').dataset.mode === 'static')
  await resizePage.locator('.menu-toggle').click()
  await resizePage.setViewportSize({ width: 1440, height: 1000 })
  await resizePage.waitForFunction(() => document.querySelector('.rocket-experience').dataset.mode === 'scroll' && !document.getElementById('main').inert)
  assert.equal(await resizePage.evaluate(() => document.body.style.overflow), '')
  assert.equal(await resizePage.locator('.mobile-diagram').count(), 0)
  assert.equal(await resizePage.locator('.earth-story').count(), 1)
  await resizePage.evaluate(() => {
    const root = document.querySelector('.rocket-experience')
    scrollTo({ top: (root.offsetHeight - innerHeight) * 108 / 148.75, behavior: 'instant' })
  })
  await resizePage.waitForFunction(() => Number(getComputedStyle(document.querySelector('.earth-visual')).opacity) > .9)
  await resizePage.close()
  console.log('PASS live desktop/mobile resizing and menu cleanup')
  // Exercise the actual portal components against isolated sample responses.
  // No sign-in credentials or production data are accessed or changed.
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  page.on('pageerror', error => errors.push(error.message))
  let signedIn = false
  const member = { id: 'responsive-test', name: 'Responsive test', username: 'test', role: 'admin', provider: 'supabase' }
  await page.route('**/api/members/**', route => {
    const path = new URL(route.request().url()).pathname
    const body = path.endsWith('/auth/session') ? { member: signedIn ? member : null } : path.endsWith('/users') ? { users: [{ id: 'sample-member', name: 'Sample member', username: 'sample', role: 'member', active: true, created_at: '2026-01-01' }] } : seedData()
    return route.fulfill({ json: body })
  })
  for (const width of (resizeOnly ? [] : [320, 375, 390, 430, 768, 1024, 1440])) {
    await page.setViewportSize({ width, height: 900 })
    signedIn = false
    await page.goto(base + 'login', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Welcome aboard.' }).waitFor()
    assert.equal(await overflow(page), false, `Login overflow ${width}`)
    await page.getByRole('button', { name: 'Show password' }).click()
    assert.equal(await page.locator('#member-password').getAttribute('type'), 'text')
    signedIn = true
    for (const route of ['dashboard', 'dashboard/teams', 'dashboard/teams/avionics', 'dashboard/projects', 'dashboard/projects/phobos', 'dashboard/goals', 'dashboard/data', 'dashboard/activity', 'dashboard/users']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await page.locator('#members-main').waitFor()
      assert.equal(await overflow(page), false, `${route} overflow ${width}`)
      if (width <= 700 && await page.locator('.m-table-scroll').count()) {
        assert.equal(await page.locator('.m-table-scroll').first().evaluate(el => el.scrollWidth > el.clientWidth), false, 'Data records fit without horizontal scrolling')
      }
      if (route === 'dashboard/projects') {
        await page.getByRole('button', { name: 'Create project', exact: true }).click()
        const dialog = page.getByRole('dialog')
        await dialog.waitFor()
        assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth), false, `Editor overflow ${width}`)
        await dialog.getByLabel('Project name').fill('Mobile layout check')
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      }
      if (route === 'dashboard/users') {
        await page.getByRole('button', { name: 'Reset password for sample' }).click()
        const dialog = page.getByRole('dialog')
        await dialog.waitFor()
        assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth), false, `Password dialog overflow ${width}`)
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      }
      if (width === 390) await page.screenshot({ path: `${artifacts}/portal-${route.replaceAll('/', '-')}.png`, fullPage: true })
    }
    if (width <= 700) {
      await page.locator('#members-menu').click()
      await page.getByRole('navigation', { name: 'Members navigation' }).getByRole('link', { name: 'Goals', exact: true }).click()
      assert.equal(await page.locator('#members-menu').getAttribute('aria-expanded'), 'false')
    }
    console.log(`PASS portal layouts ${width}: sign-in, dashboard, teams, project detail, goals, data, activity, users`)
  }
  await page.close()
  assert.deepEqual(errors, [])
  await writeFile(`${artifacts}/flows-result.json`, JSON.stringify({ passed: true, errors }))
} finally { await browser.close() }
