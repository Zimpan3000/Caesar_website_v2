import { createContext, useContext } from 'react'
import type { Entity, Member, PortalData, RecordInput } from './api'

export interface EditorRequest { entity: Entity; id?: string; teamId?: string; projectId?: string; parentProjectId?: string }
export interface WorkspaceContext {
  data: PortalData
  member: Member
  edit: (request: EditorRequest) => void
  save: (entity: Entity, input: RecordInput, id?: string) => Promise<void>
  remove: (entity: Entity, id: string) => Promise<void>
}
export const Workspace = createContext<WorkspaceContext | null>(null)
export function useWorkspace() {
  const value = useContext(Workspace)
  if (!value) throw new Error('Workspace context is missing')
  return value
}
