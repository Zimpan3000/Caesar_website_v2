import HybridEngineDrawing from './HybridEngineDrawing'
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
        <HybridEngineDrawing selected={selected} />
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
