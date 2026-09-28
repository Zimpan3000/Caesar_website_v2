import { useState } from 'react'
import type { Entity } from './api'
import { useWorkspace } from './context'
import { deletionBlockers, entityNames } from '../../../backend/src/members/deletion'

export default function DeleteRecord({ entity, id, disabled, onBusyChange, onDeleted }: { entity: Entity; id: string; disabled: boolean; onBusyChange: (busy: boolean) => void; onDeleted: () => void }) {
  const { data, remove } = useWorkspace()
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const record = data[entity].find(row => row.id === id)
  if (!record) return null
  const name = 'name' in record ? record.name : record.title
  const label = entityNames[entity]
  const blockers = deletionBlockers(data, entity, id)
  async function submit() {
    setError(''); setPending(true); onBusyChange(true)
    try { await remove(entity, id); onDeleted() }
    catch (error) { setError((error as Error).message) }
    finally { setPending(false); onBusyChange(false) }
  }
  return <section className="m-delete-section" aria-label={`Delete ${label}`}>
    {!confirm ? <button className="m-button m-danger" type="button" disabled={disabled} onClick={() => setConfirm(true)}>Delete {label}</button> : <>
      <h3>Delete “{name}”?</h3>
      {blockers.length ? <><p>This {label} still has linked records. Remove or reassign them before deleting it:</p><ul>{blockers.map(blocker => <li key={blocker}>{blocker}</li>)}</ul></> : <p>This permanently deletes this {label} from the shared workspace. Its activity history is kept. This cannot be undone.</p>}
      {error && <p className="m-error" role="alert">{error}</p>}
      <div className="m-delete-actions"><button type="button" className="m-button" disabled={disabled} onClick={() => { setConfirm(false); setError('') }} autoFocus>Keep {label}</button><button type="button" className="m-button m-danger" disabled={disabled || !!blockers.length} onClick={() => void submit()}>{pending ? 'Deleting…' : `Permanently delete ${label}`}</button></div>
    </>}
  </section>
}
