export const teamSections = [
  { key: 'description', title: 'About', label: 'Description', hint: 'Introduce the team and what it does.' },
  { key: 'responsibilities', title: 'Responsibilities', label: 'Responsibilities', hint: 'Describe what the team owns and delivers.' },
  { key: 'workingStyle', title: 'How we work', label: 'How we work', hint: 'Share how you collaborate and make decisions.' },
  { key: 'workflow', title: 'Workflow / process', label: 'Workflow / process', hint: 'Outline your process, step by step.' },
  { key: 'projectTypes', title: 'Types of projects', label: 'Types of projects', hint: 'Explain the kinds of work this team takes on.' },
] as const
export type TeamSectionKey = typeof teamSections[number]['key']
export interface RichMark { type: 'bold' | 'italic' | 'link'; attrs?: { href: string } }
export interface RichNode {
  type: 'doc' | 'paragraph' | 'heading' | 'text' | 'bulletList' | 'orderedList' | 'listItem' | 'hardBreak'
  content?: RichNode[]; text?: string; marks?: RichMark[]; attrs?: { level?: number; start?: number }
}
export interface TeamInformation { version: 1; sections: Record<TeamSectionKey, RichNode> }
export const teamTextLimit = 25000
export function safeTeamLink(value: string): boolean {
  if (/[\s\u0000-\u001f\u007f]/.test(value) || value.length > 2048) return false
  try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) && (url.protocol === 'mailto:' ? !!url.pathname : !!url.hostname) } catch { return false }
}
export function textDocument(text: string): RichNode {
  const content: RichNode[] = []
  text.split('\n').forEach((line, index) => {
    if (index) content.push({ type: 'hardBreak' })
    if (line) content.push({ type: 'text', text: line })
  })
  return { type: 'doc', content: [{ type: 'paragraph', content }] }
}
export function documentText(node: RichNode): string {
  if (node.type === 'text') return node.text || ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content || []).map(documentText).join(['paragraph', 'heading'].includes(node.type) ? '' : '\n')
}
export function teamInformation(team: Partial<Record<TeamSectionKey, string>> & { information?: TeamInformation }): TeamInformation {
  return team.information || { version: 1, sections: Object.fromEntries(teamSections.map(({ key }) => [key, textDocument(team[key] || '')])) as Record<TeamSectionKey, RichNode> }
}

// Rebuild an allowlisted document. No HTML, arbitrary attributes or unsafe URLs
// are stored or passed to the React renderer.
export function validateTeamInformation(input: unknown): TeamInformation {
  const fail = (): never => { throw new Error('Invalid team information. Use paragraphs, headings, lists and safe web or email links.') }
  if (!input || typeof input !== 'object' || JSON.stringify(input).length > 300000) return fail()
  const raw = input as Record<string, unknown>
  if (raw.version !== 1 || !raw.sections || typeof raw.sections !== 'object' || Array.isArray(raw.sections)) return fail()
  const sections = {} as Record<TeamSectionKey, RichNode>
  for (const { key } of teamSections) {
    let nodes = 0
    function parse(value: unknown, depth: number): RichNode {
      if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 12 || ++nodes > 4000) return fail()
      const node = value as Record<string, any>
      const type = node.type as RichNode['type']
      if (!['doc', 'paragraph', 'heading', 'text', 'bulletList', 'orderedList', 'listItem', 'hardBreak'].includes(type)) return fail()
      const result: RichNode = { type }
      if (type === 'text') {
        if (typeof node.text !== 'string' || !node.text || node.content) return fail()
        result.text = node.text
      } else if (node.text !== undefined) return fail()
      if (type === 'heading') {
        if (![2, 3].includes(node.attrs?.level)) return fail()
        result.attrs = { level: node.attrs.level }
      }
      if (type === 'orderedList') {
        const start = node.attrs?.start ?? 1
        if (!Number.isInteger(start) || start < 1 || start > 10000) return fail()
        result.attrs = { start }
      }
      if (node.marks !== undefined) {
        if (!['text', 'hardBreak'].includes(type) || !Array.isArray(node.marks) || node.marks.length > 3) return fail()
        const seen = new Set()
        result.marks = node.marks.map((mark: any): RichMark => {
          if (!mark || !['bold', 'italic', 'link'].includes(mark.type) || seen.has(mark.type)) return fail()
          seen.add(mark.type)
          if (mark.type === 'link') {
            if (typeof mark.attrs?.href !== 'string' || !safeTeamLink(mark.attrs.href)) return fail()
            return { type: 'link', attrs: { href: mark.attrs.href } }
          }
          return { type: mark.type }
        })
      }
      if (node.content !== undefined) {
        if (!Array.isArray(node.content) || ['text', 'hardBreak'].includes(type)) return fail()
        result.content = node.content.map((child: unknown) => parse(child, depth + 1))
      }
      const children = result.content || []
      const blocks = ['paragraph', 'heading', 'bulletList', 'orderedList']
      if (type === 'doc' && (depth !== 0 || !children.length || children.some(child => !blocks.includes(child.type)))) return fail()
      if (['paragraph', 'heading'].includes(type) && children.some(child => !['text', 'hardBreak'].includes(child.type))) return fail()
      if (['bulletList', 'orderedList'].includes(type) && (!children.length || children.some(child => child.type !== 'listItem'))) return fail()
      if (type === 'listItem' && (children[0]?.type !== 'paragraph' || children.some(child => !blocks.includes(child.type)))) return fail()
      return result
    }
    const doc = parse((raw.sections as Record<string, unknown>)[key], 0)
    if (doc.type !== 'doc' || documentText(doc).length > teamTextLimit) return fail()
    sections[key] = doc
  }
  return { version: 1, sections }
}
