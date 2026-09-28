import type { Entity, ManagedMember, Member, PortalData, RecordInput } from '../../../backend/src/members/models'
export type { Activity, DataEntry, Entity, Goal, ManagedMember, Member, PortalData, Project, RecordInput, Status, Team, Update } from '../../../backend/src/members/models'

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/members${path}`, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Caesar-Client': 'members' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch { throw new ApiError('Cannot reach the members service. Check your connection and try again.', 0) }
  if (response.status === 204) return undefined as T
  if (!response.headers.get('content-type')?.includes('application/json')) throw new ApiError('The members service is unavailable. Please try again later.', 503)
  const result = await response.json()
  if (!response.ok) throw new ApiError(result.error || 'The request could not be completed.', response.status)
  return result
}

// Authentication and storage adapters are kept separate from the page components.
export const authService = {
  session: () => request<{ member: Member | null }>('/auth/session'),
  login: (username: string, password: string) => request<{ member: Member }>('/auth/login', 'POST', { username, password }),
  logout: () => request<void>('/auth/logout', 'POST'),
}
export const membersRepository = {
  remove: (entity: Entity, id: string) => request<PortalData>(`/${entity}/${encodeURIComponent(id)}`, 'DELETE'),
  read: () => request<PortalData>('/workspace'),
  save: (entity: Entity, input: RecordInput, id?: string) => request<PortalData>(`/${entity}${id ? `/${encodeURIComponent(id)}` : ''}`, id ? 'PUT' : 'POST', input),
}
export const accountService = {
  list: () => request<{ users: ManagedMember[] }>('/users'),
  create: (input: { username: string; name: string; password: string }) => request<{ saved: true }>('/users', 'POST', input),
  update: (id: string, input: { password: string } | { active: boolean }) => request<{ saved: true }>(`/users/${encodeURIComponent(id)}`, 'PATCH', input),
}
