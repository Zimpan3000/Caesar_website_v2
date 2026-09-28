import type { ReactNode } from 'react'
import { sitePath } from '../paths'
import type { Goal, Project, Status, Update } from './api'
import { useWorkspace } from './context'

export const statuses: Status[] = ['Planned', 'In Progress', 'Completed', 'Blocked']
export const categories = ['Rocket testing', 'Engine testing', 'Flight data', 'Sensor measurements', 'Electronics testing', 'Manufacturing', 'Project statistics']
export const today = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` }
export function dateLabel(date: string) { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date.length === 10 ? `${date}T12:00:00` : date)) }
export const dashboardPath = (path = '') => sitePath(`dashboard${path ? `/${path}` : ''}`)
export function navigate(path: string, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'instant' })
}
const icons: Record<string, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  teams: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2" /></>,
  projects: <><path d="M3 7V5h6l3 3h9v12H3z" /><path d="M3 8h9" /></>,
  goals: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  data: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0" /></>,
  activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
}
export function Icon({ name, size = 20 }: { name: string; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name] || icons.projects}</svg> }
export function StatusBadge({ status }: { status: Status }) { return <span className={`m-status m-status-${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span> }
export function Progress({ value, label = 'Progress' }: { value: number; label?: string }) { return <div className="m-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }} /></div> }
export function Empty({ title, children }: { title: string; children?: ReactNode }) { return <div className="m-empty"><Icon name="projects" size={28} /><h3>{title}</h3>{children && <p>{children}</p>}</div> }
export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="m-page-heading"><div><p className="m-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="m-button m-primary" onClick={onClick}><Icon name="plus" size={16} />{children}</button> }
export function Panel({ title, link, children }: { title: string; link?: { href: string; label: string }; children: ReactNode }) {
  return <section className="m-panel"><div className="m-panel-heading"><h2>{title}</h2>{link && <a className="m-text-link" href={link.href}>{link.label}<Icon name="arrow" size={15} /></a>}</div>{children}</section>
}
export function GoalCard({ goal }: { goal: Goal }) {
  const { data, edit } = useWorkspace()
  const overdue = goal.deadline < today() && goal.status !== 'Completed'
  return <article className="m-card m-goal-card"><div className="m-card-top"><span className="m-kicker">{data.teams.find(team => team.id === goal.teamId)?.name}</span><StatusBadge status={goal.status} /></div><h3>{goal.title}</h3><p>{goal.description}</p><div className="m-progress-label"><span>Progress</span><strong>{goal.progress}%</strong></div><Progress value={goal.progress} label={goal.title} /><div className="m-card-footer"><span className={overdue ? 'm-overdue' : ''}>{overdue ? 'Overdue · ' : 'Due '}{dateLabel(goal.deadline)}</span><button className="m-text-link" onClick={() => edit({ entity: 'goals', id: goal.id })}>Edit goal <Icon name="arrow" size={15} /></button></div></article>
}
export function ProjectCard({ project }: { project: Project }) {
  const { data } = useWorkspace()
  const goals = data.goals.filter(goal => goal.projectId === project.id)
  const progress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0
  return <article className="m-card m-project-card"><div className="m-card-top"><span className="m-project-icon"><Icon name="projects" /></span><StatusBadge status={project.status} /></div><h3><a href={dashboardPath(`projects/${project.id}`)}>{project.name}<Icon name="arrow" size={20} /></a></h3><p>{project.description}</p><div className="m-progress-label"><span>{goals.filter(goal => goal.status === 'Completed').length} / {goals.length} goals complete</span><strong>{progress}%</strong></div><Progress value={progress} label={`${project.name} goals`} /><div className="m-card-footer"><span>{data.teams.find(team => team.id === project.teamId)?.name}</span><span>Target {dateLabel(project.targetDate)}</span></div></article>
}
export function UpdateList({ updates }: { updates: Update[] }) {
  const { data, edit } = useWorkspace()
  if (!updates.length) return <Empty title="No updates yet">Post an update to document the next step.</Empty>
  return <div className="m-updates">{[...updates].sort((a, b) => b.date.localeCompare(a.date)).map(update => <article key={update.id} className="m-update"><div className="m-card-top"><span className="m-kicker">{data.teams.find(team => team.id === update.teamId)?.name} · {dateLabel(update.date)}</span><StatusBadge status={update.status} /></div><h3>{update.title}</h3><p>{update.description}</p><div className="m-tags">{update.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="m-card-footer"><span>By {update.author}</span><button className="m-text-link" onClick={() => edit({ entity: 'updates', id: update.id })}>Edit update</button></div></article>)}</div>
}
