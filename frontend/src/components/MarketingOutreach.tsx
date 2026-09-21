import { sitePath } from '../paths'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import '../marketing-outreach.css'

const destinations = [
  { id: 'partners', label: 'PARTNERS', x: 62, y: 135, path: 'M140 160 H108 L62 135', compact: 'M20 130 H8 V22 H22', delay: '1.25s', details: ['PARTNERSHIPS', 'SPONSOR RELATIONS', 'COLLABORATION'] },
  { id: 'students', label: 'STUDENTS', x: 175, y: 48, path: 'M200 104 V82 L175 48', compact: 'M20 130 H8 V64 H22', delay: '5.25s', details: ['RECRUITMENT', 'COMMUNITY', 'STUDENT ENGAGEMENT'] },
  { id: 'industry', label: 'INDUSTRY', x: 95, y: 270, path: 'M174 210 L152 238 H118 L95 270', compact: '', delay: '9.25s', details: ['INDUSTRY OUTREACH', 'COLLABORATION', 'TECHNICAL NETWORK'] },
  { id: 'public', label: 'PUBLIC', x: 342, y: 114, path: 'M260 160 H287 L342 114', compact: 'M20 130 H8 V196 H22', delay: '13.25s', details: ['EVENTS', 'OUTREACH', 'PUBLIC ENGAGEMENT'] },
  { id: 'digital', label: 'DIGITAL', x: 324, y: 278, path: 'M242 204 L273 235 H302 L324 278', compact: 'M20 130 H8 V240 H22', delay: '17.25s', details: ['WEB', 'CONTENT', 'VISUAL COMMUNICATION', 'SOCIAL MEDIA'] },
] as const
type Destination = typeof destinations[number]['id']

function NetworkSymbol({ kind }: { kind: Destination }) {
  return <svg className="outreach-symbol" viewBox="0 0 40 32" fill="none" aria-hidden="true">
    <circle className="outreach-response" cx="20" cy="16" r="11" />
    {kind === 'partners' ? <g><path d="M19 11 L16 8 A5 5 0 0 0 9 15 L16 22 A5 5 0 0 0 23 15 M21 21 L24 24 A5 5 0 0 0 31 17 L24 10 A5 5 0 0 0 17 17" /><path d="M16 12 L24 20" /></g>
      : kind === 'students' ? <g><path d="M20 16 L7 8 M20 16 L33 7 M20 16 L31 26" /><circle cx="20" cy="16" r="4" /><g className="outreach-community"><circle cx="7" cy="8" r="2" /><circle cx="33" cy="7" r="2" /><circle cx="31" cy="26" r="2" /></g></g>
      : kind === 'industry' ? <g><path d="M5 9 H13 V23 H27 V9 H35 M13 16 H27" /><rect x="16" y="12" width="8" height="8" /><circle cx="5" cy="9" r="2" /><circle cx="35" cy="9" r="2" /></g>
      : kind === 'public' ? <g><circle cx="16" cy="16" r="3" /><g className="outreach-waves"><path d="M23 10 Q29 16 23 22" /><path d="M28 5 Q39 16 28 27" /></g></g>
      : <g><path d="M7 7 H24 L30 13 V26 H7 Z M24 7 V13 H30 M12 14 H19 M12 19 H24" /><path className="outreach-content" d="M34 10 H38 M34 16 H38 M34 22 H38" /></g>}
    <circle className="outreach-terminal" cx="20" cy="16" r="1.5" />
  </svg>
}

