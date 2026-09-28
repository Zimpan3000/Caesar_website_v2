import { lazy, Suspense, useCallback, useEffect, useState, type MouseEvent } from 'react'
import { sitePath, appPathname } from '../paths'
import { ApiError, authService, membersRepository, type Member, type PortalData, type Entity, type RecordInput } from './api'
import { Workspace, type EditorRequest } from './context'
import { dashboardPath, Empty, navigate } from './components'
import LoginPage from './LoginPage'
import DashboardLayout from './DashboardLayout'
import DashboardOverview from './DashboardOverview'
import TeamPage, { TeamsPage } from './TeamPage'
import ProjectPage, { ProjectsPage } from './ProjectPage'
import GoalsPage from './GoalsPage'
import DataPage from './DataPage'
import ActivityPage from './ActivityFeed'
import RecordEditor from './RecordEditor'
import UsersPage from './UsersPage'
import './members.css'
import './team-documentation.css'
const TeamEditor = lazy(() => import('./TeamEditor'))

export default function MembersApp({ pathname }: { pathname: string }) {
  const [member, setMember] = useState<Member | null>(null)
  const [checked, setChecked] = useState(false)
  const [data, setData] = useState<PortalData | null>(null)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<EditorRequest | null>(null)
  const [notice, setNotice] = useState('')
  const [retry, setRetry] = useState(0)
  const loginPage = pathname === '/login'
  const invalidate = useCallback(() => { setMember(null); setData(null); setEditor(null); navigate(sitePath('login'), true) }, [])
  useEffect(() => {
    let cancelled = false
    setError('')
    authService.session().then(({ member }) => {
      if (!cancelled) { setMember(member); setChecked(true) }
    }).catch(error => { if (!cancelled) setError(error.message) })
    return () => { cancelled = true }
  }, [retry])
  useEffect(() => {
    if (!checked) return
    if (!member && !loginPage) navigate(sitePath('login'), true)
    else if (member && loginPage) navigate(dashboardPath(), true)
  }, [checked, member, loginPage])
  useEffect(() => {
    if (!member) return
    let cancelled = false
    setError('')
    membersRepository.read().then(data => { if (!cancelled) setData(data) }).catch(error => {
      if (cancelled) return
      if (error instanceof ApiError && error.status === 401) invalidate()
      else setError(error.message)
    })
    return () => { cancelled = true }
  }, [member, retry, invalidate])
  useEffect(() => {
    if (!member) return
    let cancelled = false
    const refresh = () => { void authService.session().then(result => { if (!cancelled && !result.member) invalidate() }).catch(() => undefined) }
    refresh()
    window.addEventListener('focus', refresh)
    return () => { cancelled = true; window.removeEventListener('focus', refresh) }
  }, [member, pathname, invalidate])
  useEffect(() => { setEditor(null); setNotice('') }, [pathname])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer) }, [notice])
  useEffect(() => {
    const previous = document.title
    document.title = `${loginPage ? 'Member sign in' : 'Mission control'} | CAESAR`
    return () => { document.title = previous }
  }, [loginPage])
  async function save(entity: Entity, input: RecordInput, id?: string) {
    try { setData(await membersRepository.save(entity, input, id)); setNotice('Changes saved to the workspace.') }
    catch (error) { if (error instanceof ApiError && error.status === 401) invalidate(); throw error }
  }
  async function remove(entity: Entity, id: string) {
    try {
      setData(await membersRepository.remove(entity, id)); setEditor(null)
      if (pathname === '/dashboard/' + entity + '/' + id) navigate(dashboardPath(entity))
      else setNotice('Record deleted from the workspace.')
    } catch (error) { if (error instanceof ApiError && error.status === 401) invalidate(); throw error }
  }
  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element).closest('a')
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
    const url = new URL(anchor.href)
    const path = appPathname(url.pathname)
    if (url.pathname === window.location.pathname && url.hash) return
    if (url.origin !== window.location.origin || !url.pathname.startsWith(sitePath()) || !isMembersPath(path)) return
    event.preventDefault()
    if (url.pathname !== window.location.pathname) navigate(url.pathname)
  }
  let content
  if (error) content = <div className="m-loading"><Empty title="Workspace unavailable">{error}</Empty><button className="m-button m-primary" onClick={() => setRetry(value => value + 1)}>Try again</button><a className="m-text-link" href={sitePath()}>Back to website</a></div>
  else if (!checked) content = <div className="m-loading" role="status">Connecting to your workspace…</div>
  else if (!member) content = loginPage ? <LoginPage onLogin={member => { setMember(member); navigate(dashboardPath(), true) }} /> : <div className="m-loading" role="status">Opening sign in…</div>
  else if (!data) content = <div className="m-loading" role="status">Loading mission control…</div>
  else {
    const [, , section, id, extra] = pathname.split('/')
    let page
    if (!section && !id) page = <DashboardOverview />
    else if (section === 'teams' && !extra) page = id ? <TeamPage id={id} /> : <TeamsPage />
    else if (section === 'projects' && !extra) page = id ? <ProjectPage id={id} /> : <ProjectsPage />
    else if (section === 'goals' && !id) page = <GoalsPage />
    else if (section === 'data' && !id) page = <DataPage />
    else if (section === 'activity' && !id) page = <ActivityPage />
    else if (section === 'users' && !id) page = member.role === 'admin' ? <UsersPage onSessionEnded={invalidate} /> : <Empty title="Administrator access required">Contact your administrator to manage accounts.</Empty>
    else page = <Empty title="Page not found"><a href={dashboardPath()}>Return to overview</a></Empty>
    content = <Workspace.Provider value={{ data, member, edit: setEditor, save, remove }}><DashboardLayout pathname={pathname} onLogout={async () => { await authService.logout(); invalidate() }}>{page}</DashboardLayout>{editor?.entity === 'teams' ? <Suspense fallback={<div className="m-toast" role="status">Opening team editor...</div>}><TeamEditor key={editor.id || 'new'} request={editor} onClose={() => setEditor(null)} /></Suspense> : editor && <RecordEditor key={`${editor.entity}-${editor.id || 'new'}`} request={editor} onClose={() => setEditor(null)} />}{notice && <div className="m-toast" role="status">✓ {notice}</div>}</Workspace.Provider>
  }
  return <div className="members-app" onClick={onClick}>{content}</div>
}
export function isMembersPath(path: string) { return path === '/login' || path === '/dashboard' || path.startsWith('/dashboard/') }
