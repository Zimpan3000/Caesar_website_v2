import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { accountService, ApiError, type ManagedMember } from './api'
import { Empty, Icon, PageHeading } from './components'
import { useWorkspace } from './context'

export default function UsersPage({ onSessionEnded }: { onSessionEnded: () => void }) {
  const { member } = useWorkspace()
  const [users, setUsers] = useState<ManagedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resetUser, setResetUser] = useState<ManagedMember | null>(null)
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) onSessionEnded()
    else setError((error as Error).message)
  }, [onSessionEnded])
  const reload = useCallback(async () => {
    setLoading(true)
    try { setUsers((await accountService.list()).users) }
    catch (error) { handleError(error) }
    finally { setLoading(false) }
  }, [handleError])
  useEffect(() => { if (member.provider === 'supabase') void reload(); else setLoading(false) }, [member.provider, reload])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    setBusy(true); setError(''); setNotice('')
    try {
      await accountService.create({ username: String(fields.get('username')), name: String(fields.get('name')), password: String(fields.get('password')) })
      form.reset()
      setNotice('Account created. Share the username and password privately with the member.')
      await reload()
    } catch (error) { handleError(error) }
    finally { setBusy(false) }
  }
  async function toggle(user: ManagedMember) {
    setBusy(true); setError(''); setNotice('')
    try {
      await accountService.update(user.id, { active: !user.active })
      setNotice(user.active ? `${user.username} has been disabled and signed out.` : `${user.username} can sign in again.`)
      await reload()
    } catch (error) { handleError(error) }
    finally { setBusy(false) }
  }
  if (member.provider !== 'supabase') return <Empty title="User management is not connected yet">Ask the site administrator to complete the Supabase setup.</Empty>
  return <>
    <PageHeading eyebrow="Administration" title="Member accounts" description="Choose who can sign in. Create accounts and manage each member’s access." />
    {error && <p className="m-error" role="alert">{error}</p>}
    {notice && <p className="m-account-notice" role="status">{notice}</p>}
    <section className="m-panel" aria-labelledby="new-account-title">
      <div className="m-panel-heading"><h2 id="new-account-title">Create member account</h2></div>
      <form onSubmit={create} className="m-account-form">
        <fieldset className="m-form-grid" disabled={busy}>
          <label>Display name<input name="name" required maxLength={100} autoComplete="off" /></label>
          <label>Username<input aria-label="Username" aria-describedby="username-help" name="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,31}" autoCapitalize="none" autoComplete="off" spellCheck={false} /><span id="username-help" className="m-field-help">3–32 letters, numbers, dots, underscores or hyphens. Usernames are case-insensitive.</span></label>
          <label className="m-field-wide">Password<input aria-label="Password" aria-describedby="password-help" name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" /><span id="password-help" className="m-field-help">At least 12 characters. Passwords cannot be viewed after saving.</span></label>
        </fieldset>
        <button className="m-button m-primary" disabled={busy}>{busy ? 'Saving…' : 'Create account'}</button>
      </form>
    </section>
    <section className="m-panel" aria-labelledby="account-list-title">
      <div className="m-panel-heading"><h2 id="account-list-title">Accounts</h2><button className="m-text-link" disabled={loading || busy} onClick={() => { setError(''); void reload() }}>Refresh list</button></div>
      {loading ? <p className="m-account-notice" role="status">Loading accounts…</p> : !users.length ? <Empty title="No accounts found" /> : <ul className="m-account-list">{users.map(user => <li key={user.id}>
        <div><strong>{user.name}</strong><span>@{user.username} · {user.role === 'admin' ? 'Administrator' : 'Member'} · {user.active ? 'Active' : 'Disabled'}</span></div>
        {user.role === 'member' && <div className="m-account-actions"><button className="m-button" disabled={busy} aria-label={`Reset password for ${user.username}`} onClick={() => setResetUser(user)}>Reset password</button><button className="m-button" disabled={busy} aria-label={`${user.active ? 'Disable' : 'Enable'} ${user.username}`} onClick={() => void toggle(user)}>{user.active ? 'Disable access' : 'Enable access'}</button></div>}
      </li>)}</ul>}
    </section>
    {resetUser && <PasswordReset user={resetUser} onClose={() => setResetUser(null)} onSessionEnded={onSessionEnded} onSaved={() => { setNotice(`Password changed for ${resetUser.username}. Their previous sessions have been signed out.`); setResetUser(null) }} />}
  </>
}

function PasswordReset({ user, onClose, onSaved, onSessionEnded }: { user: ManagedMember; onClose: () => void; onSaved: () => void; onSessionEnded: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    return () => { dialog.current?.close(); previous?.focus() }
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const password = String(new FormData(form).get('password'))
    setBusy(true); setError('')
    try { await accountService.update(user.id, { password }); form.reset(); onSaved() }
    catch (error) { if (error instanceof ApiError && error.status === 401) onSessionEnded(); else setError((error as Error).message) }
    finally { setBusy(false) }
  }
  return <dialog ref={dialog} className="m-dialog" aria-labelledby="reset-password-title" onCancel={event => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="m-dialog-heading"><div><p className="m-eyebrow">@{user.username}</p><h2 id="reset-password-title">Reset password</h2></div><button className="m-icon-button" aria-label="Close password reset" disabled={busy} onClick={onClose}><Icon name="close" /></button></div>
    <form onSubmit={submit}><label>New password<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" autoFocus disabled={busy} /></label><p className="m-field-help">At least 12 characters. This signs the member out of existing sessions.</p>{error && <p className="m-error" role="alert">{error}</p>}<div className="m-dialog-actions"><button className="m-button" type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="m-button m-primary" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button></div></form>
  </dialog>
}
