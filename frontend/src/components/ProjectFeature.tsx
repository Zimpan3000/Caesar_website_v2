import { links } from '../data/site'
import Arrow from './Arrow'
import { phobos } from '../data/rocketProjects'
import { ProjectArtwork, ProjectFacts, ProjectTeams } from './RocketProjectParts'

export default function ProjectFeature() {
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
      </div>
    </section>
  )
}
