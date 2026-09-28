import DeleteRecord from './DeleteRecord'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { type Entity, type RecordInput } from './api'
import { type EditorRequest, useWorkspace } from './context'
import { categories, Icon, statuses, today } from './components'
import { parentChoices, projectAncestors } from './projectHierarchy'

const names: Record<Entity, string> = { teams: 'team', projects: 'project', goals: 'goal', updates: 'update', entries: 'data entry' }
export default function RecordEditor({ request, onClose }: { request: EditorRequest; onClose: () => void }) {
  const { data, member, save } = useWorkspace()
  const dialog = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef(document.activeElement as HTMLElement | null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const existing = request.id ? data[request.entity].find(record => record.id === request.id) : undefined
  const record = (existing || {}) as unknown as Record<string, string | number | string[]>
  const entity = request.entity
  const [status, setStatus] = useState(String(record.status || 'Planned'))
  const [progress, setProgress] = useState(Number(record.progress || 0))
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => { element?.close(); returnFocus.current?.focus() }
  }, [])
  const value = (name: string, fallback = '') => String(record[name] ?? fallback)
  function field(label: string, name: string, type = 'text', required = true, fallback = '') {
    return <label>{label}<input name={name} type={type} required={required} defaultValue={value(name, fallback)} maxLength={200} step={type === 'number' ? 'any' : undefined} /></label>
  }
  function area(label: string, name: string, required = true) { return <label className="m-field-wide">{label}<textarea name={name} rows={3} maxLength={5000} required={required} defaultValue={value(name)} /></label> }
  function team() { return <label>Team{entity === 'entries' ? ' (or select a project)' : ''}<select aria-label="Team" name="teamId" required={entity !== 'entries'} defaultValue={value('teamId', request.teamId || '')}><option value="">Select a team</option>{data.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label> }
  function project() { return <label>{entity === 'teams' ? 'Current project' : 'Project'}<select aria-label={entity === 'teams' ? 'Current project' : 'Project'} name="projectId" defaultValue={value('projectId', request.projectId || '')}><option value="">No project selected</option>{data.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label> }
  function parentProject() { return <label className="m-field-wide">Parent project<select aria-label="Parent project" name="parentProjectId" defaultValue={value('parentProjectId', request.parentProjectId || '')}><option value="">None ? top-level project</option>{parentChoices(data.projects, request.id).map(project => <option key={project.id} value={project.id}>{[...projectAncestors(project, data.projects), project].map(item => item.name).join(' / ')}</option>)}</select><span className="m-field-help">Optional. Group this work under a larger project.</span></label> }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: Record<string, unknown> = {}
    form.forEach((value, key) => { input[key] = value })
    if (entity === 'teams') input.members = String(input.members || '').split(',').map(name => name.trim()).filter(Boolean)
    if (entity === 'updates') input.tags = String(input.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)
    if (entity === 'goals') input.progress = status === 'Completed' ? 100 : status === 'Planned' ? 0 : progress
    if (entity === 'entries') input.value = Number(input.value)
    setBusy(true); setError('')
    try { await save(entity, input as unknown as RecordInput, request.id); onClose() }
    catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }
  return <dialog className="m-dialog" ref={dialog} aria-labelledby="record-editor-title" onCancel={event => { event.preventDefault(); if (!busy) onClose() }} onClick={event => { if (event.target === dialog.current && !busy) onClose() }}><div className="m-dialog-heading"><div><p className="m-eyebrow">Workspace / {names[entity]}</p><h2 id="record-editor-title">{request.id ? 'Edit' : 'New'} {names[entity]}</h2></div><button className="m-icon-button" type="button" aria-label="Close editor" disabled={busy} onClick={onClose}><Icon name="close" /></button></div><form onSubmit={submit}><fieldset disabled={busy} className="m-form-grid">{field(entity === 'teams' ? 'Team name' : entity === 'projects' ? 'Project name' : 'Title', ['teams', 'projects'].includes(entity) ? 'name' : 'title')}{entity !== 'teams' && team()}{entity !== 'projects' && project()}{entity === 'projects' && parentProject()}{area('Description', 'description')}{entity === 'teams' && <>{area('Responsibilities', 'responsibilities', false)}{area('How we work', 'workingStyle', false)}{area('Workflow / process', 'workflow', false)}{area('Types of projects', 'projectTypes', false)}</>}{entity === 'teams' && <label className="m-field-wide">Members<span className="m-field-help">Separate member names with commas.</span><textarea name="members" maxLength={10000} rows={2} defaultValue={Array.isArray(record.members) ? record.members.join(', ') : ''} /></label>}{entity !== 'entries' && <label>Status<select aria-label="Status" name="status" value={status} onChange={event => { setStatus(event.target.value); if (event.target.value === 'Completed') setProgress(100); if (event.target.value === 'Planned') setProgress(0) }}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>}{entity === 'projects' && <>{field('Start date', 'startDate', 'date', true, today())}{field('Target date', 'targetDate', 'date')}</>}{entity === 'goals' && <>{field('Deadline', 'deadline', 'date')}<label className="m-field-wide">Progress · {progress}%<input aria-label="Progress percentage" type="range" min="0" max="100" value={progress} disabled={['Planned', 'Completed'].includes(status)} onChange={event => setProgress(Number(event.target.value))} /><span className="m-field-help">Planned goals start at 0%; completed goals are 100%.</span></label></>}{['updates', 'entries'].includes(entity) && field('Date', 'date', 'date', true, today())}{entity === 'updates' && <>{field('Author', 'author', 'text', true, member.name)}<label className="m-field-wide">Tags (optional)<input name="tags" maxLength={1000} placeholder="integration, testing" defaultValue={Array.isArray(record.tags) ? record.tags.join(', ') : ''} /><span className="m-field-help">Separate tags with commas.</span></label></>}{entity === 'entries' && <>{field('Category', 'category', 'text', true, categories[0])}<div className="m-category-hints m-field-wide">Suggested: {categories.join(' · ')}</div>{field('Value', 'value', 'number')}{field('Unit (optional)', 'unit', 'text', false)}{area('Notes (optional)', 'notes', false)}</>}</fieldset>{error && <p className="m-error" role="alert">{error}</p>}<div className="m-dialog-actions"><button className="m-button" type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="m-button m-primary" disabled={busy}>{busy ? 'Saving…' : request.id ? 'Save changes' : `Create ${names[entity]}`}</button></div></form>{request.id && <DeleteRecord entity={entity} id={request.id} disabled={busy} onBusyChange={setBusy} onDeleted={onClose} />}</dialog>
}
