// Conceptual mechanical demonstration, not a manufacturing drawing.
export default function RecoveryMechanism() {
  return (
    <div className="recovery-mechanism">
      <p className="architecture-sr">Flight computer signal drives the servo and cam. The CO₂ canister pressurizes the recovery bay, separating the shear bolts and top section. The drag chute deploys, followed by the main parachute. Select Recovery again to replay.</p>
      <svg className="recovery-mechanical recovery-mechanical--wide" viewBox="0 0 360 155" fill="none" aria-hidden="true">
        <path className="recovery-signal" d="M8 33 H32" pathLength="1" />
        <text x="6" y="13">FC SIGNAL</text>
        <rect x="33" y="22" width="27" height="23" rx="2" />
        <g className="recovery-servo"><circle cx="46" cy="33" r="3" /><path d="M46 33 L57 26" /></g>
        <text x="32" y="62">SERVO</text>
        <path d="M60 33 H71" />
        <g className="recovery-cam"><path d="M75 25 C91 20 94 36 82 42 C71 43 69 29 75 25 Z" /><circle cx="78" cy="33" r="2" /></g>
        <text x="72" y="62">CAM</text>
        <path d="M91 33 H105" />
        <g className="recovery-canister"><rect x="106" y="23" width="17" height="35" rx="7" /><path d="M111 23 V18 H118 V23" /><circle className="recovery-trigger" cx="114" cy="18" r="2" /></g>
        <text x="105" y="75">CO₂</text>
        <path d="M114 58 V95 H151" />
        <path className="recovery-pressure-feed" d="M114 58 V95 H151" pathLength="1" />
        <path d="M151 76 V117 H231 V76" />
        <g className="recovery-top"><path d="M151 76 H231 M165 76 L191 60 L217 76" /></g>
        <path className="recovery-pressure" d="M161 108 H221 M161 99 H221 M161 90 H221" pathLength="1" />
        <g className="recovery-bolt recovery-bolt--left"><path d="M154 73 L160 79 M160 73 L154 79" /></g>
        <g className="recovery-bolt recovery-bolt--right"><path d="M222 73 L228 79 M228 73 L222 79" /></g>
        <text x="153" y="137">PRESSURIZE BAY</text>
        <text x="154" y="151">SHEAR BOLTS</text>
        <g className="recovery-drag"><path d="M242 51 Q258 24 274 51 Q266 45 258 51 Q250 45 242 51 Z M242 51 L258 77 L274 51 M258 77 L222 87" /><text x="239" y="101">DRAG CHUTE</text></g>
        <g className="recovery-main"><path d="M292 35 Q320 -7 348 35 Q334 28 320 35 Q306 28 292 35 Z M320 8 Q305 19 306 32 M320 8 Q335 19 334 32 M292 35 L320 78 L348 35 M306 32 L320 78 L334 32 M320 78 L258 77" /><text x="299" y="119">MAIN</text><text x="287" y="132">PARACHUTE</text></g>
      </svg>
      <svg className="recovery-mechanical recovery-mechanical--compact" viewBox="0 0 100 215" fill="none" aria-hidden="true">
        <text x="0" y="9">FC SIGNAL</text>
        <path className="recovery-signal" d="M13 12 V23" pathLength="1" />
        <rect x="3" y="23" width="23" height="20" rx="2" />
        <g className="recovery-servo"><circle cx="14" cy="33" r="2" /><path d="M14 33 L23 26" /></g>
        <text x="34" y="34">SERVO</text>
        <path d="M14 43 V49" />
        <g className="recovery-cam"><path d="M12 50 C28 44 30 65 16 68 C3 68 1 56 12 50 Z" /><circle cx="13" cy="58" r="2" /></g>
        <text x="34" y="60">CAM</text>
        <path d="M15 68 V77" />
        <g className="recovery-canister"><rect x="6" y="77" width="17" height="30" rx="7" /><circle className="recovery-trigger" cx="14" cy="77" r="2" /></g>
        <text x="34" y="93">CO₂</text>
        <path d="M14 107 V121 H30" />
        <path className="recovery-pressure-feed" d="M14 107 V121 H30" pathLength="1" />
        <path d="M30 111 V136 H90 V111" />
        <g className="recovery-top"><path d="M30 111 H90 M38 111 L60 101 L82 111" /></g>
        <path className="recovery-pressure" d="M36 118 H84 M36 125 H84 M36 132 H84" pathLength="1" />
        <g className="recovery-bolt recovery-bolt--left"><path d="M32 108 L37 114 M37 108 L32 114" /></g>
        <g className="recovery-bolt recovery-bolt--right"><path d="M83 108 L88 114 M88 108 L83 114" /></g>
        <text x="0" y="148">PRESSURIZE BAY</text><text x="0" y="160">SHEAR BOLTS</text>
        <g className="recovery-drag"><path d="M4 179 Q17 158 30 179 Q23 174 17 179 Q11 174 4 179 Z M4 179 L17 197 L30 179" /><text x="0" y="211">DRAG</text></g>
        <g className="recovery-main"><path d="M48 178 Q71 143 94 178 Q82 173 71 178 Q59 173 48 178 Z M71 160 Q60 167 59 176 M71 160 Q82 167 83 176 M48 178 L71 200 L94 178 M59 176 L71 200 L83 176 M71 200 H17" /><text x="49" y="211">MAIN</text></g>
      </svg>
    </div>
  )
}
