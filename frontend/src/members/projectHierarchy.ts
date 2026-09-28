import type { Project } from './api'

export function projectAncestors(project: Project, projects: Project[]): Project[] {
  const result: Project[] = []
  const seen = new Set([project.id])
  let parent = projects.find(item => item.id === project.parentProjectId)
  while (parent && !seen.has(parent.id)) {
    result.unshift(parent)
    seen.add(parent.id)
    parent = projects.find(item => item.id === parent?.parentProjectId)
  }
  return result
}

export function parentChoices(projects: Project[], id?: string) {
  return projects.filter(project => project.id !== id && !projectAncestors(project, projects).some(parent => parent.id === id))
}

// Keep ancestors as context when a team's projects belong to another team's main project.
export function teamProjects(projects: Project[], teamId: string, featuredId: string) {
  const owned = new Set(projects.filter(project => project.teamId === teamId || project.id === featuredId).map(project => project.id))
  const included = new Set<string>()
  for (const project of projects) {
    if (owned.has(project.id) || projectAncestors(project, projects).some(parent => owned.has(parent.id))) {
      included.add(project.id)
      for (const parent of projectAncestors(project, projects)) included.add(parent.id)
    }
  }
  return projects.filter(project => included.has(project.id))
}
