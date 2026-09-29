import { sitePath } from '../paths'
import { useEffect, useState } from 'react'
import { links } from '../data/site'
import Arrow from './Arrow'
import { phobos } from '../data/rocketProjects'
import { ProjectArtwork, ProjectFacts, ProjectTeams } from './RocketProjectParts'

type Project = { id: string; title: string; summary: string; url: string }

export default function ProjectFeature() {
  const [projects, setProjects] = useState<Project[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    let active = true
    async function fetchProjects() {
      try {
        const response = await fetch(import.meta.env.PROD ? sitePath('data/projects.json') : '/api/projects', { signal: controller.signal })
        if (!response.ok) throw new Error('Project request failed')
        const data: unknown = await response.json()
        if (!Array.isArray(data) || !data.every((project) => project && ['id', 'title', 'summary', 'url'].every((key) => typeof project[key] === 'string') && /^https?:\/\//.test(project.url))) throw new Error('Invalid project response')
        if (active) { setProjects(data); setState('ready') }
      } catch {
        if (active) setState('error')
      } finally { window.clearTimeout(timeout) }
    }
    fetchProjects()
    return () => { active = false; controller.abort(); window.clearTimeout(timeout) }
  }, [])

  return (
    <section id="projekt" className="projects-section project-showcase section-space" aria-labelledby="project-title">
      <div className="container">
        <header className="rocket-showcase-intro" data-reveal><div><p className="eyebrow">CAESAR / Rocket Engineering</p><h2 id="project-title">Our Projects</h2></div><p>We develop rockets through long-term student engineering projects. Technical teams work together from concept and design through manufacturing and testing, with the goal of a future launch.</p></header>
        <article className="rocket-featured" aria-labelledby="featured-project-title" data-reveal>
          <div className="rocket-featured-heading"><p className="eyebrow"><span className="status-dot" /> Current Project</p><span className="rocket-team-index">CAESAR / CHALMERS</span></div>
          <div className="rocket-featured-grid">
            <div className="project-copy"><h3 id="featured-project-title">{phobos.name}</h3><p className="rocket-featured-tagline">Building the next step together.</p><p className="muted">{phobos.summary}</p><a className="button button-primary" href={links.phobos}>Explore Phobos <Arrow /></a></div>
            <a className="rocket-featured-image" href={links.phobos} aria-label="Explore the Phobos rocket project"><ProjectArtwork project={phobos} /></a>
          </div>
          <ProjectFacts project={phobos} />
        </article>
        <div className="rocket-showcase-teams" data-reveal><div className="rocket-showcase-team-heading"><h3>One project. Many engineering disciplines.</h3><p>Propulsion, Electronics and Structures contribute different systems to the rocket. These are engineering teams working on one shared project.</p></div><ProjectTeams project={phobos} /></div>
        <div className="project-archive rocket-project-archive" data-reveal><div><p className="eyebrow">Project Archive</p><h3>Previous Projects</h3></div><div className="archive-items" aria-live="polite">
          {state === 'loading' && <p className="muted">Loading projects…</p>}
          {state === 'error' && <p className="muted">The project archive could not be loaded. <a href="https://caesar.se/projekt/">Visit the earlier project archive <span aria-hidden="true">↗</span></a></p>}
          {state === 'ready' && projects.length === 0 && <p className="muted">There are no previous projects to display yet.</p>}
          {projects.map((project) => <a className="archive-project" key={project.id} href={project.url} target="_blank" rel="noreferrer"><span className="archive-project-name">{project.title}</span><span className="muted">{project.summary}</span><Arrow diagonal /></a>)}
        </div></div>
      </div>
    </section>
  )
}
