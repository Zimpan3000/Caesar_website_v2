import type { TeamInformation } from './team-information'
export type Status = 'Planned' | 'In Progress' | 'Completed' | 'Blocked'
export interface Team {
  id: string; name: string; description: string; members: string[]; projectId: string; status: Status
  responsibilities?: string; workingStyle?: string; workflow?: string; projectTypes?: string
  information?: TeamInformation
}
export interface Project {
  id: string; name: string; teamId: string; description: string; status: Status; startDate: string; targetDate: string
  parentProjectId?: string
}
export interface Goal {
  id: string; title: string; teamId: string; projectId: string; description: string; deadline: string; status: Status; progress: number
}
export interface Update {
  id: string; title: string; teamId: string; projectId: string; date: string; author: string; description: string; status: Status; tags: string[]
}
export interface DataEntry {
  id: string; title: string; teamId: string; projectId: string; date: string; description: string; category: string; value: number; unit: string; notes: string
}
export interface Activity {
  id: string; date: string; actor: string; teamId: string; projectId: string; message: string; entity: Entity; entityId: string
}
export interface PortalData {
  teams: Team[]; projects: Project[]; goals: Goal[]; updates: Update[]; entries: DataEntry[]; activity: Activity[]
}
export type Entity = 'teams' | 'projects' | 'goals' | 'updates' | 'entries'
export type RecordInput = Omit<Team, 'id'> | Omit<Project, 'id'> | Omit<Goal, 'id'> | Omit<Update, 'id'> | Omit<DataEntry, 'id'>
export interface Member { id: string; name: string; username: string; role: 'admin' | 'member'; provider: 'local' | 'supabase' }
export interface ManagedMember { id: string; name: string; username: string; role: 'admin' | 'member'; active: boolean; created_at: string }
