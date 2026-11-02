import type { Subteam } from '../data/subteams'
import { sitePath } from '../paths'
import Arrow from './Arrow'

const summaries = {
  electronics: 'Sensing, flight computers and telemetry. We connect the rocket’s systems and bring flight data back to the team.',
  propulsion: 'From propellants to testing, we develop the hybrid engine that will power Phobos.',
  structures: 'We design, manufacture and integrate the rocket’s mechanical systems for a stable flight and safe recovery.',
  marketing: 'We share the mission through design, storytelling and partnerships, connecting CAESAR with students and supporters.',
}

export default function TechnicalCallout({ team, index, compact = false }: { team: Subteam; index: number; compact?: boolean }) {
  return (
    <section id={team.id} className={`technical-callout callout-${team.id} callout-${team.side}`} aria-labelledby={`team-title-${team.id}`} aria-hidden="true" lang="en">
      <span className="callout-line" aria-hidden="true"><i /></span>
      <p className="technical-index"><span>0{index + 1} / 04</span><span>SUBTEAM</span></p>
      <h2 id={`team-title-${team.id}`}>{team.name}</h2>
      <p className="subteam-description">{compact ? summaries[team.id] : team.description}</p>
      <ul className="subteam-keywords" aria-label="Focus areas">{team.keywords.map(keyword => <li key={keyword}>{keyword}</li>)}</ul>
      <a className={`button button-outline subteam-cta ${team.id}-cta`} href={sitePath(team.id)} tabIndex={-1}>Explore {team.id[0].toUpperCase() + team.id.slice(1)} <Arrow /></a>
    </section>
  )
}
