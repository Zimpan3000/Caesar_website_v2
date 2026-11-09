import { useEffect } from 'react'
import { boardMembers } from '../data/boardMembers'
import { sitePath } from '../paths'
import '../board.css'

const introduction = 'Meet the students leading CAESAR and supporting the development of our projects and community.'

export default function Board() {
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Board of Directors | CAESAR'
    if (description) description.content = introduction
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <article className="board-page" aria-labelledby="board-title">
    <div className="container">
      <header className="board-hero">
        <h1 id="board-title">Board of Directors</h1>
        <p>{introduction}</p>
      </header>
      <ul className="board-grid" aria-label="Board members" role="list">
        {boardMembers.map(member => <li className="board-card" key={member.name}>
          <div className="board-portrait">
            {member.image
              ? <img src={sitePath(member.image)} alt={member.name} width="240" height="240" loading="lazy" />
              : <svg viewBox="0 0 120 120" fill="currentColor" aria-hidden="true" focusable="false">
                  <circle cx="60" cy="42" r="19" />
                  <path d="M22 105c0-24 15-38 38-38s38 14 38 38H22Z" />
                </svg>}
          </div>
          <h2>{member.name}</h2>
          <p>{member.role}</p>
        </li>)}
      </ul>
    </div>
  </article>
}
