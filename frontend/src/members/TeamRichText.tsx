import { Fragment, type ReactNode } from 'react'
import { documentText, safeTeamLink, type RichNode } from '../../../backend/src/members/team-information'

export function TeamRichText({ document }: { document: RichNode }) {
  function render(node: RichNode, key: number): ReactNode {
    let children: ReactNode = node.content?.map(render)
    if (node.type === 'text' || node.type === 'hardBreak') {
      children = node.type === 'text' ? node.text : <br />
      for (const mark of node.marks || []) {
        if (mark.type === 'bold') children = <strong>{children}</strong>
        if (mark.type === 'italic') children = <em>{children}</em>
        if (mark.type === 'link' && mark.attrs && safeTeamLink(mark.attrs.href)) children = <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer">{children}</a>
      }
      return <Fragment key={key}>{children}</Fragment>
    }
    switch (node.type) {
      case 'doc': return <Fragment key={key}>{children}</Fragment>
      case 'paragraph': return <p key={key}>{children || <br />}</p>
      case 'heading': return node.attrs?.level === 3 ? <h4 key={key}>{children}</h4> : <h3 key={key}>{children}</h3>
      case 'bulletList': return <ul key={key}>{children}</ul>
      case 'orderedList': return <ol key={key} start={node.attrs?.start || 1}>{children}</ol>
      case 'listItem': return <li key={key}>{children}</li>
      default: return null
    }
  }
  return <div className="m-team-prose">{documentText(document).trim() ? render(document, 0) : <p className="m-profile-empty">Nothing documented here yet.</p>}</div>
}
