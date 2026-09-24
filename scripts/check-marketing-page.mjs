import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = (process.env.CHECK_URL || 'http://localhost:5173/').replace(/\/?$/, '/')
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const errors = []
await mkdir('artifacts', { recursive: true })
try {
  for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1024], [390, 844], [320, 740], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto(`${base}marketing/`, { waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Marketing · Phobos | CAESAR')
    assert.equal(await page.locator('h1').innerText(), 'Building\nmore than\na rocket.')
    assert.equal(await page.locator('.marketing-page > section').count(), 11)
    await page.locator('.marketing-page img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode() })))
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}px`)
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash)), [])
    assert.deepEqual(await page.locator('.marketing-partners .partner-logos img').evaluateAll(images => images.map(image => image.alt)), ['Chalmers tekniska högskola', 'Astronomisk Ungdom', 'Tranemo Workwear'])
    const socialUrls = ['https://www.instagram.com/caesarchalmers/', 'https://www.linkedin.com/company/caesar-chalmers', 'https://www.facebook.com/ChalmersCAESAR', 'https://www.tiktok.com/@caesarchalmers']
    assert.deepEqual(await page.locator('#digital .marketing-socials a').evaluateAll(links => links.map(link => link.href)), socialUrls)
    assert.deepEqual(await page.locator('.marketing-closing .marketing-socials a').evaluateAll(links => links.map(link => link.href)), socialUrls)
    const stages = await page.locator('.marketing-timeline li').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()))
    assert.equal(stages.length, 6)
    for (let i = 1; i < stages.length; i++) {
      if (width > 900) assert.ok(stages[i].x > stages[i - 1].x && stages[i].y === stages[0].y, 'Desktop timeline should be horizontal')
      else assert.ok(stages[i].y >= stages[i - 1].bottom, 'Mobile timeline should stack without overlap')
    }
    const gallery = await page.locator('.marketing-gallery figure').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()))
    for (let i = 0; i < gallery.length; i++) for (let j = i + 1; j < gallery.length; j++) {
      const a = gallery[i], b = gallery[j]
      assert.ok(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top, 'Gallery figures overlap')
    }
    for (const figure of await page.locator('.marketing-page figure').all()) {
      const box = await figure.boundingBox()
      assert.ok(box.x >= 0 && box.x + box.width <= width, `Clipped media at ${width}px`)
    }
    await page.screenshot({ path: `artifacts/marketing-page-${width}.png`, fullPage: true })
    if (width === 1440 || width === 390) {
      await page.screenshot({ path: `artifacts/marketing-page-hero-${width}.png` })
      for (const id of ['content-media', 'digital', 'one-project', 'marketing-partners']) await page.locator(`#${id}`).screenshot({ path: `artifacts/marketing-page-${id}-${width}.png`, style: '.site-header, .skip-link { visibility: hidden !important; }' })
    }
    await page.evaluate(() => { window.__marketingMarker = true })
    // All engineering cross-links participate in the existing client-side routing.
    for (const team of ['Electronics', 'Propulsion', 'Structures']) {
      await page.locator('#engineering-stories').getByRole('link', { name: `Explore ${team}`, exact: true }).click()
      await page.waitForURL(`${base}${team.toLowerCase()}`)
      assert.equal(await page.title(), `${team} · Phobos | CAESAR`)
      await page.goBack()
      await page.locator('.marketing-page').waitFor()
    }
    assert.equal(await page.evaluate(() => window.__marketingMarker), true, 'Cross-link reloaded the page')
    await page.locator('#get-involved').getByRole('link', { name: 'Join CAESAR', exact: true }).click()
    await page.waitForURL(`${base}ga-med-i-caesar/`)
    assert.equal(await page.title(), 'Bli medlem | CAESAR')
    if (width <= 900) await page.locator('.menu-toggle').click()
    await page.locator('.project-toggle').focus()
    await page.keyboard.press('ArrowDown')
    await page.locator('.project-destinations').getByRole('link', { name: 'Marketing', exact: true }).click()
    await page.waitForURL(`${base}marketing`)
    assert.equal(await page.locator('.project-destinations [aria-current="page"]').innerText(), 'Marketing')
    assert.equal(await page.locator('.home-destinations [aria-current]').count(), 0)
    assert.equal(await page.evaluate(() => window.__marketingMarker), true)
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Marketing · Phobos | CAESAR')
    await page.locator('.marketing-closing').getByRole('link', { name: 'Explore Phobos', exact: true }).click()
    await page.waitForURL(`${base}#projekt`)
    await page.waitForFunction(() => Math.abs(document.getElementById('projekt').getBoundingClientRect().top) < 200)
    await page.getByRole('link', { name: 'Explore Marketing', exact: true }).click()
    await page.waitForURL(`${base}marketing`)
    await page.goBack()
    await page.locator('.rocket-experience').waitFor()
    await page.goForward()
    await page.locator('.marketing-page').waitFor()
    assert.equal(await page.locator('.marketing-page').evaluate(node => node.getAnimations({ subtree: true }).length), 0)
    console.log(`PASS ${width} × ${height}: images, sources, gallery, timeline, layout, cross-links, membership, menu, history, refresh and reduced motion`)
    await page.close()
  }
  for (const [width, height] of [[1440, 1000], [1024, 768], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    const cta = page.locator('.marketing-cta')
    assert.equal(await cta.getAttribute('tabindex'), '-1')
    await page.getByRole('button', { name: 'Visa MARKETING', exact: true }).click()
    await page.waitForTimeout(2000)
    assert.equal(await cta.getAttribute('tabindex'), '0')
    const ctaBox = await cta.boundingBox()
    assert.ok(ctaBox.y > 75 && ctaBox.y + ctaBox.height < height - 60, 'CTA clipped')
    if (width <= 900) {
      const network = await page.locator('.marketing-outreach').boundingBox()
      const copy = await page.locator('.callout-marketing').boundingBox()
      const navigation = await page.locator('.rocket-progress').boundingBox()
      assert.ok(network.y + network.height < copy.y, `Network overlaps copy at ${width}px`)
      assert.ok(ctaBox.y + ctaBox.height < navigation.y, `CTA overlaps navigation at ${width}px`)
    }
    await page.screenshot({ path: `artifacts/marketing-cta-${width}.png` })
    await cta.focus()
    await page.keyboard.press('Enter')
    await page.locator('.marketing-page').waitFor()
    await page.waitForFunction(() => scrollY === 0)
    await page.locator('.marketing-closing').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.marketing-closing [data-reveal]')).opacity === '1')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => document.querySelectorAll('.marketing-page .reveal-pending').length === 0)
    assert.equal(await page.locator('.marketing-page').evaluate(node => node.getAnimations({ subtree: true }).length), 0)
    console.log(`PASS ${width}px: landing CTA access and clearance, keyboard navigation, reveals and live reduced motion`)
    await page.close()
  }
  assert.deepEqual(errors, [], 'Browser errors')
} finally { await browser.close() }
