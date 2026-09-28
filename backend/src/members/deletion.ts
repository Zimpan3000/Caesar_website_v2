import type { Entity, PortalData } from './models'

export const entityNames: Record<Entity, string> = { teams: 'team', projects: 'project', goals: 'goal', updates: 'update', entries: 'data entry' }

// Only delete the selected record. References must be removed or reassigned first.
export function deletionBlockers(data: PortalData, entity: Entity, id: string): string[] {
  const blockers: string[] = []
  const add = (count: number, label: string) => { if (count) blockers.push(`${count} ${label}`) }
  if (entity === 'teams') {
    add(data.projects.filter(row => row.teamId === id).length, 'linked projects')
    add(data.goals.filter(row => row.teamId === id).length, 'linked goals')
    add(data.updates.filter(row => row.teamId === id).length, 'linked updates')
    add(data.entries.filter(row => row.teamId === id).length, 'linked data entries')
  }
  if (entity === 'projects') {
    add(data.projects.filter(row => row.parentProjectId === id).length, 'subprojects')
    add(data.teams.filter(row => row.projectId === id).length, 'teams using this as their current project')
    add(data.goals.filter(row => row.projectId === id).length, 'linked goals')
    add(data.updates.filter(row => row.projectId === id).length, 'linked updates')
    add(data.entries.filter(row => row.projectId === id).length, 'linked data entries')
  }
  return blockers
}
