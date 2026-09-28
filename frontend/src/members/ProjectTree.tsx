import { useId, useState, type CSSProperties } from 'react'
import type { Project } from './api'
import { useWorkspace } from './context'
import { dashboardPath, dateLabel, Icon, StatusBadge } from './components'

export default function ProjectTree({ projects }: { projects: Project[] }) {
  const ids = new Set(projects.map(project => project.id))
  const roots = projects.filter(project => !project.parentProjectId || !ids.has(project.parentProjectId))
  return <div className="m-project-tree">{roots.map(project => <ProjectBranch key={project.id} project={project} projects={projects} depth={0} ancestors={[]} />)}</div>
}

function ProjectBranch({ project, projects, depth, ancestors }: { project: Project; projects: Project[]; depth: number; ancestors: string[] }) {
  const { data } = useWorkspace()
  const [expanded, setExpanded] = useState(true)
  const groupId = useId()
  const children = projects.filter(child => child.parentProjectId === project.id && child.id !== project.id && !ancestors.includes(child.id))
  const team = data.teams.find(team => team.id === project.teamId)
  const parent = data.projects.find(parent => parent.id === project.parentProjectId)
  return <div className="m-project-branch">
    <article className={`m-project-node${depth === 0 ? ' m-project-root' : ''}`} style={{ '--project-depth': Math.min(depth, 4) } as CSSProperties}>
      <div className="m-project-node-body">
        <div className="m-card-top"><span className="m-kicker">{parent ? 'Subproject' : children.length ? 'Main project' : 'Project'}</span><StatusBadge status={project.status} /></div>
        <h2><a href={dashboardPath(`projects/${project.id}`)}>{project.name}<Icon name="arrow" size={18} /></a></h2>
        {depth === 0 && <p>{project.description}</p>}
        <div className="m-project-meta"><a href={dashboardPath(`teams/${project.teamId}`)}>{team?.name || 'Team'}</a><span>Target {dateLabel(project.targetDate)}</span>{parent && <span>Part of <a href={dashboardPath(`projects/${parent.id}`)}>{parent.name}</a></span>}</div>
      </div>
      {!!children.length && <button className="m-project-toggle" aria-expanded={expanded} aria-controls={groupId} aria-label={`${expanded ? 'Collapse' : 'Expand'} subprojects of ${project.name}`} onClick={() => setExpanded(value => !value)}><span aria-hidden="true">{expanded ? '−' : '+'}</span>{children.length} {children.length === 1 ? 'subproject' : 'subprojects'}</button>}
    </article>
    {!!children.length && <div id={groupId} hidden={!expanded} role="group" aria-label={`Subprojects of ${project.name}`}>{children.map(child => <ProjectBranch key={child.id} project={child} projects={projects} depth={depth + 1} ancestors={[...ancestors, project.id]} />)}</div>}
  </div>
}
