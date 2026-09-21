import type { Subteam } from '../data/subteams'

export default function TechnicalCallout({ team, index }: { team: Subteam; index: number }) {
  return (
    <section id={team.id} className={`technical-callout callout-${team.id} callout-${team.side}`} aria-labelledby={`team-title-${team.id}`} aria-hidden="true" lang="en">
      <span className="callout-line" aria-hidden="true"><i /></span>
      <p className="technical-index"><span>0{index + 1} / 04</span><span>SUBTEAM</span></p>
      <h2 id={`team-title-${team.id}`}>{team.name}</h2>
      <p className="subteam-description">{team.description}</p>
      <ul className="subteam-keywords" aria-label="Focus areas">{team.keywords.map(keyword => <li key={keyword}>{keyword}</li>)}</ul>
    </section>
  )
}
