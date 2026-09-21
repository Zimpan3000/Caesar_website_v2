import { useEffect, useRef, useState } from 'react'
import '../hybrid-propulsion.css'

const areas = ['oxidizer', 'fluid', 'combustion', 'performance'] as const
type Area = typeof areas[number]
const labels: Record<Area, string> = { oxidizer: 'OXIDIZER', fluid: 'FLUID SYSTEM', combustion: 'COMBUSTION', performance: 'PERFORMANCE' }
// Initial sizing supplied by CAESAR; these are not measured flight results.
const parameters = [
  ['CHAMBER PRESSURE', '30 BAR'], ['O/F RATIO', '6.0'], ['DESIGN THRUST', '~1 kN'],
  ['BURN TIME', '~10 s'], ['SPECIFIC IMPULSE', '235.98 s'],
]

export default function HybridPropulsion({ visible }: { visible: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState<Area | null>(null)
  const [preview, setPreview] = useState<Area | null>(null)
  const selected = preview ?? pinned
  useEffect(() => {
    if (!visible) {
      setPinned(null)
      setPreview(null)
      if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
    }
  }, [visible])

  return (
    <aside ref={root} className={`hybrid-propulsion${visible ? ' is-visible' : ''}`} data-selected={selected ?? undefined}
      aria-label="Phobos hybrid propulsion architecture" aria-hidden={!visible} lang="en"
      onKeyDown={event => { if (event.key === 'Escape') { setPinned(null); setPreview(null); event.stopPropagation() } }}>
      <p className="hybrid-heading"><i aria-hidden="true" />PHOBOS <span>//</span> HYBRID ENGINE</p>
      <div className="hybrid-drawing">
        <svg className="hybrid-engine" viewBox="0 0 120 360" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="hybrid-fuel-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V6" stroke="#c3a489" strokeWidth="1" /></pattern>
            <linearGradient id="hybrid-heat" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ef8a45" stopOpacity=".03" /><stop offset="1" stopColor="#ef8a45" stopOpacity=".18" /></linearGradient>
          </defs>
          <path className="hybrid-axis" d="M60 8 V350" />
          <g className={`hybrid-part hybrid-tank${selected === 'oxidizer' ? ' is-selected' : ''}`}>
            <rect className="hybrid-outline" x="36" y="18" width="48" height="78" rx="22" pathLength="1" />
            <path className="hybrid-liquid" d="M38 57 Q60 62 82 57 V74 Q82 94 60 94 Q38 94 38 74 Z" />
            <path className="hybrid-level" d="M38 57 Q60 62 82 57" />
          </g>
          <g className={`hybrid-part hybrid-plumbing${selected === 'fluid' || selected === 'oxidizer' ? ' is-selected' : ''}`}>
            <path className="hybrid-feed hybrid-outline" d="M60 96 V208" pathLength="1" />
            <path className="hybrid-valve" d="M52 132 L68 148 V132 L52 148 Z M68 140 H77 V132" />
            <path className="hybrid-extra-plumbing" d="M60 116 H25 V107 M21 107 H29 M60 170 H89 M89 163 A7 7 0 1 1 88.9 163 M60 184 H51 L60 193 L69 184 M51 195 H69" />
            <path className="hybrid-injector" d="M38 205 H82 M38 210 H82 M45 211 V217 M55 211 V217 M65 211 V217 M75 211 V217" />
          </g>
          <g className={`hybrid-part hybrid-chamber${selected === 'combustion' ? ' is-selected' : ''}`}>
            <path className="hybrid-outline" d="M34 218 H86 V284 Q86 296 72 302 H48 Q34 296 34 284 Z" pathLength="1" />
            <path className="hybrid-warmth" d="M39 220 H81 V283 Q81 290 68 297 H52 Q39 290 39 283 Z" />
            <g className="hybrid-fuel-grain"><path d="M39 223 H51 V282 H39 Z M69 223 H81 V282 H69 Z" /><path className="hybrid-fuel-port" d="M55 225 V276 M65 225 V276" /></g>
            <path className="hybrid-gas" d="M60 224 V298" pathLength="1" />
          </g>
          <g className={`hybrid-part hybrid-nozzle${selected === 'combustion' || selected === 'performance' ? ' is-selected' : ''}`}>
            <path className="hybrid-outline" d="M48 302 Q57 310 53 318 L40 336 H80 L67 318 Q63 310 72 302" pathLength="1" />
            <g className="hybrid-vectors"><path d="M48 341 L39 357 M60 341 V360 M72 341 L81 357" /></g>
          </g>
          <path className="hybrid-flow-pulse" d="M60 84 V135 M60 146 V205 M60 216 V292" pathLength="1" />
        </svg>
        <span className="hybrid-n2o" aria-hidden="true">N₂O</span>
        {areas.map(area => (
          <button key={area} type="button" className={`hybrid-node hybrid-node--${area}${selected === area ? ' is-selected' : ''}`}
            aria-label={labels[area]} tabIndex={visible ? 0 : -1} aria-expanded={selected === area} aria-controls={`hybrid-detail-${area}`}
            onPointerEnter={event => { if (event.pointerType === 'mouse') setPreview(area) }} onPointerLeave={() => setPreview(null)}
            onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setPreview(area) }} onBlur={() => setPreview(null)}
            onClick={() => { setPinned(pinned === area ? null : area); setPreview(null) }}>
            <i aria-hidden="true" /><span>{labels[area]}<small aria-hidden="true">{area === 'oxidizer' ? 'LIQUID / FEED' : area === 'fluid' ? 'VALVE → INJECTOR' : area === 'combustion' ? 'HYBRID / CHAMBER' : 'DESIGN / SIZING'}</small></span>
          </button>
        ))}
        <span className="hybrid-nozzle-label">NOZZLE <span aria-hidden="true">↓</span> THRUST</span>
        <span className="hybrid-flow-label" aria-hidden="true">FLOW ↓</span>
      </div>
      <div className="hybrid-inspector" aria-live="polite" aria-atomic="true">
        <div id="hybrid-detail-oxidizer" className="hybrid-detail" hidden={selected !== 'oxidizer'}>
          <p className="hybrid-detail-title">LIQUID N2O // OXIDIZER</p>
          <p className="hybrid-mixture">O/F <span>//</span> 6</p>
          <p className="hybrid-explanation">Liquid oxidizer flows from the tank through the injector into the engine.</p>
        </div>
        <div id="hybrid-detail-fluid" className="hybrid-detail" hidden={selected !== 'fluid'}>
          <p className="hybrid-detail-title">FLUID SYSTEM // FEED PATH</p>
          <ol className="hybrid-chain">{['N2O TANK', 'MAIN OXIDIZER VALVE', 'PRESSURE SENSOR', 'INJECTOR'].map(item => <li key={item}>{item}</li>)}</ol>
          <p className="hybrid-secondary"><span>PRESSURE RELIEF</span><span>CHECK VALVE</span><span>QUICK DISCONNECT</span></p>
        </div>
        <div id="hybrid-detail-combustion" className="hybrid-detail" hidden={selected !== 'combustion'}>
          <p className="hybrid-detail-title">HYBRID ENGINE</p>
          <ol className="hybrid-principle"><li>N2O <span>// LIQUID OXIDIZER</span></li><li>PARAFFIN <span>// SOLID FUEL</span></li><li>COMBUSTION <span>→ NOZZLE → THRUST</span></li></ol>
          <p className="hybrid-explanation">Liquid oxidizer meets solid fuel. Hot gas exits through the nozzle, producing thrust.</p>
        </div>
        <div id="hybrid-detail-performance" className="hybrid-detail" hidden={selected !== 'performance'}>
          <p className="hybrid-detail-title">DESIGN PARAMETERS / INITIAL SIZING</p>
          <dl className="hybrid-parameters">{parameters.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </div>
      <p className="hybrid-footer" aria-hidden="true"><span>CAESAR // CHALMERS</span><span>{selected ? 'ESC / CLOSE' : 'EXPLORE THE FLOW'}</span></p>
    </aside>
  )
}
