import { useState } from 'react'
import type { Activity } from './api'
import { useWorkspace } from './context'
import { dashboardPath, dateLabel, Empty, Icon, PageHeading } from './components'

export function ActivityFeed({ items }: { items: Activity[] }) {
  const { data } = useWorkspace()
  if (!items.length) return <Empty title="No activity yet">Your team's changes will appear here.</Empty>
  return <ol className="m-activity-list">{[...items].sort((a, b) => b.date.localeCompare(a.date)).map(item => <li key={item.id}><span className={`m-activity-icon m-activity-${item.entity}`}><Icon name={item.entity === 'entries' ? 'data' : item.entity === 'updates' ? 'activity' : item.entity} size={17} /></span><div><p>{item.message}</p><span>{dateLabel(item.date)} · {item.actor}</span></div>{data[item.entity].some(record => record.id === item.entityId) && <a className="m-icon-button" aria-label={`View ${item.message}`} href={dashboardPath(item.entity === 'teams' ? `teams/${item.entityId}` : item.entity === 'projects' ? `projects/${item.entityId}` : item.entity === 'goals' ? 'goals' : item.entity === 'entries' ? 'data' : item.projectId ? `projects/${item.projectId}` : `teams/${item.teamId}`)}><Icon name="arrow" size={16} /></a>}</li>)}</ol>
}
export default function ActivityPage() {
  const { data } = useWorkspace()
  const [team, setTeam] = useState('')
  const activity = data.activity.filter(item => !team || item.teamId === team)
  return <><PageHeading eyebrow="06 / Shared log" title="Activity" description="The latest work, documented across CAESAR." /><div className="m-filters"><label>Team<select aria-label="Team" value={team} onChange={event => setTeam(event.target.value)}><option value="">All teams</option>{data.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><span className="m-result-count">{activity.length} actions</span></div><section className="m-panel"><ActivityFeed items={activity} /></section></>
}
