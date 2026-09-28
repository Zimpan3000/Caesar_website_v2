import { checkTeamEditor } from './check-team-editor.mjs'
import { checkDeletion } from './check-deletion.mjs'
import assert from 'node:assert/strict'
import { request } from 'playwright'

// Runs with an already authenticated browser, against local or hosted storage.
export async function checkOrganization(page, baseURL, prefix, screenshotDir) {
  const api = page.context().request
  const headers = { 'X-Caesar-Client': 'members' }
  const route = path => `${baseURL}/api/members${path}`
  const read = async () => {
    const response = await api.get(route('/workspace'))
    assert.equal(response.status(), 200)
    return response.json()
  }
  const post = (entity, data) => api.post(route(`/${entity}`), { headers, data })
  const put = (entity, id, data) => api.put(route(`/${entity}/${id}`), { headers, data })
  const teamName = `${prefix}-Team`
  const legacyTeam = { name: teamName, description: 'Organization test team', members: ['Engineer'], projectId: '', status: 'Planned' }
  assert.equal((await post('teams', legacyTeam)).status(), 200)
  const team = (await read()).teams.find(team => team.name === teamName)
  const mainName = `${prefix}-Main`
  const childName = `${prefix}-Child`
  const grandName = `${prefix}-Nested`
  const dialog = page.getByRole('dialog')
  async function createProject(name) {
    await dialog.getByLabel('Project name', { exact: true }).fill(name)
    await dialog.getByLabel('Description', { exact: true }).fill('Temporary hierarchy verification')
    await dialog.getByLabel('Team', { exact: true }).selectOption(team.id)
    await dialog.getByLabel('Start date', { exact: true }).fill('2026-09-28')
    await dialog.getByLabel('Target date', { exact: true }).fill('2026-10-30')
    await dialog.getByRole('button', { name: 'Create project', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    return (await read()).projects.find(project => project.name === name)
  }
  await page.goto(`${baseURL}/dashboard/projects`)
  await page.getByRole('button', { name: 'Create project', exact: true }).click()
  assert.equal(await dialog.getByLabel('Parent project').inputValue(), '')
  const main = await createProject(mainName)
  await page.getByRole('link', { name: mainName, exact: true }).click()
  await page.getByRole('button', { name: 'Create subproject', exact: true }).click()
  assert.equal(await dialog.getByLabel('Parent project').inputValue(), main.id)
  const child = await createProject(childName)
  assert.equal(child.parentProjectId, main.id)
  await page.goto(`${baseURL}/dashboard/projects/${child.id}`)
  await page.getByRole('button', { name: 'Create subproject', exact: true }).click()
  const grand = await createProject(grandName)
  assert.equal(grand.parentProjectId, child.id)

  await page.goto(`${baseURL}/dashboard/projects`)
  await page.getByRole('link', { name: grandName, exact: true }).waitFor()
  const collapse = page.getByRole('button', { name: `Collapse subprojects of ${mainName}`, exact: true })
  await collapse.focus(); await page.keyboard.press('Enter')
  assert.equal(await page.getByRole('link', { name: grandName, exact: true }).isVisible(), false)
  await page.getByRole('button', { name: `Expand subprojects of ${mainName}`, exact: true }).press('Space')
  await page.getByRole('link', { name: grandName, exact: true }).click()
  const crumbs = page.getByRole('navigation', { name: 'Project hierarchy' })
  assert.equal(await crumbs.getByRole('link').count(), 2)
  await page.getByRole('heading', { name: grandName, exact: true }).waitFor()
  await page.goto(`${baseURL}/dashboard/projects/${main.id}`)
  await page.getByRole('button', { name: 'Edit project', exact: true }).click()
  const choices = await dialog.getByLabel('Parent project').locator('option').evaluateAll(options => options.map(option => option.value))
  for (const project of [main, child, grand]) assert.ok(!choices.includes(project.id), 'Cannot choose self or descendant as parent')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  for (const parentProjectId of [main.id, child.id, grand.id, 'missing-parent']) {
    assert.equal((await put('projects', main.id, { ...main, parentProjectId })).status(), 400)
  }
  assert.equal((await post('projects', { ...main, parentProjectId: 42 })).status(), 400)
  const { parentProjectId: ignored, ...oldChild } = child
  assert.equal((await put('projects', child.id, oldChild)).status(), 200)
  assert.equal((await read()).projects.find(project => project.id === child.id).parentProjectId, main.id, 'Older clients retain parent relationship')
  assert.equal((await put('projects', grand.id, { ...grand, parentProjectId: '' })).status(), 200)
  assert.equal((await read()).projects.find(project => project.id === grand.id).parentProjectId, '')
  assert.equal((await put('projects', grand.id, grand)).status(), 200)
  const legacyName = `${prefix}-Standalone`
  assert.equal((await post('projects', { ...oldChild, name: legacyName })).status(), 200)
  const legacy = (await read()).projects.find(project => project.name === legacyName)
  assert.equal(legacy.parentProjectId, '', 'Legacy create without parent stays top-level')
  console.log('PASS main/subproject creation, three levels, keyboard expansion, breadcrumbs, parent validation, reparenting and legacy payloads')

  await page.goto(`${baseURL}/dashboard/teams/${team.id}`)
  await page.getByRole('button', { name: 'Edit team', exact: true }).click()
  const fields = { 'Responsibilities': 'Design and integration\nReview and testing', 'How we work': 'Small groups with weekly reviews', 'Workflow / process': 'Plan → Build → Test → Document', 'Types of projects': 'Flight hardware and ground systems' }
  for (const [label, value] of Object.entries(fields)) { await dialog.getByRole('button', { name: 'Edit ' + label, exact: true }).click(); await dialog.getByLabel(label, { exact: true }).fill(value) }
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' }); await page.reload()
  await page.getByRole('heading', { name: teamName, exact: true }).waitFor()
  for (const value of Object.values(fields)) assert.ok((await page.locator('.m-team-profile').innerText()).replace(/\s+/g, ' ').includes(value.replace(/\s+/g, ' ')))
  await page.getByRole('link', { name: grandName, exact: true }).waitFor()
  const savedTeam = (await read()).teams.find(item => item.id === team.id)
  assert.equal(savedTeam.workflow, fields['Workflow / process'])
  assert.equal((await put('teams', team.id, legacyTeam)).status(), 200)
  assert.equal((await read()).teams.find(item => item.id === team.id).workflow, savedTeam.workflow, 'Older clients preserve profile fields')
  assert.equal((await put('teams', team.id, { ...legacyTeam, responsibilities: 'x'.repeat(25001) })).status(), 400)
  assert.equal((await put('teams', team.id, { ...legacyTeam, workflow: { invalid: true } })).status(), 400)
  const guest = await request.newContext()
  try {
    assert.equal((await guest.put(route(`/teams/${team.id}`), { headers, data: savedTeam })).status(), 401)
    assert.equal((await guest.post(route('/projects'), { headers, data: main })).status(), 401)
  } finally { await guest.dispose() }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const path of [`teams/${team.id}`, 'projects']) {
      await page.goto(`${baseURL}/dashboard/${path}`)
      await page.getByRole('heading', { name: path === 'projects' ? 'Projects' : teamName, exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Organization overflow at ${width}`)
      if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/organization-${path === 'projects' ? 'projects' : 'team'}-${width}.png`, fullPage: true })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await checkTeamEditor(page, baseURL, team.id, screenshotDir)
  await checkDeletion(page, baseURL, prefix)
  console.log('PASS team profile editing and persistence, profile validation, anonymous write denial and responsive project/team pages')
}
