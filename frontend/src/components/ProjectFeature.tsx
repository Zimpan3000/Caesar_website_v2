import { sitePath } from '../paths'
import { useEffect, useState } from 'react'
import { links } from '../data/site'
import Arrow from './Arrow'

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
    <section id="projekt" className="projects-section section-space" aria-labelledby="project-title">
      <div className="container">
        <div className="project-feature" data-reveal>
          <div className="project-copy"><p className="eyebrow"><span className="status-dot" /><span lang="en">Current project</span></p><h2 id="project-title">PHOBOS</h2><p className="project-subtitle">Nästa steg mot rymden.</p><p className="muted">Phobos är CAESARs pågående raketprojekt. Vi designar och utvecklar raketer för att ta Chalmers närmare drömmen: en raket som når över Kármánlinjen.</p><a className="button button-outline" href={links.phobos}>Utforska Phobos <Arrow /></a></div>
          <a className="project-visual" href={links.phobos} aria-label="Utforska raketprojektet Phobos"><div className="project-image-label"><span>CAESAR / PHOBOS</span><Arrow diagonal /></div><img src={sitePath('assets/phobos.png')} alt="Phobos – CAESARs raket med svart kropp och föreningens logotyp" width="1024" height="640" loading="lazy" /><span className="project-image-caption">Raketutveckling på Chalmers <span>01 / PHOBOS</span></span></a>
        </div>
        <div className="project-archive" data-reveal><p className="eyebrow">Fler projekt</p><div className="archive-items" aria-live="polite">
          {state === 'loading' && <p className="muted">Laddar projekt…</p>}
          {state === 'error' && <p className="muted">Projektlistan kunde inte laddas. <a href={links.projects}>Se alla projekt på caesar.se <span aria-hidden="true">↗</span></a></p>}
          {state === 'ready' && projects.length === 0 && <a className="text-link" href={links.projects}>Se alla projekt <Arrow /></a>}
          {projects.map((project) => <a className="archive-project" key={project.id} href={project.url} target="_blank" rel="noreferrer"><span className="archive-project-name">{project.title}</span><span className="muted">{project.summary}</span><Arrow diagonal /></a>)}
        </div></div>
      </div>
    </section>
  )
}
