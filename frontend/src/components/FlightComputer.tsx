import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { FlightComputerBoard, GroundStationHardware, StorageHardware, SubsystemHardware } from './AvionicsHardware'
import '../flight-computer.css'

const systems = [
  { id: 'sensing', label: 'SENSING', path: 'M190 63 V118', compact: 'M24 94 H8 V65 H60', delay: '2s', details: ['BMP390 — ALTITUDE', 'MPU6050 — MOTION / ORIENTATION'] },
  { id: 'recovery', label: 'RECOVERY', path: 'M134 176 H63', compact: 'M60 65 H8 V136 H24', delay: '8s', details: ['INITIAL PARACHUTE', 'MAIN PARACHUTE'] },
  { id: 'telemetry', label: 'TELEMETRY', path: 'M246 176 H287', compact: 'M60 65 H8 V179 H24', delay: '6s', details: ['REMOTE COMMANDS', 'FLIGHT DATA'] },
  { id: 'control', label: 'CONTROL', path: 'M190 236 V291', compact: 'M60 65 H8 V222 H24', delay: '10s', details: ['VALVE FLOWRATE', 'PARAFFIN WARMUP'] },
] as const
type System = typeof systems[number]['id']

export default function FlightComputer({ visible }: { visible: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState<System | null>(null)
  const [preview, setPreview] = useState<System | null>(null)
  const selected = preview ?? pinned

  useEffect(() => {
    if (!visible) {
      setPinned(null)
      setPreview(null)
      if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
    }
  }, [visible])

  return (
    <aside ref={root} className={`avionics${visible ? ' is-visible' : ''}`} lang="en"
      aria-label="Phobos flight computer architecture" aria-hidden={!visible} data-selected={selected ?? undefined}
      onKeyDown={event => {
        if (event.key === 'Escape') { setPinned(null); setPreview(null); event.stopPropagation() }
      }}>
      <p className="avionics-heading"><span aria-hidden="true" />PHOBOS <span className="avionics-slash">//</span> AVIONICS</p>
      <div className="avionics-diagram">
        {/* Decorative geometry only: no pinout or unverified bus assignments. */}
        <svg className="avionics-board-texture" viewBox="0 0 400 380" fill="none" aria-hidden="true">
          <path d="M15 87 H94 L115 108 V153 M48 13 V73 H112 L126 87 V129 M20 221 H84 L112 249 V340 M31 233 H72 L97 258 V310" />
          <path d="M273 13 V64 L321 112 H385 M293 19 V63 L336 106 H390 M282 244 V266 L339 323 H385 M264 260 V285 L307 328 V372 M10 363 H87 L114 336 H136" />
          <g>{[[15, 87], [48, 13], [20, 221], [273, 13], [385, 323], [307, 372]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />)}</g>
          <text x="57" y="64">FC_SYS</text><text x="343" y="99">J01</text><text x="64" y="354">DATA</text>
        </svg>
        {(['full', 'compact'] as const).map(layout => (
          <svg key={layout} className={`avionics-wires avionics-wires--${layout}`} viewBox={layout === 'full' ? '0 0 400 380' : '0 0 120 270'} preserveAspectRatio="none" fill="none" aria-hidden="true">
            {systems.map(system => (
              <g key={system.id} className={`avionics-branch${selected === system.id ? ' is-selected' : ''}`} data-system={system.id} style={{ '--event-delay': system.delay } as CSSProperties}>
                <path className="avionics-trace" d={layout === 'full' ? system.path : system.compact} pathLength="1" />
                <rect key={selected === system.id ? 'active' : 'idle'} className="avionics-packet" x="-1.5" y="-1.5" width="3" height="3" rx=".5" style={{ offsetPath: `path('${layout === 'full' ? system.path : system.compact}')` }} />
              </g>
            ))}
            <g className="avionics-data-branch" style={{ '--event-delay': '4s' } as CSSProperties}>
              <path className="avionics-storage-trace avionics-trace" d={layout === 'full' ? 'M222 236 V266 L282 309' : 'M60 65 H8 V257 H24'} pathLength="1" />
              <rect className="avionics-packet" x="-1.5" y="-1.5" width="3" height="3" rx=".5" style={{ offsetPath: `path('${layout === 'full' ? 'M222 236 V266 L282 309' : 'M60 65 H8 V257 H24'}')` }} />
            </g>
            {layout === 'full' && <g key={selected === 'telemetry' ? 'active-ground' : 'idle-ground'} className={`avionics-ground-branch${selected === 'telemetry' ? ' is-selected' : ''}`} style={{ '--event-delay': '6s' } as CSSProperties}>
              <path className="avionics-wireless-trace" d="M327 176 H342 L374 207" />
              <rect className="avionics-ground-packet" x="-1.5" y="-1.5" width="3" height="3" rx=".5" style={{ offsetPath: "path('M327 176 H342 L374 207')" }} />
            </g>}
          </svg>
        ))}
        <div className="avionics-core">
          <FlightComputerBoard />
          <span className="avionics-core-caption">FLIGHT COMPUTER</span>
        </div>
        {systems.map((system, index) => (
          <button key={system.id} type="button" className={`avionics-node avionics-node--${system.id}${selected === system.id ? ' is-selected' : ''}`}
            style={{ '--node-order': index, '--event-delay': system.delay } as CSSProperties}
            aria-label={system.label} tabIndex={visible ? 0 : -1} aria-expanded={selected === system.id} aria-controls={`avionics-detail-${system.id}`}
            onPointerEnter={event => { if (event.pointerType === 'mouse') setPreview(system.id) }}
            onPointerLeave={() => setPreview(null)}
            onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setPreview(system.id) }}
            onBlur={() => setPreview(null)}
            onClick={() => { setPinned(pinned === system.id ? null : system.id); setPreview(null) }}>
            <SubsystemHardware key={selected === system.id ? 'active' : 'idle'} system={system.id} />
            <span className="avionics-node-label">{system.label}</span>
            {system.id === 'sensing' && <span className="avionics-hardware-label" aria-hidden="true">BMP390 / MPU6050</span>}
            {system.id === 'telemetry' && <span className="avionics-hardware-label" aria-hidden="true">868 MHz</span>}
          </button>
        ))}
        <div className="avionics-storage"><StorageHardware /><span>microSD<small>FLIGHT DATA</small></span></div>
        <div key={selected === 'telemetry' ? 'active-receiver' : 'idle-receiver'} className={`avionics-ground-visual${selected === 'telemetry' ? ' is-selected' : ''}`} style={{ '--event-delay': '6s' } as CSSProperties}>
          <GroundStationHardware /><span>GROUND STATION</span>
        </div>
        <span className="avionics-signal-label" aria-hidden="true">SIGNAL / DATA</span>
      </div>
      <div className="avionics-inspector" aria-live="polite" aria-atomic="true">
        {systems.map(system => (
          <div key={system.id} id={`avionics-detail-${system.id}`} className={`avionics-detail avionics-detail--${system.id}`} hidden={selected !== system.id}>
            <p className="avionics-detail-heading">{system.id === 'telemetry' ? 'LoRa // 868 MHz' : system.id === 'sensing' ? 'SENSING // INPUT' : `${system.label} // FC OUTPUT`}</p>
            <ul>{system.details.map(detail => <li key={detail}><span className="avionics-terminal" aria-hidden="true" />{detail}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="avionics-footnote" aria-hidden="true"><span>CAESAR / CHALMERS</span><span>{selected ? 'ESC / CLOSE' : 'SELECT A SYSTEM'}</span></p>
    </aside>
  )
}
