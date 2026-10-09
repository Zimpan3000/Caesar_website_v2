import { useId } from 'react'

// Shared functional illustration; not a dimensioned manufacturing drawing.
export default function HybridEngineDrawing({ selected = null }: { selected?: 'oxidizer' | 'fluid' | 'combustion' | 'performance' | null }) {
  const id = useId()
  return (
    <svg className="hybrid-engine" viewBox="0 0 120 360" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V6" stroke="#c3a489" strokeWidth="1" /></pattern>
            <linearGradient id={`${id}-heat`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ef8a45" stopOpacity=".03" /><stop offset="1" stopColor="#ef8a45" stopOpacity=".18" /></linearGradient>
          </defs>
          <path className="hybrid-axis" d="M60 8 V350" />
          <g className={`hybrid-part hybrid-tank${selected === 'oxidizer' ? ' is-selected' : ''}`}>
            <rect className="hybrid-outline" x="36" y="8" width="48" height="132" rx="22" pathLength="1" />
            <path className="hybrid-liquid" d="M38 74 Q60 79 82 74 V118 Q82 138 60 138 Q38 138 38 118 Z" />
            <path className="hybrid-level" d="M38 74 Q60 79 82 74" />
          </g>
          <g className={`hybrid-part hybrid-plumbing${selected === 'fluid' || selected === 'oxidizer' ? ' is-selected' : ''}`}>
            <path className="hybrid-feed hybrid-outline" d="M60 140 V208" pathLength="1" />
            <path className="hybrid-valve" d="M52 156 L68 172 V156 L52 172 Z M68 164 H77 V156" />
            <path className="hybrid-extra-plumbing" d="M60 150 H25 V141 M21 141 H29 M60 182 H89 M89 175 A7 7 0 1 1 88.9 175 M60 190 H51 L60 199 L69 190 M51 201 H69" />
            <path className="hybrid-injector" d="M38 205 H82 M38 210 H82 M45 211 V217 M55 211 V217 M65 211 V217 M75 211 V217" />
          </g>
          <g className={`hybrid-part hybrid-chamber${selected === 'combustion' ? ' is-selected' : ''}`}>
            <path className="hybrid-outline" d="M34 218 H86 V284 Q86 296 72 302 H48 Q34 296 34 284 Z" pathLength="1" />
            <path className="hybrid-warmth" style={{ fill: `url(#${id}-heat)` }} d="M39 220 H81 V283 Q81 290 68 297 H52 Q39 290 39 283 Z" />
            <g className="hybrid-fuel-grain"><path style={{ fill: `url(#${id}-hatch)` }} d="M39 223 H51 V282 H39 Z M69 223 H81 V282 H69 Z" /><path className="hybrid-fuel-port" d="M55 225 V276 M65 225 V276" /></g>
            <path className="hybrid-gas" d="M60 224 V298" pathLength="1" />
          </g>
          <g className={`hybrid-part hybrid-nozzle${selected === 'combustion' || selected === 'performance' ? ' is-selected' : ''}`}>
            <path className="hybrid-outline" d="M48 302 Q57 310 53 318 L40 336 H80 L67 318 Q63 310 72 302" pathLength="1" />
            <g className="hybrid-vectors"><path d="M48 341 L39 357 M60 341 V360 M72 341 L81 357" /></g>
          </g>
          <path className="hybrid-flow-pulse" d="M60 128 V159 M60 170 V205 M60 216 V292" pathLength="1" />
        </svg>
  )
}
