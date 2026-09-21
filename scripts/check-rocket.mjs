import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || undefined, headless: true })
const baseURL = process.env.CHECK_URL || 'http://localhost:5173'
await mkdir('artifacts', { recursive: true })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const ready = async () => {
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.locator('.rocket-image').evaluate(image => image.decode())
    await page.evaluate(() => document.fonts.ready)
  }
  const scrollTo = async (progress) => {
    await page.evaluate(progress => {
      const section = document.querySelector('.rocket-experience')
      const viewport = section.querySelector('.rocket-viewport')
      const time = progress * 100
      const scrollTime = time <= 111.25 ? time : 111.25 + (time - 111.25) * 3
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY + (section.offsetHeight - viewport.offsetHeight) * scrollTime / 148.75, behavior: 'instant' })
    }, progress)
    // Allow the short native-scroll artwork interpolation to settle.
    await page.waitForTimeout(450)
  }
  const state = () => page.evaluate(() => {
    const image = document.querySelector('.rocket-image')
    const matrix = new DOMMatrix(getComputedStyle(image).transform)
    const fillMatrix = new DOMMatrix(getComputedStyle(document.querySelector('.progress-fill')).transform)
    const section = document.querySelector('.rocket-experience')
    const viewport = section.querySelector('.rocket-viewport')
    return {
      x: matrix.m41, y: matrix.m42, scale: matrix.m11, scaleY: matrix.m22,
      ratio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      viewportTop: viewport.getBoundingClientRect().top,
      viewportHeight: viewport.offsetHeight,
      sectionHeight: section.offsetHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      active: section.dataset.stage,
      progressFill: innerWidth <= 900 ? fillMatrix.m11 : fillMatrix.m22,
      callouts: [...section.querySelectorAll('.technical-callout')].filter(element => +getComputedStyle(element).opacity > .1).length,
    }
  })

  for (const [width, height] of [[1440, 1000], [1280, 800], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height })
    await ready()
    const initial = await state()
    assert.equal(initial.overflow, false)
    assert.equal(initial.scale, 1)
    assert.ok(Math.abs(initial.ratio - 2 / 3) < .001)
    assert.ok(Math.abs(initial.sectionHeight / height - 24.8) < .02, 'Expected unchanged rocket/Earth + 600svh About reveal + viewport')
    assert.deepEqual(await page.locator('.technical-callout h2').allTextContents(), ['ELECTRONICS', 'PROPULSION', 'STRUCTURES', 'MARKETING'])
    assert.equal(await page.locator('.rocket-mission a').first().getAttribute('tabindex'), '-1')
    await page.screenshot({ path: `artifacts/rocket-intro-${width}.png` })

    const samples = new Map()
    for (const [name, progress, active] of [['electronics', .23, 'electronics'], ['propulsion', .41, 'propulsion'], ['structures', .59, 'structures'], ['marketing', .77, 'marketing'], ['mission', .99, 'mission']]) {
      await scrollTo(progress)
      const frame = await state()
      samples.set(progress, frame)
      assert.equal(frame.active, active)
      assert.ok(Math.abs(frame.viewportTop) < 1, `Unpinned viewport at ${width}px / ${name}`)
      assert.ok(Math.abs(frame.scale - frame.scaleY) < .001, 'Image stretched')
      assert.ok(Math.abs(frame.ratio - 2 / 3) < .001, 'Image ratio changed')
      assert.ok(frame.callouts <= 1, 'Overlapping callouts')
      assert.equal(frame.overflow, false)
      if (name !== 'mission') {
        assert.ok(Math.abs(frame.progressFill - (progress - .10) / .80) < .01, 'Progress line not tracking the team sequence')
        assert.equal(frame.callouts, 1)
        assert.equal(await page.locator(`.callout-${name}`).getAttribute('aria-hidden'), 'false')
        assert.equal(await page.locator(`.callout-${name} .subteam-keywords li`).count(), 5)
        const bounds = await page.locator(`.callout-${name}`).boundingBox()
        const navbar = await page.locator('.site-header').boundingBox()
        assert.ok(bounds.y > navbar.height && bounds.y + bounds.height < height - 80, `Team copy clipped at ${width}px / ${name}`)
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width)
      }
      if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/rocket-${name}-${width}.png` })
    }
    assert.equal(await page.locator('.rocket-mission').getAttribute('aria-hidden'), 'false')
    assert.equal(await page.locator('.rocket-mission a').first().getAttribute('tabindex'), '0')
    const electronics = samples.get(.23)
    const propulsion = samples.get(.41)
    assert.ok(electronics.y > propulsion.y, 'Camera did not travel down to propulsion')
    assert.ok(samples.get(.77).y > propulsion.y, 'Camera did not return to the branding')
    assert.ok(electronics.scale > 2 && Math.abs(samples.get(.99).scale - (width <= 900 ? .66 : .94)) < .01, 'Zoom-out failed')
    assert.ok(Math.abs(samples.get(.99).x) < 1 && Math.abs(samples.get(.99).y) < 1, 'Final rocket not centered')
    assert.equal(await page.locator('.rocket-progress').getAttribute('aria-hidden'), 'true')

    const canvas = await page.locator('.rocket-starfield').elementHandle()
    const earthFrame = () => page.evaluate(() => {
      const visual = document.querySelector('.earth-visual')
      const image = document.querySelector('.earth-image')
      const imageBounds = image.getBoundingClientRect()
      const copy = document.querySelector('.about-copy').getBoundingClientRect()
      return {
        rocketOpacity: +getComputedStyle(document.querySelector('.rocket-image')).opacity,
        earthOpacity: +getComputedStyle(visual).opacity,
        top: imageBounds.top, width: imageBounds.width,
        ratio: imageBounds.width / imageBounds.height,
        titleOpacity: +getComputedStyle(document.querySelector('.about-copy')).opacity,
        bodyOpacity: +getComputedStyle(document.querySelector('.about-copy')).opacity,
        copyVisible: copy.x >= 0 && copy.right <= innerWidth && copy.y > document.querySelector('.site-header').getBoundingClientRect().height && copy.bottom < innerHeight - 24,
      }
    })
    await page.locator('.earth-image').evaluate(image => image.decode())
    await scrollTo(1.0325)
    const space = await earthFrame()
    assert.equal(space.rocketOpacity, 0, 'Rocket did not leave before Earth appeared')
    assert.equal(space.earthOpacity, 0, 'Missing empty-space transition')
    await scrollTo(1.048)
    const horizon = await earthFrame()
    assert.ok(horizon.top > height * .65 && horizon.top < height, 'Earth should enter from the bottom')
    assert.equal(horizon.titleOpacity, 0)
    await scrollTo(1.1125)
    const settled = await earthFrame()
    assert.ok(settled.top < horizon.top && settled.width > horizon.width, 'Earth should rise and grow')
    assert.ok(Math.abs(settled.ratio - 1249 / 700) < .002, 'Earth image was stretched')
    assert.equal(settled.titleOpacity, 0, 'About text should wait for Earth to recede')
    assert.equal(await page.evaluate(canvas => canvas === document.querySelector('.rocket-starfield'), canvas), true, 'Starfield was replaced between scenes')
    assert.equal((await state()).overflow, false)
    if (width === 1440 || width === 390 || width === 320) await page.screenshot({ path: `artifacts/earth-settled-${width}.png` })
    await page.locator('.about-portrait img').evaluate(image => image.decode())
    const portraitFrame = () => page.evaluate(() => {
      const figure = document.querySelector('.about-portrait')
      const image = figure.querySelector('img')
      const bounds = image.getBoundingClientRect()
      const copy = document.querySelector('.about-copy').getBoundingClientRect()
      const matrix = new DOMMatrix(getComputedStyle(figure).transform)
      return {
        opacity: +getComputedStyle(figure).opacity, scale: matrix.m11, y: matrix.m42,
        ratio: bounds.width / bounds.height,
        widthRatio: bounds.width / innerWidth,
        facesVisible: bounds.x >= 0 && bounds.right <= innerWidth && bounds.top + bounds.height * .32 > document.querySelector('.site-header').getBoundingClientRect().height && bounds.top + bounds.height * .8 < innerHeight,
        textClearOfPhoto: copy.bottom <= bounds.top || copy.right <= bounds.left,
        captionVisible: figure.querySelector('figcaption').getBoundingClientRect().bottom < innerHeight,
        mask: getComputedStyle(image).maskImage,
        filter: getComputedStyle(image).filter,
      }
    })
    await scrollTo(1.1325)
    const receding = await earthFrame()
    assert.ok(receding.top > settled.top && receding.earthOpacity < settled.earthOpacity, 'Earth should move down and fade')
    const together = await page.evaluate(() => ['.about-copy', '.about-portrait'].map(selector => {
      const style = getComputedStyle(document.querySelector(selector))
      return { opacity: +style.opacity, y: new DOMMatrix(style.transform).m42 }
    }))
    assert.deepEqual(together[0], together[1], 'Image and text should reveal together')
    assert.ok(together[0].opacity > 0, 'Composition did not begin on About entry')
    await scrollTo(1.1475)
    const heading = await earthFrame()
    assert.ok(heading.titleOpacity > .995, 'Shared composition reveal should settle promptly')
    assert.ok(heading.bodyOpacity > .995)
    await scrollTo(1.165)
    assert.equal((await portraitFrame()).opacity, 1, 'Photo should be present with the body')
    assert.ok((await earthFrame()).bodyOpacity > .995)
    await scrollTo(1.185)
    const emerging = await portraitFrame()
    assert.equal(emerging.opacity, 1)
    assert.equal(emerging.scale, 1)
    assert.equal(emerging.y, 0)
    assert.equal(emerging.textClearOfPhoto, true, 'Copy overlaps portrait')
    assert.equal((await earthFrame()).copyVisible, true, 'About copy clipped')
    await page.screenshot({ path: 'artifacts/team-reveal-' + width + '.png' })
    await scrollTo(1.2375)
    const portrait = await portraitFrame()
    assert.equal(portrait.opacity, 1)
    assert.equal(portrait.scale, 1)
    assert.equal(portrait.y, 0)
    assert.ok(Math.abs(portrait.ratio - 1262 / 864) < .001, 'Team photo stretched')
    const expectedPortraitWidth = width <= 900 ? Math.min(width * .82, 560) : Math.min(width * .82 / 2.12, 640)
    assert.ok(Math.abs(portrait.widthRatio - expectedPortraitWidth / width) < .001)
    assert.equal(portrait.facesVisible, true, 'Team members clipped')
    assert.equal(portrait.captionVisible, true, 'Caption clipped')
    assert.equal(portrait.textClearOfPhoto, true, 'Text overlaps faces')
    assert.notEqual(portrait.mask, 'none')
    assert.equal(portrait.filter, 'none')
    const earthWithTeam = await earthFrame()
    assert.ok(earthWithTeam.earthOpacity >= .5, 'Earth should remain visible with the team')
    assert.ok(earthWithTeam.top < height * .75, 'Earth horizon left the viewport')
    assert.equal(await page.locator('.about-body p').count(), 3)
    assert.ok((await page.locator('.about-lead strong').textContent()).includes('Chalmers Raketgrupp'))
    assert.equal(await page.locator('.about-story').getAttribute('aria-hidden'), 'false')
    assert.equal(await page.locator('.about-body a').getAttribute('tabindex'), '0')
    assert.equal(await page.locator('.about-copy h2').textContent(), 'VI ÄR CAESAR.')
    await page.screenshot({ path: 'artifacts/team-settled-' + width + '.png' })
    await scrollTo(1.185)
    assert.deepEqual(await portraitFrame(), emerging, 'Team reveal did not reverse')
    await scrollTo(1.048)
    await page.waitForFunction(() => +getComputedStyle(document.querySelector('.about-copy')).opacity === 0)
    assert.deepEqual(await earthFrame(), horizon, 'Earth did not reverse deterministically')
    await scrollTo(.99)
    assert.equal((await earthFrame()).rocketOpacity, 1, 'Reverse scrolling did not restore the rocket')
    assert.equal(await page.locator('.about-body a').getAttribute('tabindex'), '-1')
    console.log(`PASS ${width}px: Earth entrance, simultaneous About reveal, aspect ratio, continuous stars, reverse`)

    for (const [team, start, point] of [['electronics', .15, .29], ['propulsion', .35, .92], ['structures', .55, .46], ['marketing', .75, .54]]) {
      await scrollTo(start + .005)
      const holdStart = await state()
      await scrollTo(start + .115)
      const holdEnd = await state()
      assert.ok(Math.abs(holdStart.y - holdEnd.y) < 1 && Math.abs(holdStart.scale - holdEnd.scale) < .001, `${team} camera moved during reading hold`)
      const detail = await page.evaluate(({ team, point }) => {
        const image = document.querySelector('.rocket-image').getBoundingClientRect()
        const effect = document.querySelector(`.effect-${team}`)
        const bounds = effect.getBoundingClientRect()
        const panel = document.querySelector(`.callout-${team}`)
        return {
          offset: Math.abs(bounds.y + bounds.height / 2 - (image.y + image.height * point)),
          effectOpacity: +getComputedStyle(effect).opacity,
          copyOpacity: +getComputedStyle(panel).opacity,
          keywordsVisible: [...panel.querySelectorAll('li')].every(item => +getComputedStyle(item).opacity === 1),
          inactiveEffects: [...document.querySelectorAll('.team-effect')].filter(item => item !== effect).every(item => +getComputedStyle(item).opacity === 0),
        }
      }, { team, point })
      assert.ok(detail.offset < 2, `${team} highlight detached from rocket: ${detail.offset}px`)
      assert.equal(detail.effectOpacity, 1)
      assert.equal(detail.copyOpacity, 1)
      assert.equal(detail.keywordsVisible, true)
      assert.equal(detail.inactiveEffects, true)
    }

    await scrollTo(.59)
    const reverse = await state()
    assert.ok(Math.abs(reverse.y - samples.get(.59).y) < 1, 'Reverse scroll was not deterministic')
    assert.equal(reverse.active, 'structures')
    await scrollTo(0)
    const reset = await state()
    assert.ok(Math.abs(reset.x - initial.x) < 1 && Math.abs(reset.y - initial.y) < 1 && reset.scale === 1)
    const stable = await state()
    await page.waitForTimeout(250)
    assert.deepEqual(await state(), stable, 'Animation moved without scroll')

    await page.getByRole('button', { name: 'Visa STRUCTURES' }).click()
    await page.waitForFunction(() => document.querySelector('.rocket-experience').dataset.stage === 'structures')
    console.log(`PASS ${width}px: pinned scene, full image, camera travel, stages, reverse, no autoplay, navigation`)
  }

  await page.setViewportSize({ width: 1440, height: 1000 })
  await ready()
  await page.locator('.skip-experience').click()
  await page.waitForFunction(() => +getComputedStyle(document.querySelector('.about-copy')).opacity === 1)
  assert.equal(await page.locator('#om-oss').count(), 1)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => +getComputedStyle(document.querySelector('.about-copy')).opacity === 1)
  console.log('PASS native About link and direct hash navigation')
  await ready()
  const starPixels = () => page.locator('.rocket-starfield').evaluate(canvas => canvas.toDataURL())
  const starsBefore = await starPixels()
  await page.waitForTimeout(350)
  assert.notEqual(await starPixels(), starsBefore, 'Starfield does not twinkle')
  await scrollTo(.52)
  await page.setViewportSize({ width: 1180, height: 820 })
  await page.waitForTimeout(300)
  await scrollTo(0)
  let resized = await state()
  assert.ok(Math.abs(resized.x - 1180 * .19) < 1, 'Desktop resize retained old transform')
  await scrollTo(.52)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(300)
  await scrollTo(.52)
  resized = await state()
  assert.ok(resized.scale < 3, 'Mobile zoom was not reduced')
  assert.equal(resized.overflow, false)
  console.log('PASS resizing during the sequence, including desktop → mobile')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(200)
  assert.equal(await page.locator('.rocket-experience').getAttribute('data-mode'), 'static')
  assert.equal(await page.locator('.rocket-mission').getAttribute('aria-hidden'), null)
  assert.equal(await page.locator('.rocket-progress').isVisible(), false)
  assert.equal(await page.locator('.rocket-mission a').first().getAttribute('tabindex'), null)
  assert.equal(await page.locator('.about-story').getAttribute('id'), 'om-oss')
  assert.equal(await page.locator('.about-story').getAttribute('aria-hidden'), null)
  assert.equal(await page.locator('.about-body a').getAttribute('tabindex'), null)
  const reduced = await state()
  assert.equal(reduced.sectionHeight, reduced.viewportHeight, 'Reduced motion retained a pinned scroll runway')
  assert.equal(await page.locator('.technical-callout[aria-hidden="true"]').count(), 0, 'Reduced motion hid team content')
  const staticStars = await starPixels()
  await page.waitForTimeout(200)
  assert.equal(await starPixels(), staticStars, 'Reduced motion still animates stars')
  for (const panel of await page.locator('.technical-callout').all()) assert.equal(await panel.isVisible(), true)
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'instant' }))
  const reducedNext = await state()
  assert.equal(reduced.x, reducedNext.x)
  assert.equal(reduced.scale, reducedNext.scale)
  await page.screenshot({ path: 'artifacts/rocket-reduced-motion.png', fullPage: true })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.waitForTimeout(200)
  await scrollTo(.59)
  assert.equal((await state()).active, 'structures')
  console.log('PASS live reduced-motion preference changes and static mission access')

  // Intrinsic dimensions reserve the image's space before its network response.
  await page.route('**/assets/caesar-rocket.png', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await route.continue()
  })
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  const before = await page.locator('.rocket-experience').boundingBox()
  await page.locator('.rocket-image').evaluate(image => image.decode())
  const after = await page.locator('.rocket-experience').boundingBox()
  assert.equal(before.height, after.height, 'Image load changed the story height')
  assert.deepEqual(errors, [])
  console.log('PASS image loading without layout shifts; no runtime errors')
} finally {
  await browser.close()
}
