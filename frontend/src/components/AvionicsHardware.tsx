// Illustrative board geometry and traces, not a PCB layout or pin/bus assignment.
export function FlightComputerBoard() {
  return (
    <svg className="avionics-pcb" viewBox="0 0 120 126" fill="none" role="img" aria-label="CAESAR flight computer board with STM32 processor">
      <path className="pcb-outline" d="M12 3 H104 L117 16 V114 L108 123 H12 L3 114 V12 Z" />
      <g className="pcb-mounts"><circle cx="12" cy="12" r="2.5" /><circle cx="108" cy="20" r="2.5" /><circle cx="12" cy="114" r="2.5" /><circle cx="108" cy="114" r="2.5" /></g>
      <g className="pcb-traces"><path d="M17 29 H28 L38 39 V47 M17 39 H25 L33 47 V52 M17 86 H27 L39 74 M47 20 V32 L50 36 M58 20 V36 M72 20 V29 L67 36 M102 40 H91 L82 49 M102 50 H91 L82 59 M102 80 H91 L79 72 M47 79 V89 L32 104 M57 79 V96 L49 104 M69 79 V90 H90 V104 M80 86 H100" /><circle cx="28" cy="29" r="1.5" /><circle cx="91" cy="50" r="1.5" /><circle cx="90" cy="90" r="1.5" /></g>
      <g className="pcb-pins">{[43, 51, 59, 67, 75].map(point => <path key={point} d={`M${point} 32 V39 M${point} 77 V84 M32 ${point} H39 M79 ${point} H86`} />)}</g>
      <rect className="pcb-chip" x="38" y="38" width="42" height="42" rx="2" />
      <circle className="pcb-chip-key" cx="43" cy="43" r="1" />
      <text className="pcb-processor" x="59" y="61" textAnchor="middle">STM32</text>
      <g className="pcb-contacts">{[0, 1, 2, 3, 4].map(index => <g key={index}><path d={`M${37 + index * 9} 4 V12 M${37 + index * 9} 114 V122`} /><path d={`M4 ${40 + index * 9} H11 M109 ${40 + index * 9} H116`} /></g>)}</g>
      <g className="pcb-components"><path d="M17 54 H25 V68 H17 Z M94 57 H103 V65 H94 Z M93 69 H103 V73 H93 Z M20 92 H30 V98 H20 Z" /></g>
      <g className="pcb-leds"><rect x="22" y="19" width="3" height="3" /><rect className="pcb-led-event" x="22" y="25" width="3" height="3" /><rect x="22" y="31" width="3" height="3" /></g>
      <text className="pcb-brand" x="61" y="108" textAnchor="middle">CAESAR // FC</text>
    </svg>
  )
}

export function SubsystemHardware({ system }: { system: 'sensing' | 'recovery' | 'telemetry' | 'control' }) {
  if (system === 'sensing') return (
    <svg className="avionics-hardware avionics-sensor-hardware" viewBox="0 0 86 46" fill="none" aria-hidden="true">
      <path className="hardware-secondary" d="M3 34 H45 M7 7 V38" />
      <path className="sensor-wave" d="M3 29 H12 L18 24 L24 26 L30 12 L35 18 L42 7" />
      <g className="sensor-orientation"><path d="M65 26 V9 M65 26 L80 34 M65 26 L53 35" /><path className="hardware-secondary" d="M55 20 L65 15 L76 21 V32 L65 38 L55 32 Z M55 20 L65 26 L76 21 M65 26 V38" /><text x="65" y="6">Z</text><text x="81" y="39">X</text><text x="48" y="41">Y</text></g>
    </svg>
  )
  if (system === 'recovery') return (
    <svg className="avionics-hardware" viewBox="0 0 56 44" fill="none" aria-hidden="true">
      <path d="M4 16 H21 V31 H4 Z M21 23 H29 M33 16 V12 H38 V16" />
      <g className="avionics-servo-arm"><circle cx="12" cy="23" r="2" /><path d="M12 23 L18 17" /></g>
      <rect x="29" y="16" width="13" height="23" rx="6" />
      <path className="hardware-secondary" d="M42 27 H49 V11 M45 15 L49 11 L53 15 M7 10 H18" />
      <circle className="hardware-active-mark" cx="35.5" cy="12" r="1.5" />
    </svg>
  )
  if (system === 'telemetry') return (
    <svg className="avionics-hardware" viewBox="0 0 56 44" fill="none" aria-hidden="true">
      <path d="M7 20 H32 V37 H7 Z M19 20 V7 M14 7 L19 12 L24 7 M11 40 V37 M17 40 V37 M23 40 V37 M29 40 V37" />
      <text className="hardware-lora" x="19.5" y="31" textAnchor="middle">LoRa</text>
      <g className="avionics-radio-arcs"><path d="M30 8 Q37 14 30 20" /><path d="M36 4 Q47 14 36 24" /><path d="M43 1 Q57 14 43 28" /></g>
    </svg>
  )
  return (
    <svg className="avionics-hardware" viewBox="0 0 56 44" fill="none" aria-hidden="true">
      <path className="hardware-secondary" d="M3 28 H12 M44 28 H53 M47 25 L51 28 L47 31" />
      <path d="M12 19 L44 37 V19 L12 37 Z M28 19 V10 M21 10 H35" />
      <g className="avionics-valve-actuator"><path d="M22 6 H34 V13 H22 Z M28 6 V2" /></g>
      <circle className="hardware-active-mark" cx="28" cy="28" r="1.5" />
    </svg>
  )
}

export function StorageHardware() {
  return (
    <svg className="avionics-sd-card" viewBox="0 0 28 36" fill="none" aria-hidden="true">
      <path d="M8 2 H24 V33 H3 V9 Z" /><path className="hardware-secondary" d="M8 3 V9 H3 M8 15 H19 V25 H8 Z" />
      <path d="M12 3 V9 M16 3 V9 M20 3 V9" />
    </svg>
  )
}

export function GroundStationHardware() {
  return (
    <svg className="avionics-ground-hardware" viewBox="0 0 38 42" fill="none" aria-hidden="true">
      <path d="M15 20 V34 M9 35 H22 M8 7 Q8 23 23 23 Z M12 18 L24 6 M21 5 L26 4 L25 9 M26 31 H35 V39 H26 Z" />
      <path className="hardware-secondary" d="M28 34 H33 M28 37 H31" />
      <circle className="avionics-receiver-flash" cx="25" cy="5" r="1.8" />
    </svg>
  )
}
