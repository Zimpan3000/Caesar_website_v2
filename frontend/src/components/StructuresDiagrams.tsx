import { useState } from 'react'

// Conceptual drawings only: geometry and relative spacing are not specifications.
export function StructureSectionDrawing() {
  return <figure className="structures-section-plate">
    <div className="structures-plate-heading"><span>PHOBOS / SECTION STUDY</span><span>01—05</span></div>
    <div className="structures-section-art">
      <svg viewBox="0 0 420 560" fill="none" role="img" aria-label="Conceptual Phobos cutaway: nose cone, recovery bay, payload bay and electronics bay above the oxidizer tank; fins at the base.">
        <defs><pattern id="structures-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V6" stroke="currentColor" opacity=".25" /></pattern></defs>
        <path className="structures-datum" d="M142 12 V550 M48 30 V520 M42 30 H54 M42 520 H54" />
        <path className="structures-flow-line" d="M100 28 Q64 86 70 170 M184 28 Q218 86 212 170" />
        <path d="M104 118 Q109 65 142 30 Q175 65 180 118 Z" fill="url(#structures-hatch)" />
        <path d="M104 130 H180 V213 H104 Z M104 225 H180 V303 H104 Z M104 315 H180 V386 H104 Z" />
        <path className="structures-highlight" d="M116 150 H168 V191 H116 Z M120 157 L164 184 M120 184 L164 157 M109 134 L114 139 M114 134 L109 139 M170 134 L175 139 M175 134 L170 139" />
        <g className="structures-payload-lines">{[[115, 237], [145, 237], [115, 269], [145, 269]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x} ${y + 4} l5 -4 h20 v20 l-5 4 h-20 Z m0 0 h20 v20 m0 -20 l5 -4`} />)}</g>
        <path d="M115 329 H130 V370 H115 Z M141 329 H169 V352 H141 Z M147 363 H162 V375 H147 Z M130 340 H135 V379 H171 V352 M154 352 V363" />
        <g opacity=".4"><path d="M104 398 H180 V502 H104 Z M119 413 Q142 401 165 413 V470 Q142 482 119 470 Z M104 465 L78 504 V523 L104 509 M180 465 L206 504 V523 L180 509 M129 502 L120 520 H164 L155 502" /></g>
        {[[83, '01', 'NOSE CONE'], [170, '02', 'RECOVERY'], [263, '03', 'PAYLOAD'], [350, '04', 'ELECTRONICS'], [489, '05', 'FIN MOUNTING']].map(([y, number, label]) => <g key={number}><path className="structures-leader" d={`M181 ${y} H228`} /><circle cx="181" cy={y} r="2" className="structures-highlight" /><text x="242" y={Number(y) - 8} className="structures-svg-index">{number} /</text><text x="242" y={Number(y) + 10}>{label}</text></g>)}
        <text x="242" y="431" className="structures-svg-muted">OXIDIZER TANK</text><text x="242" y="448" className="structures-svg-muted">CONTEXT ONLY</text>
      </svg>
    </div>
    <figcaption><span>COMPARTMENTS / INTERFACES / RETURN</span><span>Conceptual · not to scale</span></figcaption>
  </figure>
}

const recoverySteps = [
  { title: 'Apogee / ejection command', short: 'COMMAND', copy: 'The flight system initiates recovery.', state: 'The recovery command starts the mechanical sequence.' },
  { title: 'CO₂ release', short: 'ACTUATE', copy: 'A servo rotates a cam. The cam drives a rod/needle against the refillable CO₂ cartridge, releasing the gas.', state: 'Servo rotation becomes needle movement, opening the CO₂ cartridge.' },
  { title: 'Pressurization', short: 'PRESSURIZE', copy: 'CO₂ increases the pressure inside the sealed parachute compartment.', state: 'Gas enters the sealed bay and raises its internal pressure.' },
  { title: 'Separation', short: 'SEPARATE', copy: 'Pressure produces enough force to shear the designed shear bolts and separate the rocket section.', state: 'The shear bolts fail as intended, allowing the upper section to separate.' },
  { title: 'Drag chute', short: 'DRAG CHUTE', copy: 'The drag chute is released. A longer line connects it to the main parachute; a shorter, releasable line connects it to the upper rocket section.', state: 'The shorter connection holds the drag chute to the upper section. The main parachute remains in its bag.' },
  { title: 'Main parachute', short: 'MAIN CHUTE', copy: 'A servo-operated mechanism releases the shorter connection. The drag chute then pulls the main parachute from its bag.', state: 'Releasing the shorter connection lets the longer line extract the main parachute.' },
]

export function RecoverySequence() {
  const [step, setStep] = useState(0)
  return <div className="structures-recovery-sequence" data-reveal>
    <figure className="structures-recovery-visual" id="structures-deployment-diagram">
      <div className="structures-plate-heading"><span>DEPLOYMENT STUDY</span><span>0{step + 1} / 06</span></div>
      <svg viewBox="0 0 500 470" fill="none" role="img" aria-label={recoverySteps[step].state}>
        <path className="structures-datum" d="M235 10 V450 M60 400 H445" />
        <g className="structures-lower-section"><path d="M203 312 V422 H267 V312 M211 327 H259 V394 H211 Z" /><path d="M211 353 H259 M211 367 H259 M211 381 H259" opacity=".35" /></g>
        <g className="structures-moving-section" style={{ transform: step >= 3 ? 'translateY(-45px)' : undefined }}>
          <path d="M203 300 V202 Q208 173 235 146 Q262 173 267 202 V300 Z" fill="#0a0e13" />
          <path d="M203 213 H267 M215 225 H255 V248 H215 Z M220 230 L250 243 M220 243 L250 230" />
          <text x="291" y="237">MAIN BAG</text><path className="structures-leader" d="M256 235 H283" />
          <g className={step >= 2 && step < 4 ? 'structures-lit' : ''}><path d="M212 277 H258 M212 286 H258" className="structures-pressure-lines" /></g>
        </g>
        <g className={step === 0 ? 'structures-lit' : ''}><path d="M91 350 H189" /><rect x="45" y="337" width="45" height="26" rx="2" /><text x="57" y="354">FC</text><text x="40" y="383">COMMAND</text></g>
        <g className={step >= 1 ? 'structures-lit' : ''}><path d="M230 309 V284 M228 282 H242 V303 H228 Z M235 281 V269" /><text x="307" y="301">CO₂</text><path className="structures-leader" d="M248 295 H297" /></g>
        <g className="structures-shear-left" style={{ transform: step >= 3 ? 'translateX(-17px)' : undefined }}><path className="structures-highlight" d="M197 305 L209 313 M209 305 L197 313" /></g>
        <g className="structures-shear-right" style={{ transform: step >= 3 ? 'translateX(17px)' : undefined }}><path className="structures-highlight" d="M261 305 L273 313 M273 305 L261 313" /></g>
        <g opacity={step >= 4 ? 1 : .12} className="structures-chute-state">
          <path className="structures-highlight" d="M79 101 Q115 40 151 101 Q132 89 115 101 Q96 89 79 101 Z M79 101 L115 155 L151 101" />
          <text x="55" y="38">DRAG CHUTE</text>
          <path className="structures-short-line" d={step === 5 ? 'M115 155 L150 179' : 'M115 155 L203 200'} />
          <path className="structures-long-line" d={step === 5 ? 'M115 155 Q192 130 330 196' : 'M115 155 Q99 260 216 190'} />
        </g>
        <g opacity={step === 5 ? 1 : .1} className="structures-chute-state"><path className="structures-highlight" d="M282 102 Q340 10 398 102 Q369 86 340 102 Q311 86 282 102 Z M340 34 Q312 65 311 98 M340 34 Q368 65 369 98 M282 102 L340 208 L398 102 M311 98 L340 208 L369 98 M340 208 L267 312" /><text x="304" y="23">MAIN PARACHUTE</text></g>
        <text x="49" y="445" className="structures-svg-muted">FUNCTIONAL SEQUENCE / NOT TO SCALE</text>
      </svg>
      <div className="structures-line-key"><span>— Short / releasable</span><span>┄ Long / main extraction</span></div>
      <figcaption aria-live="polite"><strong>{recoverySteps[step].short}</strong>{recoverySteps[step].state}</figcaption>
    </figure>
    <ol className="structures-deployment-steps" aria-label="Recovery deployment sequence">
      {recoverySteps.map((item, index) => <li key={item.short}><button type="button" aria-pressed={step === index} aria-controls="structures-deployment-diagram" onClick={() => setStep(index)}><span className="structures-step-number">0{index + 1}</span><span><strong>{item.title}</strong><span>{item.copy}</span></span></button></li>)}
    </ol>
  </div>
}

const ejectionStages = [
  { title: 'Ejection activates', copy: 'The recovery command releases CO₂ into the parachute bay.' },
  { title: 'Sections separate', copy: 'Pressure opens the separation joint, releasing the upper section.' },
  { title: 'Parachute deploys', copy: 'The drag chute deploys, followed by the main parachute.' },
  { title: 'Controlled descent', copy: 'The parachute slows the rocket’s return to the ground.' },
]

export function EjectionSchematic() {
  return <figure className="structures-ejection-schematic" data-reveal aria-label="Rocket ejection and recovery sequence">
    <div className="structures-plate-heading"><span>EJECTION / RECOVERY</span><span>SEQUENCE STUDY</span></div>
    <ol className="structures-ejection-stages">
      {ejectionStages.map((stage, index) => <li key={stage.title}>
        <span className="structures-label">0{index + 1} /</span>
        <svg viewBox="0 0 220 250" fill="none" aria-hidden="true">
          <path className="structures-datum" d="M110 10 V238" />
          {index < 2 ? <>
            <g transform={index === 1 ? 'translate(0 -24)' : undefined}>
              <path d="M87 112 V67 Q89 45 110 26 Q131 45 133 67 V112 Z M87 67 H133" />
              <path className="structures-highlight" d="M97 78 H123 V99 H97 Z M97 78 L123 99 M97 99 L123 78" />
            </g>
            <path d="M87 120 H133 V207 H87 Z M87 178 L72 207 V217 L87 209 M133 178 L148 207 V217 L133 209 M99 207 V215 H121 V207" />
            {index === 0 ? <>
              <rect className="structures-highlight" x="103" y="137" width="14" height="29" rx="5" />
              <path className="structures-highlight" d="M110 137 V117 M105 123 L110 117 L115 123 M96 135 L92 124 M92 130 V124 L98 127 M124 135 L128 124 M122 127 L128 124 V130" />
              <path className="structures-leader" d="M119 152 H158" /><text x="165" y="156">CO₂</text>
            </> : <>
              <path className="structures-highlight" d="M73 112 V90 M68 96 L73 90 L78 96 M147 94 V116 M142 110 L147 116 L152 110" />
              <path className="structures-long-line" d="M101 88 Q85 104 103 120" />
            </>}
          </> : <>
            <path className="structures-highlight" d="M51 75 Q110 -2 169 75 Q154 66 140 75 Q125 66 110 75 Q95 66 80 75 Q66 66 51 75 Z M110 37 Q83 47 80 75 M110 37 Q137 47 140 75 M51 75 L110 137 L169 75 M80 75 L110 137 L140 75" />
            <path d="M110 137 V156 M97 156 H123 V218 H97 Z M97 197 L86 217 V225 L97 219 M123 197 L134 217 V225 L123 219" />
            <path d="M110 145 Q79 138 72 162 M62 180 V164 Q64 152 72 146 Q80 152 82 164 V180 Z" />
            {index === 2 ? <path className="structures-highlight" d="M183 143 V108 M178 114 L183 108 L188 114" /> : <>
              <path className="structures-highlight" d="M170 154 V192 M164 186 L170 192 L176 186" />
              <path className="structures-leader" d="M45 236 H175 M57 236 L51 243 M80 236 L74 243 M103 236 L97 243 M126 236 L120 243 M149 236 L143 243 M172 236 L166 243" />
            </>}
          </>}
        </svg>
        <h3>{stage.title}</h3><p>{stage.copy}</p>
        {index < ejectionStages.length - 1 && <span className="structures-ejection-arrow" aria-hidden="true">→</span>}
      </li>)}
    </ol>
    <figcaption>Conceptual sequence · not to scale. The recovery stages are simplified here; the deployment study above shows the full sequence.</figcaption>
  </figure>
}

export function CamDrawing() {
  return <figure className="structures-cam-plate">
    <div className="structures-plate-heading"><span>ROTATION → LINEAR MOVEMENT</span><span>MECHANISM STUDY</span></div>
    <svg viewBox="0 0 560 320" fill="none" role="img" aria-label="Conceptual mechanism: a servo rotates a cam which pushes a rod and needle into the CO₂ cartridge.">
      <path className="structures-datum" d="M25 162 H535 M177 32 V289" />
      <rect x="60" y="116" width="70" height="92" rx="5" /><path d="M69 108 V116 M119 108 V116 M69 208 V216 M119 208 V216 M76 129 H112 V194 H76 Z M130 157 H177" />
      <path className="structures-cam-profile" d="M177 103 C208 89 259 133 244 175 C231 212 176 222 154 184 C134 149 148 116 177 103 Z" />
      <circle cx="177" cy="162" r="12" /><circle cx="177" cy="162" r="4" /><path d="M244 150 H339 V174 H244 Z M339 160 H377 L382 162 L377 164 H339" />
      <rect x="382" y="122" width="120" height="80" rx="31" /><path d="M382 150 H372 V174 H382" /><text x="419" y="167">CO₂</text>
      <path className="structures-highlight" d="M130 83 Q192 48 234 94 M234 94 L222 90 M234 94 L232 82 M282 128 H333 M326 121 L333 128 L326 135" />
      <path className="structures-leader" d="M95 220 V247 M177 222 V274 M304 180 V247 M444 205 V274" />
      <text x="74" y="265">SERVO</text><text x="163" y="291">CAM</text><text x="269" y="265">ROD / NEEDLE</text><text x="408" y="291">CARTRIDGE</text>
    </svg>
    <figcaption>Servo torque → cam rotation → needle displacement. Conceptual illustration; no component dimensions implied.</figcaption>
  </figure>
}

export function PayloadDrawing() {
  return <figure className="structures-payload-plate">
    <div className="structures-plate-heading"><span>PAYLOAD / CONCEPTUAL ARRANGEMENT</span><span>4 ×</span></div>
    <svg viewBox="0 0 360 320" fill="none" role="img" aria-label="Four PocketSat dummy payloads in a conceptual two by two arrangement.">
      <circle cx="180" cy="160" r="135" className="structures-datum" />
      {[[88, 80], [186, 80], [88, 178], [186, 178]].map(([x, y], index) => <g key={index}><path d={`M${x} ${y + 17} l20 -17 h64 v64 l-20 17 h-64 Z m0 0 h64 v64 m0 -64 l20 -17`} /><text x={x + 20} y={y + 56}>0{index + 1}</text></g>)}
    </svg>
    <figcaption>Non-deployable dummy payloads · not to scale</figcaption>
  </figure>
}
