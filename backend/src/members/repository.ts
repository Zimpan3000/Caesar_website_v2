import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { Activity, Entity, PortalData, RecordInput } from './models'
import { seedData } from './seed'
import { deletionBlockers, entityNames } from './deletion'
import { documentText, teamSections, teamTextLimit, textDocument, validateTeamInformation } from './team-information'

export class ValidationError extends Error {}
const statuses = ['Planned', 'In Progress', 'Completed', 'Blocked']
export function validate(entity: Entity, input: unknown, data: PortalData, id?: string): RecordInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Invalid record.')
  const source = input as Record<string, unknown>
  const result: Record<string, unknown> = {}
  const fields: Record<Entity, string[]> = {
    teams: ['name', 'description', 'projectId', 'status'],
    projects: ['name', 'teamId', 'description', 'status', 'startDate', 'targetDate'],
    goals: ['title', 'teamId', 'projectId', 'description', 'deadline', 'status'],
    updates: ['title', 'teamId', 'projectId', 'date', 'author', 'description', 'status'],
    entries: ['title', 'teamId', 'projectId', 'date', 'description', 'category', 'unit', 'notes'],
  }
  for (const field of fields[entity]) {
    const value = source[field]
    const optional = ['projectId', 'notes', 'unit'].includes(field) || (entity === 'entries' && field === 'teamId')
    if (typeof value !== 'string' || (!optional && !value.trim()) || value.length > (entity === 'teams' && field === 'description' ? teamTextLimit : ['description', 'notes'].includes(field) ? 5000 : 200)) throw new ValidationError(`Please provide a valid ${field}.`)
    result[field] = value.trim()
  }
  if (result.teamId && !data.teams.some(team => team.id === result.teamId)) throw new ValidationError('Team not found.')
  if (result.projectId && !data.projects.some(project => project.id === result.projectId)) throw new ValidationError('Project not found.')
  if (entity === 'entries' && !result.teamId && !result.projectId) throw new ValidationError('Select a team or project for this data entry.')
  if (result.status && !statuses.includes(result.status as string)) throw new ValidationError('Invalid status.')
  for (const field of ['date', 'deadline', 'startDate', 'targetDate']) {
    const value = result[field] as string | undefined
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new ValidationError(`Invalid ${field}.`)
  }
  if (entity === 'projects' && String(result.targetDate) < String(result.startDate)) throw new ValidationError('Target date must be on or after the start date.')
  if (entity === 'projects') {
    const previous = data.projects.find(project => project.id === id)
    const parent = source.parentProjectId === undefined ? previous?.parentProjectId || '' : source.parentProjectId ?? ''
    if (typeof parent !== 'string' || parent.length > 200) throw new ValidationError('Invalid parent project.')
    result.parentProjectId = parent.trim()
    const visited = new Set(id ? [id] : [])
    let ancestor = result.parentProjectId as string
    while (ancestor) {
      if (visited.has(ancestor)) throw new ValidationError('A project cannot be its own parent or belong to one of its subprojects.')
      visited.add(ancestor)
      const project = data.projects.find(project => project.id === ancestor)
      if (!project) throw new ValidationError('Parent project not found.')
      ancestor = project.parentProjectId || ''
    }
  }
  if (entity === 'teams') {
    const previous = data.teams.find(team => team.id === id)
    for (const field of ['responsibilities', 'workingStyle', 'workflow', 'projectTypes'] as const) {
      const value = source[field] === undefined ? previous?.[field] || '' : source[field]
      if (typeof value !== 'string' || value.length > teamTextLimit) throw new ValidationError(`Please provide a valid ${field} (up to ${teamTextLimit} characters).`)
      result[field] = value.trim()
    }
    if (source.information !== undefined) {
      try {
        const info = validateTeamInformation(source.information)
        result.information = info
        for (const { key } of teamSections) result[key] = documentText(info.sections[key]).trim()
        if (!result.description) throw new Error('Please add an About section describing the team.')
      } catch (error) { throw new ValidationError((error as Error).message) }
    } else if (previous?.information) {
      // Older clients can still edit plain text without erasing other sections.
      const sections = { ...previous.information.sections }
      for (const { key } of teamSections) if (result[key] !== (previous[key] || '')) sections[key] = textDocument(result[key] as string)
      result.information = { version: 1, sections }
    }
  }
  for (const field of entity === 'teams' ? ['members'] : entity === 'updates' ? ['tags'] : []) {
    const value = source[field]
    if (!Array.isArray(value) || value.length > 100 || value.some(item => typeof item !== 'string' || item.length > 100)) throw new ValidationError(`Invalid ${field}.`)
    result[field] = [...new Set(value.map(item => item.trim()).filter(Boolean))]
  }
  if (entity === 'goals') {
    if (typeof source.progress !== 'number' || !Number.isFinite(source.progress) || source.progress < 0 || source.progress > 100) throw new ValidationError('Progress must be between 0 and 100.')
    result.progress = result.status === 'Completed' ? 100 : result.status === 'Planned' ? 0 : source.progress
  }
  if (entity === 'entries') {
    if (typeof source.value !== 'number' || !Number.isFinite(source.value)) throw new ValidationError('Value must be a finite number.')
    result.value = source.value
  }
  return result as unknown as RecordInput
}