export default function MarketingOutreach({ visible }: { visible: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState<Destination | null>(null)
  const [preview, setPreview] = useState<Destination | null>(null)
  const selected = preview ?? pinned
  useEffect(() => {
    if (!visible) {
      setPinned(null)
      setPreview(null)
      if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
    }
  }, [visible])
  useEffect(() => {
    const mobile = matchMedia('(max-width: 900px)')
    const reset = () => { setPinned(null); setPreview(null) }
    mobile.addEventListener('change', reset)
    return () => mobile.removeEventListener('change', reset)
  }, [])

  return <aside ref={root} className={`marketing-outreach${visible ? ' is-visible' : ''}`} lang="en" aria-label="CAESAR outreach communication network" aria-hidden={!visible} data-selected={selected ?? undefined}
    onKeyDown={event => { if (event.key === 'Escape') { setPinned(null); setPreview(null); event.stopPropagation() } }}>
    <p className="outreach-heading">CAESAR <span>//</span> OUTREACH</p>
    <p className="outreach-subheading">COMMUNICATION NETWORK</p>
    <div className="outreach-network">
      <svg className="outreach-orbits" viewBox="0 0 400 330" fill="none" aria-hidden="true">
        <ellipse cx="200" cy="160" rx="170" ry="104" transform="rotate(-28 200 160)" />
        <path d="M126 19 A158 158 0 0 1 355 222 M68 247 A158 158 0 0 1 56 92 M26 160 H36 M200 10 V20 M365 160 H375" />
        <text x="70" y="111">LINK_01</text><text x="264" y="216">COM_03</text>
      </svg>
      {(['full', 'compact'] as const).map(layout => <svg key={layout} className={`outreach-wires outreach-wires--${layout}`} viewBox={layout === 'full' ? '0 0 400 330' : '0 0 120 270'} preserveAspectRatio="none" fill="none" aria-hidden="true">
        {destinations.filter(node => layout === 'full' || node.compact).map(node => <g key={node.id} className={`outreach-branch${selected === node.id ? ' is-selected' : ''}`} data-destination={node.id} style={{ '--signal-delay': node.delay } as CSSProperties}>
          <path className="outreach-connection" d={layout === 'full' ? node.path : node.compact} pathLength="1" />
          <g key={selected === node.id ? 'selected' : 'idle'}>
            <rect className="outreach-packet" x="-1.5" y="-1.5" width="3" height="3" style={{ offsetPath: `path('${layout === 'full' ? node.path : node.compact}')` }} />
            {node.id === 'digital' && <rect className="outreach-packet outreach-packet--follow" x="-1.5" y="-1" width="3" height="2" style={{ offsetPath: `path('${layout === 'full' ? node.path : node.compact}')` }} />}
          </g>
        </g>)}
      </svg>)}
      <div className="outreach-source">
        <svg viewBox="0 0 140 110" fill="none" role="img" aria-label="CAESAR / PHOBOS — communication source">
          <g className="outreach-source-orbit"><path d="M32 22 A50 50 0 0 1 111 25 M113 84 A50 50 0 0 1 28 85" /><ellipse cx="70" cy="55" rx="62" ry="29" transform="rotate(-27 70 55)" /></g>
          <path className="outreach-source-brackets" d="M22 33 H13 V47 M118 33 H127 V47 M13 65 V80 H22 M127 65 V80 H118" />
          <path d="M0 55 H9 M131 55 H140 M70 0 V8 M70 102 V110" />
          <image href={sitePath('assets/caesar-full.png')} x="24" y="33" width="92" height="31" />
          <text x="70" y="81" textAnchor="middle">PHOBOS</text>
          <circle className="outreach-source-status" cx="106" cy="77" r="1.8" />
        </svg>
      </div>
      {destinations.map((node, index) => <button key={node.id} type="button" className={`outreach-node outreach-node--${node.id}${selected === node.id ? ' is-selected' : ''}`}
        style={{ '--node-x': `${node.x / 4}%`, '--node-y': `${node.y / 3.3}%`, '--node-order': index, '--signal-delay': node.delay } as CSSProperties}
        tabIndex={visible ? 0 : -1} aria-expanded={selected === node.id} aria-controls={`outreach-detail-${node.id}`}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setPreview(node.id) }} onPointerLeave={() => setPreview(null)}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setPreview(node.id) }} onBlur={() => setPreview(null)}
        onClick={() => { setPinned(pinned === node.id ? null : node.id); setPreview(null) }}>
        <NetworkSymbol key={selected === node.id ? 'selected' : 'idle'} kind={node.id} />
        {node.id === 'public' ? <><span className="outreach-label-full">PUBLIC</span><span className="outreach-label-compact">OUTREACH</span></> : <span>{node.label}</span>}
      </button>)}
    </div>
    <div className="outreach-inspector" aria-live="polite" aria-atomic="true">
      {destinations.map(node => <div className="outreach-detail" id={`outreach-detail-${node.id}`} key={node.id} hidden={selected !== node.id}>
        <p className="outreach-detail-title">{node.id === 'public' ? 'OUTREACH' : node.label} <span>// CONNECT</span></p>
        <ul>{node.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
        {(node.id === 'public' || node.id === 'digital') && <p className="outreach-story">ENGINEERING <span>→</span> STORY <span>→</span> PEOPLE</p>}
      </div>)}
    </div>
    <p className="outreach-footer"><span>CAESAR / CHALMERS</span><span>{selected ? 'ESC / CLOSE' : 'EXPLORE THE NETWORK'}</span></p>
  </aside>
}
