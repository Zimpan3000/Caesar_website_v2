import { useEffect, useState, type ReactNode } from 'react'
import { sitePath } from '../paths'
import { dashboardPath, Icon } from './components'
import { useWorkspace } from './context'

const baseNavigation = [['overview', 'Overview', ''], ['teams', 'Teams', 'teams'], ['goals', 'Goals', 'goals'], ['data', 'Data', 'data'], ['projects', 'Projects', 'projects'], ['activity', 'Activity', 'activity']]
export default function DashboardLayout({ pathname, onLogout, children }: { pathname: string; onLogout: () => Promise<void>; children: ReactNode }) {
  const { member } = useWorkspace()
  const navigation = member.role === 'admin' ? [...baseNavigation, ['teams', 'Users', 'users']] : baseNavigation
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { setOpen(false); document.getElementById('members-main')?.focus({ preventScroll: true }) }, [pathname])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); document.getElementById('members-menu')?.focus() } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  async function logout() { setBusy(true); setError(''); try { await onLogout() } catch (error) { setError((error as Error).message); setBusy(false) } }
  const section = navigation.find(([, , slug]) => slug && pathname.startsWith(`/dashboard/${slug}`))?.[1] || 'Overview'
  return <div className="m-shell"><a className="skip-link" href="#members-main">Skip to workspace</a><aside className={`m-sidebar${open ? ' is-open' : ''}`} id="members-sidebar"><a href={dashboardPath()} className="m-logo"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR workspace" /></a><div className="m-workspace-label"><span className="m-live-dot" />Members workspace<span>01</span></div><p className="m-nav-label">MISSION CONTROL</p><nav aria-label="Members navigation">{navigation.map(([icon, label, slug]) => <a key={slug} href={dashboardPath(slug)} aria-current={(slug ? pathname.startsWith(`/dashboard/${slug}`) : pathname === '/dashboard') ? 'page' : undefined}><Icon name={icon} /><span>{label}</span>{label === 'Overview' && <span className="m-nav-shortcut">⌘</span>}</a>)}</nav><div className="m-sidebar-bottom"><div className="m-sidebar-note"><Icon name="goals" /><strong>Engineering, together.</strong><p>Small steps. Documented.<br />A shared mission. In motion.</p></div><a className="m-public-link" href={sitePath()}>Public website <span>↗</span></a><div className="m-member"><span className="m-avatar">{member.name.slice(0, 1)}</span><div><strong>{member.name}</strong><span>{member.role === 'admin' ? 'Administrator' : 'CAESAR member'}</span></div><button title="Sign out" aria-label="Sign out" disabled={busy} onClick={logout}><Icon name="logout" /></button></div>{error && <p role="alert" className="m-error">{error}</p>}</div></aside><div className="m-workspace"><header className="m-topbar"><div><button id="members-menu" className="m-menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="members-sidebar" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button><span className="m-topbar-home">Workspace <span>/</span></span><strong>{section}</strong></div><span className="m-internal"><Icon name="lock" size={13} />Internal workspace</span></header><main id="members-main" tabIndex={-1}>{member.provider === 'local' && <div className="m-demo-notice"><span className="m-live-dot" />Prototype workspace<span>Includes illustrative sample records. New changes are saved.</span></div>}{children}</main><footer className="m-workspace-footer"><span>CAESAR · MISSION CONTROL</span><span>Made for the work ahead.</span></footer></div></div>
}
