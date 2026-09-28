import DeleteRecord from './DeleteRecord'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { documentText, teamInformation, teamSections, teamTextLimit, type TeamSectionKey } from '../../../backend/src/members/team-information'
import { useWorkspace, type EditorRequest } from './context'
import { Icon, statuses } from './components'
import type { Team } from './api'
import TeamSectionEditor from './TeamSectionEditor'

export default function TeamEditor({ request, onClose }: { request: EditorRequest; onClose: () => void }) {
  const { data, save } = useWorkspace()
  const team = data.teams.find(team => team.id === request.id)
  const dialog = useRef<HTMLDialogElement>(null)
  const [information, setInformation] = useState(() => teamInformation(team || {}))
  const [active, setActive] = useState<TeamSectionKey | null>('description')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const element = dialog.current
    element?.showModal()
    return () => { element?.close(); previous?.focus() }
  }, [])
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const close = () => { if (!busy) { if (dirty) setConfirmClose(true); else onClose() } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const plain = Object.fromEntries(teamSections.map(({ key }) => [key, documentText(information.sections[key]).trim()]))
    const overlong = teamSections.find(({ key }) => plain[key].length > teamTextLimit)
    if (!plain.description || overlong) {
      setActive(overlong?.key || 'description')
      setError(overlong ? `${overlong.title} is too long. Use up to ${teamTextLimit.toLocaleString()} characters per section.` : 'Add an About section describing the team.')
      return
    }
    setBusy(true); setError('')
    try {
      await save('teams', { name: String(form.get('name')), projectId: String(form.get('projectId')), status: String(form.get('status')), members: String(form.get('members')).split(',').map(value => value.trim()).filter(Boolean), ...plain, information } as Omit<Team, 'id'>, request.id)
      onClose()
    } catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }
  return <dialog ref={dialog} className="m-dialog m-team-editor" aria-labelledby="team-editor-title" onCancel={event => { event.preventDefault(); close() }}>
    <div className="m-dialog-heading"><div><p className="m-eyebrow">Team documentation</p><h2 id="team-editor-title">{team ? 'Edit team' : 'New team'}</h2><p className="m-team-editor-intro">A shared guide to your team. Open a section and make it your own.</p></div><button className="m-icon-button" type="button" aria-label="Close editor" disabled={busy} onClick={close}><Icon name="close" /></button></div>
    <form onSubmit={submit} onChange={() => setDirty(true)}>
      <fieldset disabled={busy} className="m-form-grid m-team-metadata">
        <label>Team name<input name="name" required maxLength={200} defaultValue={team?.name || ''} /></label>
        <label>Current project<select name="projectId" defaultValue={team?.projectId || ''}><option value="">No project selected</option>{data.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label>Status<select name="status" defaultValue={team?.status || 'Planned'}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
        <label>Members<input name="members" maxLength={10000} defaultValue={team?.members.join(', ') || ''} /><span className="m-field-help">Separate member names with commas.</span></label>
      </fieldset>
      <div className="m-information-heading"><h3>Team information</h3><span>{dirty ? 'Unsaved changes' : 'All sections saved together'}</span></div>
      <div className="m-information-sections">{teamSections.map(({ key, title, label, hint }, index) => {
        const text = documentText(information.sections[key])
        const expanded = active === key
        return <section className={`m-information-section${expanded ? ' is-editing' : ''}`} key={key}>
          <button type="button" className="m-section-switch" aria-expanded={expanded} aria-controls={`team-section-${key}`} aria-label={`${expanded ? 'Collapse' : 'Edit'} ${title}`} disabled={busy} onClick={() => setActive(expanded ? null : key)}><span className="m-section-number">0{index + 1}</span><span><strong>{title}</strong><span>{expanded ? hint : text.replace(/\s+/g, ' ').slice(0, 110) || hint}</span></span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
          <div id={`team-section-${key}`} hidden={!expanded}>{expanded && <TeamSectionEditor value={information.sections[key]} label={label} disabled={busy} onChange={doc => { setInformation(current => ({ ...current, sections: { ...current.sections, [key]: doc } })); setDirty(true) }} />}</div>
          {expanded && <div className={`m-section-count${text.length > teamTextLimit ? ' m-error' : ''}`}>{text.length.toLocaleString()} / {teamTextLimit.toLocaleString()} characters</div>}
        </section>
      })}</div>
      {error && <p className="m-error" role="alert">{error}</p>}
      {confirmClose && <div className="m-discard-notice" role="alert"><p>You have unsaved changes. Keep writing or discard this draft?</p><button type="button" className="m-button" onClick={() => setConfirmClose(false)}>Keep writing</button><button type="button" className="m-button" onClick={onClose}>Discard changes</button></div>}
      <div className="m-dialog-actions"><button type="button" className="m-button" disabled={busy} onClick={close}>Cancel</button><button className="m-button m-primary" disabled={busy}>{busy ? 'Saving…' : team ? 'Save changes' : 'Create team'}</button></div>
    </form>
    {team && <DeleteRecord entity="teams" id={team.id} disabled={busy} onBusyChange={setBusy} onDeleted={onClose} />}
  </dialog>
}
