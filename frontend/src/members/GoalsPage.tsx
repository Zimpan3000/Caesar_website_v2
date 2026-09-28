import { useState } from 'react'
import { useWorkspace } from './context'
import { AddButton, Empty, GoalCard, PageHeading, Progress, statuses } from './components'

export default function GoalsPage() {
  const { data, edit } = useWorkspace()
  const [team, setTeam] = useState('')
  const [status, setStatus] = useState('')
  const goals = data.goals.filter(goal => (!team || goal.teamId === team) && (!status || goal.status === status))
  const average = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0
  return <><PageHeading eyebrow="03 / Milestones" title="Goals & progress" description="Turn the mission into clear, measurable next steps." action={<AddButton onClick={() => edit({ entity: 'goals' })}>Create goal</AddButton>} /><div className="m-goals-overview"><div><p className="m-eyebrow">Overall progress · current view</p><strong>{average}<span>%</span></strong><Progress value={average} label="Average goal progress" /><p>{goals.filter(goal => goal.status === 'Completed').length} of {goals.length} goals completed</p></div><div className="m-status-counts">{statuses.map(item => <div key={item}><span>{item}</span><strong>{goals.filter(goal => goal.status === item).length.toString().padStart(2, '0')}</strong></div>)}</div></div><div className="m-filters"><label>Team<select aria-label="Team" value={team} onChange={event => setTeam(event.target.value)}><option value="">All teams</option>{data.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label>Status<select aria-label="Status" value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><span className="m-result-count">{goals.length} goals</span></div>{goals.length ? <div className="m-card-grid">{[...goals].sort((a, b) => a.deadline.localeCompare(b.deadline)).map(goal => <GoalCard key={goal.id} goal={goal} />)}</div> : <Empty title="No goals in this view">Create your first goal or choose another filter.</Empty>}</>
}
