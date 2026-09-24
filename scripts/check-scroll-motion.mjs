import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const errors = []
try {
  for (const [width, height] of [[1440, 1000], [390, 844], [375, 667]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(process.env.CHECK_URL || 'http://localhost:5173', { waitUntil: 'networkidle' })
    await page.locator('.about-portrait img').evaluate(image => image.decode())
    const sample = (progress, duration = 1200) => page.evaluate(({ progress, duration }) => new Promise(resolve => {
      const root = document.querySelector('.rocket-experience')
      const viewport = root.querySelector('.rocket-viewport')
      const staticMode = root.dataset.mode === 'static'
      const time = progress * 100
      const scrollTime = time <= 111.25 ? time : 111.25 + (time - 111.25) * 3
      const top = staticMode
        ? document.querySelector('.about-story').getBoundingClientRect().top + scrollY - innerHeight * (progress > 1.12 ? .65 : 1.1)
        : root.getBoundingClientRect().top + scrollY + (root.offsetHeight - viewport.offsetHeight) * scrollTime / 148.75
      const frames = []
      const start = performance.now()
      const collect = () => {
        const copy = getComputedStyle(document.querySelector('.about-copy'))
        const image = getComputedStyle(document.querySelector('.about-portrait'))
        const rocket = new DOMMatrix(getComputedStyle(document.querySelector('.rocket-image')).transform)
        frames.push({ time: performance.now() - start, copy: +copy.opacity, image: +image.opacity,
          copyY: new DOMMatrix(copy.transform).m42, imageY: new DOMMatrix(image.transform).m42, rocketY: rocket.m42, scale: rocket.m11, scrollY })
        if (performance.now() - start < duration) requestAnimationFrame(collect)
        else resolve(frames)
      }
      collect()
      window.scrollTo({ top, behavior: 'instant' })
    }), { progress, duration })

    if (height > 720) {
      await sample(.04, 400)
      const camera = await sample(.12, 550)
      assert.ok(new Set(camera.map(frame => frame.scale)).size > 3, 'Artwork should interpolate instead of jumping')
      const reverse = await sample(.04, 550)
      assert.ok(new Set(reverse.map(frame => frame.scale)).size > 3, 'Reverse scroll should interpolate too')
      assert.ok(reverse.at(-1).scale < camera.at(-1).scale)
      const beforeWheel = await page.evaluate(() => scrollY)
      await page.mouse.wheel(0, 250)
      await page.waitForTimeout(350)
      assert.ok(await page.evaluate(() => scrollY) > beforeWheel, 'Native wheel scrolling was intercepted')
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType), 'none')
    }
    await sample(1.11, 1100)
    const reveal = await sample(1.13, 1400)
    const firstCopy = reveal.findIndex(frame => frame.copy > .001)
    const firstImage = reveal.findIndex(frame => frame.image > .001)
    assert.ok(firstCopy > 0, 'Missing entrance transition')
    assert.equal(firstCopy, firstImage, 'Image/text started on different frames')
    for (const frame of reveal) {
      assert.equal(frame.copy, frame.image, 'Image/text opacity diverged')
      assert.equal(frame.copyY, frame.imageY, 'Image/text entrance translation diverged')
    }
    const completed = reveal.find(frame => frame.copy === 1)
    assert.ok(completed, 'Composition failed to finish')
    const entranceDuration = completed.time - reveal[firstCopy].time
    assert.ok(entranceDuration > 350 && entranceDuration < 700, `Entrance duration ${entranceDuration}ms`)
    const retreat = await sample(1.11, 1300)
    assert.equal(retreat.at(-1).copy, 0)
    assert.equal(retreat.at(-1).image, 0)
    for (const frame of retreat) assert.equal(frame.copy, frame.image, 'Reverse entrance drifted')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(200)
    for (const selector of ['.about-copy', '.about-portrait']) {
      assert.equal(await page.locator(selector).evaluate(node => getComputedStyle(node).opacity), '1')
    }
    assert.equal(await page.locator('.reveal-pending').count(), 0)
    // Repeated preference changes must clean up prior triggers/observers.
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await sample(1.11, 1100)
    const resumed = await sample(1.13, 1300)
    assert.equal(resumed.at(-1).copy, 1)
    assert.equal(resumed.at(-1).image, 1)
    console.log(`PASS ${width} × ${height}: native/interpolated scroll, same-frame About start, 500ms reveal, reverse, live reduced motion`)
    await page.close()
  }
  assert.deepEqual(errors, [])
} finally { await browser.close() }
