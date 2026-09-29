import { useEffect } from 'react'
import { sitePath } from '../paths'
import { links } from '../data/site'
import type { RocketProject as RocketProjectData } from '../data/rocketProjects'
import { ProjectArtwork, ProjectFacts, ProjectStatus, ProjectTeams } from '../components/RocketProjectParts'
import Arrow from '../components/Arrow'
import { useScrollReveal } from '../useScrollReveal'

export default function RocketProject({ project }: { project: RocketProjectData }) {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    document.title = `${project.name} | CAESAR`
    if (meta) meta.content = project.tagline
    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== undefined) meta.content = previousDescription
    }
  }, [project])

  return <article className="rocket-project-page" aria-labelledby="rocket-project-title">
    <div className="container">
      <a className="text-link rocket-project-back" href={sitePath('#projekt')}><span aria-hidden="true">←</span> All Projects</a>
      <header className="rocket-project-hero">
        <p className="eyebrow"><span className="status-dot" /> CAESAR / {project.status.label}</p>
        <div className="rocket-project-title-row"><h1 id="rocket-project-title">{project.name}</h1><p>{project.tagline}</p></div>
        <ProjectArtwork project={project} priority />
        <ProjectFacts project={project} />
      </header>
      <nav className="rocket-project-sections" aria-label="On this project page">
        <a href="#projektet">The Project</a><a href="#malet">The Goal</a><a href="#raketen">The Rocket</a><a href="#utvecklingen">Development</a><a href="#teamen">The Teams</a><a href="#projektstatus">Project Status</a>
      </nav>

      <section id="projektet" className="rocket-detail-section rocket-editorial" aria-labelledby="project-purpose-title" data-reveal>
        <div><p className="eyebrow">01 / The Project</p><h2 id="project-purpose-title">From theory to<br />rocket engineering.</h2></div>
        <div className="rocket-detail-copy"><p>{project.summary}</p><p>{project.purpose}</p></div>
      </section>

      <section id="malet" className="rocket-target" aria-labelledby="project-target-title" data-reveal>
        <div className="rocket-target-value"><span className="eyebrow">Target Altitude</span><strong>{project.target.value}<span> {project.target.unit}</span></strong><span className="rocket-target-rule" aria-hidden="true" /></div>
        <div><p className="eyebrow">02 / The Goal</p><h2 id="project-target-title">One shared goal.<br />Many engineering challenges.</h2><p>{project.target.description}</p><p>Every system contributes to the whole. The project gives the teams a shared challenge to develop, integrate and learn from.</p></div>
      </section>

      <section id="raketen" className="rocket-detail-section" aria-labelledby="project-systems-title">
        <div className="rocket-editorial" data-reveal><div><p className="eyebrow">03 / The Rocket</p><h2 id="project-systems-title">Systems that<br />work together.</h2></div><p className="rocket-detail-copy">Propulsion, electronics and mechanics come together in one rocket. The interfaces between them matter just as much as each individual component.</p></div>
        <div className="rocket-system-list">{project.systems.map((system, index) => <div className="rocket-system-row" key={system.team} data-reveal>
          <span className="rocket-team-index" aria-hidden="true">0{index + 1}</span><h3>{system.title}</h3><p>{system.description}</p>
        </div>)}</div>
      </section>

      <section id="utvecklingen" className="rocket-detail-section rocket-development" aria-labelledby="project-development-title">
        <div className="rocket-editorial" data-reveal><div><p className="eyebrow">04 / Development</p><h2 id="project-development-title">Build. Test.<br />Learn. Improve.</h2></div><div className="rocket-detail-copy"><p>Rocket development is an iterative process of design, manufacturing and testing. Each result informs the next iteration.</p><p className="rocket-caption">These areas describe the development process, not completed milestones or a fixed schedule.</p></div></div>
        <ol className="rocket-development-steps">{project.development.map((step, index) => <li key={step.title} data-reveal><span className="rocket-team-index" aria-hidden="true">0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
        <div className="rocket-project-updates" data-reveal><h3>Project Updates</h3>
          {project.updates.length ? <div>{project.updates.map(update => <article key={`${update.date}-${update.title}`}><time dateTime={update.date}>{update.date}</time><h4>{update.title}</h4><p>{update.description}</p></article>)}</div> : <p>Updates on design, manufacturing and testing will appear here. No dated project updates have been published yet.</p>}
        </div>
      </section>

      <section id="teamen" className="rocket-detail-section" aria-labelledby="project-teams-title">
        <div className="rocket-editorial" data-reveal><div><p className="eyebrow">05 / The People</p><h2 id="project-teams-title">The Teams Behind {project.name[0] + project.name.slice(1).toLowerCase()}.</h2></div><p className="rocket-detail-copy">CAESAR’s engineering teams bring different skills to the shared rocket project. Explore their responsibilities, systems and ways of working.</p></div>
        <div data-reveal><ProjectTeams project={project} /></div>
      </section>
      <div id="projektstatus" data-reveal><ProjectStatus project={project} /></div>
      <div className="rocket-project-closing"><a className="text-link" href={sitePath('#projekt')}><span aria-hidden="true">←</span> Back to All Projects</a><a className="text-link" href={links.membership}>Help Build the Next Step <Arrow /></a></div>
    </div>
  </article>
}
