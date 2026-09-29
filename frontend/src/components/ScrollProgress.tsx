import { subteams } from '../data/subteams'

export default function ScrollProgress({ onNavigate }: { onNavigate: (progress: number) => void }) {
  return (
    <nav className="rocket-progress" aria-label="CAESAR subteams">
      <span className="progress-track" aria-hidden="true"><span className="progress-fill" /></span>
      {subteams.map((team, index) => (
        <button key={team.id} type="button" data-stage={team.id} aria-label={`View ${team.name}`} onClick={() => onNavigate(team.progress)}>
          <span className="progress-number">0{index + 1}</span>
          <span className="progress-name" lang="en">{team.name}</span>
        </button>
      ))}
    </nav>
  )
}
