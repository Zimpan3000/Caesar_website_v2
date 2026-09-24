import type { Subteam } from '../data/subteams'
import { sitePath } from '../paths'
import Arrow from './Arrow'

export default function TechnicalCallout({ team, index }: { team: Subteam; index: number }) {
  return (
    <section id={team.id} className={`technical-callout callout-${team.id} callout-${team.side}`} aria-labelledby={`team-title-${team.id}`} aria-hidden="true" lang="en">
      <span className="callout-line" aria-hidden="true"><i /></span>
      <p className="technical-index"><span>0{index + 1} / 04</span><span>SUBTEAM</span></p>
      <h2 id={`team-title-${team.id}`}>{team.name}</h2>
      <p className="subteam-description">{team.description}</p>
      <ul className="subteam-keywords" aria-label="Focus areas">{team.keywords.map(keyword => <li key={keyword}>{keyword}</li>)}</ul>
      <a className={`button button-outline subteam-cta ${team.id}-cta`} href={sitePath(team.id)} tabIndex={-1}>Explore {team.id[0].toUpperCase() + team.id.slice(1)} <Arrow /></a>
    </section>
  )
}