export function applySave(data: PortalData, entity: Entity, input: unknown, actor: string, id?: string): PortalData {
  const record = validate(entity, input, data, id)
  const list = data[entity] as Array<RecordInput & { id: string }>
  const index = id ? list.findIndex(item => item.id === id) : -1
  if (id && index < 0) throw new ValidationError('Record not found.')
  const saved = { ...record, id: id || randomUUID() }
  if (id) list[index] = saved
  else list.push(saved)
  const teamId = entity === 'teams' ? saved.id : 'teamId' in record ? record.teamId : ''
  const projectId = entity === 'projects' ? saved.id : 'projectId' in record ? record.projectId : ''
  const team = data.teams.find(item => item.id === teamId)?.name || actor
  const label = 'name' in record ? record.name : record.title
  const verb = id ? (entity === 'goals' && 'status' in record && record.status === 'Completed' ? 'completed a goal' : 'updated ' + ({ teams: 'a team', projects: 'a project', goals: 'a goal', updates: 'an update', entries: 'a data entry' }[entity])) : ({ teams: 'created a team', projects: 'created a project', goals: 'added a goal', updates: 'posted an update', entries: 'added a new test result' }[entity])
  const activity: Activity = { id: randomUUID(), date: new Date().toISOString(), actor, teamId, projectId, message: `${team} ${verb}: ${label}`, entity, entityId: saved.id }
  data.activity.unshift(activity)
  return data
}

export function applyDelete(data: PortalData, entity: Entity, id: string, actor: string): PortalData {
  const list = data[entity]
  const index = list.findIndex(row => row.id === id)
  if (index < 0) throw new ValidationError('Record not found. It may already have been deleted.')
  const blockers = deletionBlockers(data, entity, id)
  if (blockers.length) throw new ValidationError(`Remove or reassign these first: ${blockers.join(', ')}.`)
  const record = list[index]
  list.splice(index, 1)
  data.activity.unshift({ id: randomUUID(), date: new Date().toISOString(), actor,
    teamId: entity === 'teams' ? id : 'teamId' in record ? record.teamId : '',
    projectId: entity === 'projects' ? id : 'projectId' in record ? record.projectId : '',
    message: `${actor} deleted a ${entityNames[entity]}: ${'name' in record ? record.name : record.title}`,
    entity, entityId: id })
  return data
}

export interface MembersRepository {
  read(): Promise<PortalData>
  save(entity: Entity, input: unknown, actor: string, id?: string): Promise<PortalData>
  remove(entity: Entity, id: string, actor: string): Promise<PortalData>
}
export class FileMembersRepository implements MembersRepository {
  private pending: Promise<unknown> = Promise.resolve()
  constructor(private file = process.env.MEMBER_DATA_FILE || path.join(__dirname, '..', '..', 'data', 'members.json')) {}
  private async load(): Promise<PortalData> {
    try { return JSON.parse(await fs.readFile(this.file, 'utf8')) }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return seedData()
      throw error
    }
  }
  async read() { await this.pending; return this.load() }
  async save(entity: Entity, input: unknown, actor: string, id?: string): Promise<PortalData> {
    return this.change(data => applySave(data, entity, input, actor, id))
  }
  async remove(entity: Entity, id: string, actor: string): Promise<PortalData> {
    return this.change(data => applyDelete(data, entity, id, actor))
  }
  private async change(transform: (data: PortalData) => PortalData): Promise<PortalData> {
    const operation = this.pending.then(async () => {
      const data = transform(await this.load())
      await fs.mkdir(path.dirname(this.file), { recursive: true })
      const temporary = `${this.file}.tmp`
      await fs.writeFile(temporary, JSON.stringify(data, null, 2), { mode: 0o600 })
      await fs.rename(temporary, this.file)
      return data
    })
    this.pending = operation.catch(() => undefined)
    return operation
  }
}
