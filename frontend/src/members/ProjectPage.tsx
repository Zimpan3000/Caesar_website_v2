import { useWorkspace } from './context'
import { AddButton, dashboardPath, dateLabel, Empty, GoalCard, PageHeading, StatusBadge, UpdateList } from './components'
import { DataTable } from './DataPage'
import ProjectTree from './ProjectTree'
import { projectAncestors } from './projectHierarchy'

export function ProjectsPage() {
  const { data, edit } = useWorkspace()
  return <><PageHeading eyebrow="05 / From idea to flight" title="Projects" description="The central record of what we are building, and how we get there." action={<AddButton onClick={() => edit({ entity: 'projects' })}>Create project</AddButton>} /><ProjectTree projects={data.projects} />{!data.projects.length && <Empty title="No projects yet">Create a project to bring goals, updates and results together.</Empty>}</>
}
export default function ProjectPage({ id }: { id: string }) {
  const { data, edit } = useWorkspace()
  const project = data.projects.find(project => project.id === id)
  if (!project) return <Empty title="Project not found"><a href={dashboardPath('projects')}>Back to projects</a></Empty>
  const ancestors = projectAncestors(project, data.projects)
  const descendants = data.projects.filter(item => projectAncestors(item, data.projects).some(parent => parent.id === id))
  const team = data.teams.find(team => team.id === project.teamId)
  const goals = data.goals.filter(goal => goal.projectId === id)
  return <><a className="m-back-link" href={dashboardPath('projects')}>← All projects</a><nav className="m-project-breadcrumbs" aria-label="Project hierarchy">{ancestors.map(parent => <a key={parent.id} href={dashboardPath(`projects/${parent.id}`)}>{parent.name}<span aria-hidden="true"> / </span></a>)}<span aria-current="page">{project.name}</span></nav><PageHeading eyebrow={ancestors.length ? "Subproject / What we are building" : "Project documentation / What we are building"} title={project.name} description={project.description} action={<button className="m-button" onClick={() => edit({ entity: 'projects', id })}>Edit project</button>} /><div className="m-detail-strip"><div><span>Status</span><StatusBadge status={project.status} /></div><div><span>Lead team</span><a className="m-text-link" href={dashboardPath(`teams/${project.teamId}`)}>{team?.name}</a></div><div><span>Started</span><strong>{dateLabel(project.startDate)}</strong></div><div><span>Target date</span><strong>{dateLabel(project.targetDate)}</strong></div></div><div className="m-section-heading"><div><p className="m-eyebrow">Work breakdown</p><h2>Subprojects</h2></div><AddButton onClick={() => edit({ entity: 'projects', parentProjectId: id, teamId: project.teamId })}>Create subproject</AddButton></div>{descendants.length ? <ProjectTree projects={descendants} /> : <Empty title="No subprojects yet">Break a larger project into focused pieces of work when you need to.</Empty>}<div className="m-section-heading"><div><p className="m-eyebrow">01 / What comes next</p><h2>Project goals</h2></div><AddButton onClick={() => edit({ entity: 'goals', projectId: id, teamId: project.teamId })}>Create goal</AddButton></div>{goals.length ? <div className="m-card-grid">{goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}</div> : <Empty title="Define the next milestone" />}<div className="m-section-heading"><div><p className="m-eyebrow">02 / What we are doing</p><h2>Project updates</h2></div><AddButton onClick={() => edit({ entity: 'updates', projectId: id, teamId: project.teamId })}>Post update</AddButton></div><section className="m-panel"><UpdateList updates={data.updates.filter(update => update.projectId === id)} /></section><div className="m-section-heading"><div><p className="m-eyebrow">03 / What we have learned</p><h2>Results & collected data</h2></div><AddButton onClick={() => edit({ entity: 'entries', projectId: id, teamId: project.teamId })}>Add data entry</AddButton></div><section className="m-panel"><DataTable entries={data.entries.filter(entry => entry.projectId === id)} /></section></>
}
