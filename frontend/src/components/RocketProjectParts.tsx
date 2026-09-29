import { sitePath } from '../paths'
import type { RocketProject } from '../data/rocketProjects'
import Arrow from './Arrow'
import '../rocket-projects.css'

export function ProjectArtwork({ project, priority = false }: { project: RocketProject; priority?: boolean }) {
  return <figure className="rocket-project-art">
    <div className="rocket-art-heading" aria-hidden="true"><span>CAESAR / {project.name}</span><span>PROJECT VISUAL</span></div>
    <img src={sitePath(project.image.path)} alt={project.image.alt} width="1024" height="640" loading={priority ? 'eager' : 'lazy'} />
    <figcaption><span>{project.image.caption}</span><span>{project.type}</span></figcaption>
  </figure>
}

export function ProjectFacts({ project }: { project: RocketProject }) {
  return <dl className="rocket-project-facts">
    <div><dt>Project Type</dt><dd>{project.type}</dd></div>
    <div><dt>Target Altitude</dt><dd>{project.target.value} <span>{project.target.unit}</span></dd></div>
    <div><dt>Project Status</dt><dd><span className="status-dot" aria-hidden="true" />{project.status.label}</dd></div>
  </dl>
}

export function ProjectTeams({ project }: { project: RocketProject }) {
  return <div className="rocket-project-teams">
    {project.systems.map((system, index) => <a key={system.team} href={sitePath(system.path)} className="rocket-team-link">
      <span className="rocket-team-index" aria-hidden="true">0{index + 1} / ENGINEERING</span>
      <h3>{system.team}</h3><p>{system.title}</p><span className="text-link">Explore the Team <Arrow /></span>
    </a>)}
  </div>
}

export function ProjectStatus({ project }: { project: RocketProject }) {
  return <section className="rocket-project-status" aria-labelledby={`${project.slug}-status-title`}>
    <div><p className="eyebrow">Project Status</p><h2 id={`${project.slug}-status-title`}><span className="status-dot" aria-hidden="true" />{project.status.label}</h2></div>
    <p>{project.status.description}</p>
  </section>
}
