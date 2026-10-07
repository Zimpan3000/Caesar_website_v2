import assert from 'node:assert/strict'

export async function assertEnglishRoutes(page, baseURL) {
  const base = baseURL.replace(/\/?$/, '/')
  const routes = [
    ['bli-sponsor', 'become-a-sponsor', '.sponsor-page'],
    ['stod-oss', 'support-us', '.support-page'],
    ['ga-med-i-caesar', 'join-us', '.membership-page'],
    ['sponsorer', 'partners', '.partnership-page'],
    ['projekt/phobos', 'projects/phobos', '.rocket-project-page'],
  ]
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [previous, current, selector] of routes) {
    for (const suffix of ['', '/']) {
      await page.goto(`${base}${previous}${suffix}?from=bookmark#top`, { waitUntil: 'networkidle' })
      await page.waitForURL(`${base}${current}/?from=bookmark#top`)
      await page.locator(selector).waitFor()
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator(selector).waitFor()
    }
    for (const suffix of ['', '/']) {
      await page.goto(`${base}${current}${suffix}`, { waitUntil: 'networkidle' })
      await page.locator(selector).waitFor()
    }
    const oldLinks = await page.locator('a[href]').evaluateAll(anchors => anchors
      .filter(anchor => new URL(anchor.href).origin === location.origin && /\/(bli-sponsor|stod-oss|ga-med-i-caesar|sponsorer|projekt)(\/|$)/.test(new URL(anchor.href).pathname))
      .map(anchor => anchor.href))
    assert.deepEqual(oldLinks, [], `Non-English page links on ${current}`)
  }
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => { window.__englishRoutesMarker = true })
  await page.locator('.nav-main-links').getByRole('link', { name: 'Become a Sponsor', exact: true }).click()
  await page.waitForURL(`${base}become-a-sponsor/`)
  await page.locator('.nav-main-links').getByRole('link', { name: 'Join Us', exact: true }).click()
  await page.waitForURL(`${base}join-us/`)
  await page.goBack()
  await page.waitForURL(`${base}become-a-sponsor/`)
  await page.locator('.sponsor-page').waitFor()
  await page.goForward()
  await page.waitForURL(`${base}join-us/`)
  await page.locator('.membership-page').waitFor()
  assert.equal(await page.evaluate(() => window.__englishRoutesMarker), true, 'English route navigation reloaded the document')
  console.log(`PASS ${base}: English URLs, local bookmark redirects, query/hash preservation, refresh and history`)
}
