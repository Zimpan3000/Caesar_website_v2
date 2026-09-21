import { useEffect, useRef, useState, type CSSProperties } from 'react'
import RecoveryMechanism from './RecoveryMechanism'
import '../vehicle-architecture.css'

type Area = 'aero' | 'recovery' | 'payload' | 'avionics'
const callouts: { area: Area; label: string; accessible: string; compact?: string; position: number }[] = [
  { area: 'aero', label: 'NOSE', compact: 'AERO', accessible: 'Aerodynamics: nose cone', position: 11 },
  { area: 'recovery', label: 'RECOVERY', accessible: 'Recovery', position: 27 },
  { area: 'payload', label: 'PAYLOAD', accessible: 'Payload', position: 42 },
  { area: 'avionics', label: 'AVIONICS', accessible: 'Electronics bay', position: 57 },
  { area: 'aero', label: 'FINS', accessible: 'Aerodynamics: fins', position: 89 },
]

export default function VehicleArchitecture({ visible }: { visible: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState<Area | null>(null)
  const [preview, setPreview] = useState<Area | null>(null)
  const [replay, setReplay] = useState(0)
  const selected = preview ?? pinned
  useEffect(() => {
    if (!visible) {
      setPinned(null)
      setPreview(null)
      if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
    }
  }, [visible])
  const choose = (area: Area) => {
    setPinned(area === 'recovery' ? area : pinned === area ? null : area)
    setPreview(null)
    if (area === 'recovery') setReplay(value => value + 1)
  }

  return (
    <aside ref={root} className={`vehicle-architecture${visible ? ' is-visible' : ''}`} aria-label="Phobos vehicle architecture" aria-hidden={!visible} data-selected={selected ?? undefined} lang="en"
      onKeyDown={event => { if (event.key === 'Escape') { setPinned(null); setPreview(null); event.stopPropagation() } }}>
      <p className="architecture-heading"><i aria-hidden="true" />PHOBOS <span>//</span> AIRFRAME</p>
      <p className="architecture-subheading">VEHICLE ARCHITECTURE</p>
      <div className="architecture-drawing">
        <svg className="architecture-cutaway" viewBox="0 0 120 340" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path className="architecture-axis" d="M60 0 V337" />
          <g className={`architecture-section architecture-nose${selected === 'aero' ? ' is-selected' : ''}`}>
            <path className="architecture-outline" d="M38 65 Q40 35 60 10 Q80 35 82 65" pathLength="1" />
          </g>
          <g className={`architecture-section architecture-recovery${selected === 'recovery' ? ' is-selected' : ''}`}>
            <path className="architecture-outline" d="M38 65 V110 M82 65 V110" pathLength="1" />
            <path className="architecture-interior" d="M45 77 H75 V98 H45 Z M49 81 L71 94 M49 94 L71 81" />
          </g>
          <g className={`architecture-section architecture-payload${selected === 'payload' ? ' is-selected' : ''}`}>
            <path className="architecture-outline" d="M38 110 V155 M82 110 V155" pathLength="1" />
            <g className="architecture-pocket-sats">{[[44, 117], [63, 117], [44, 135], [63, 135]].map(([x, y], index) => (
              <g key={index} className={`architecture-cube architecture-cube--${index}`}><path d={`M${x} ${y + 3} l3 -3 h11 v11 l-3 3 h-11 Z m0 0 h11 v11 m0 -11 l3 -3`} /></g>
            ))}</g>
          </g>
          <g className={`architecture-section architecture-avionics${selected === 'avionics' ? ' is-selected' : ''}`}>
            <path className="architecture-outline" d="M38 155 V200 M82 155 V200" pathLength="1" />
            <g className="architecture-bay-blocks"><path d="M44 164 H54 V188 H44 Z M46 162 H52 M60 164 H76 V179 H60 Z M62 185 H72 V191 H62 Z" /><path className="architecture-cable" d="M54 173 H57 V195 H77 V176 H76 M67 179 V185" /><path className="architecture-rf" d="M79 164 Q86 169 79 174 M85 161 Q95 169 85 177 M92 158 Q105 169 92 180" /><path className="architecture-pressure-port" d="M27 188 H40 M30 185 L27 188 L30 191 M37 185 L40 188 L37 191" /><path className="architecture-thermal" d="M88 188 V195 M85 188 V195 M83 196 H90" /></g>
          </g>
          <g className="architecture-context"><path className="architecture-outline" d="M38 200 V307 H82 V200" pathLength="1" /><rect x="46" y="209" width="28" height="53" rx="10" /><path d="M49 280 H71 V299 H49 Z M55 307 L50 319 H70 L65 307" /></g>
          <g className={`architecture-section architecture-fins${selected === 'aero' ? ' is-selected' : ''}`}><path className="architecture-outline" d="M38 272 L18 312 V324 L38 308 M82 272 L102 312 V324 L82 308" pathLength="1" /></g>
          {[65, 110, 155, 200, 273].map((y, index) => <path key={y} className="architecture-boundary" d={`M38 ${y} H82`} pathLength="1" style={{ '--part-order': index } as CSSProperties} />)}
          <g className="architecture-airflow"><path d="M39 12 Q18 38 20 79 M28 8 Q6 38 9 82 M81 12 Q102 38 100 79 M92 8 Q114 38 111 82 M11 278 V309 L7 304 M109 278 V309 L113 304" /><path className="architecture-airflow-dash" d="M28 8 Q6 38 9 82 M92 8 Q114 38 111 82 M11 278 V309 M109 278 V309" /></g>
          <path className="architecture-entry-scan" d="M60 12 V325" pathLength="1" />
        </svg>
        {callouts.map(({ area, label, accessible, compact, position }, index) => (
          <button key={label} type="button" className={`architecture-callout architecture-callout--${label.toLowerCase()}${selected === area ? ' is-selected' : ''}`}
            style={{ '--callout-y': `${position}%`, '--part-order': index } as CSSProperties}
            aria-label={accessible} aria-expanded={selected === area} aria-controls={`architecture-detail-${area}`} tabIndex={visible ? 0 : -1}
            onPointerEnter={event => { if (event.pointerType === 'mouse') setPreview(area) }} onPointerLeave={() => setPreview(null)}
            onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setPreview(area) }} onBlur={() => setPreview(null)} onClick={() => choose(area)}>
            <i aria-hidden="true" /><span className={compact ? 'architecture-desktop-label' : undefined}>{label}</span>{compact && <span className="architecture-compact-label">{compact}</span>}
          </button>
        ))}
        <span className="architecture-context-label" aria-hidden="true">OXIDIZER<br />ENGINE</span>
        <span className="architecture-section-label" aria-hidden="true">SECTION / PHOBOS</span>
      </div>
      <div className="architecture-inspector" aria-live="polite" aria-atomic="true">
        <div className="architecture-detail" id="architecture-detail-aero" hidden={selected !== 'aero'}>
          <p className="architecture-detail-title">AERODYNAMICS</p>
          <p className="architecture-relation">NOSE CONE <span>→ DRAG REDUCTION</span></p>
          <p className="architecture-relation">FINS <span>→ FLIGHT STABILITY</span></p>
          <p className="architecture-stability"><span>STABILITY TARGET</span><strong>2–3 CALIBERS</strong></p>
        </div>
        <div className="architecture-detail architecture-detail--recovery" id="architecture-detail-recovery" hidden={selected !== 'recovery'}>
          <p className="architecture-detail-title">RECOVERY // DEPLOYMENT SEQUENCE</p>
          {selected === 'recovery' && <RecoveryMechanism key={replay} />}
          <p className="architecture-replay-note">SELECT RECOVERY TO REPLAY</p>
        </div>
        <div className="architecture-detail" id="architecture-detail-payload" hidden={selected !== 'payload'}>
          <p className="architecture-detail-title">PAYLOAD BAY</p>
          <p className="architecture-payload-count">4 × POCKETSAT</p>
          <p className="architecture-payload-size">50 × 50 × 50 mm</p>
          <p className="architecture-payload-mass">250 g // EACH</p>
          <p className="architecture-fixed-payload">NON-DEPLOYABLE</p>
        </div>
        <div className="architecture-detail" id="architecture-detail-avionics" hidden={selected !== 'avionics'}>
          <p className="architecture-detail-title">ELECTRONICS BAY</p>
          <p className="architecture-components">BATTERIES <span>/</span> PCB <span>/</span> SENSORS</p>
          <p className="architecture-requirements-title">STRUCTURAL REQUIREMENTS</p>
          <ul className="architecture-requirements"><li>RF TRANSPARENT</li><li>PRESSURE EQUALIZATION</li><li>THERMAL PROTECTION</li><li>CABLE MANAGEMENT</li></ul>
        </div>
      </div>
      <p className="architecture-footer" aria-hidden="true"><span>CAESAR // CHALMERS</span><span>{selected ? 'ESC / CLOSE' : 'EXPLORE THE VEHICLE'}</span></p>
    </aside>
  )
}
