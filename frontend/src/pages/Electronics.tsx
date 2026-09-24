import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import SectionHeader from '../components/SectionHeader'
import { FlightComputerBoard, SubsystemHardware, StorageHardware, GroundStationHardware } from '../components/AvionicsHardware'
import { sitePath } from '../paths'
import { useScrollReveal } from '../useScrollReveal'
import '../electronics.css'

type SymbolKind = 'sensing' | 'recovery' | 'telemetry' | 'control' | 'storage' | 'ground'
function Symbol({ kind }: { kind: SymbolKind }) {
  return <span className="electronics-symbol">{kind === 'storage' ? <StorageHardware /> : kind === 'ground' ? <GroundStationHardware /> : <SubsystemHardware system={kind} />}</span>
}

const outputs: { title: string; detail: string; kind: SymbolKind }[] = [
  { title: 'MicroSD', detail: 'Onboard data logging', kind: 'storage' },
  { title: 'LoRa', detail: '868 MHz telemetry', kind: 'telemetry' },
  { title: 'Recovery', detail: 'Parachute interfaces', kind: 'recovery' },
  { title: 'Propulsion', detail: 'Valve control interfaces', kind: 'control' },
]

function Architecture({ detailed = false }: { detailed?: boolean }) {
  return <figure className={`electronics-architecture${detailed ? ' is-detailed' : ''}`} aria-label={detailed ? 'Phobos system architecture' : 'Electronics system overview'}>
    <div className="architecture-inputs">{(detailed ? ['BMP390 / Altitude', 'MPU6050 / Motion'] : ['Sensors / Altitude & motion']).map(label => <div className="architecture-node" key={label}><Symbol kind="sensing" /><span>{label}</span></div>)}</div>
    <div className="architecture-core"><span className="engineering-label">ONBOARD PROCESSING</span><strong>{detailed ? 'STM32 Flight Computer' : 'Flight Computer'}</strong><span>Sense. Process. Coordinate.</span></div>
    <div className="architecture-branches">{outputs.map(output => <div className="architecture-branch" key={output.title}><div className="architecture-node"><Symbol kind={output.kind} /><strong>{output.title}</strong><span>{output.detail}</span></div>{output.kind === 'telemetry' && <div className="architecture-ground"><Symbol kind="ground" /><strong>Ground Station</strong><span>LoRa receiver → laptop</span></div>}</div>)}</div>
    <figcaption>{detailed ? 'Functional interfaces shown. Mandatory CATS Vega and its ground station operate alongside this custom system.' : 'Sensor data feeds the flight computer, connecting flight decisions, recorded data, and the team on the ground.'}</figcaption>
  </figure>
}

const modules: { name: string; role: string; copy: string; kind: SymbolKind }[] = [
  { name: 'BMP390', role: 'Barometer / Altimeter', copy: 'Measures atmospheric pressure and provides altitude data.', kind: 'sensing' },
  { name: 'MPU6050', role: 'Accelerometer + Gyroscope', copy: 'Measures acceleration and angular velocity to help understand motion and orientation.', kind: 'sensing' },
  { name: 'MicroSD', role: 'Data Logging', copy: 'Stores flight telemetry onboard using SPI and FATFS.', kind: 'storage' },
  { name: 'LoRa 868 MHz', role: 'Telemetry', copy: 'Provides long-range communication between Phobos and the ground station.', kind: 'telemetry' },
]
const requirements: { id: string; title: string; group: string; kind: SymbolKind }[] = [
  { id: 'F1', title: 'Determine altitude', group: 'Navigation / sensing', kind: 'sensing' },
  { id: 'F2', title: 'Deploy initial parachute', group: 'Recovery', kind: 'recovery' },
  { id: 'F3', title: 'Deploy main parachute', group: 'Recovery', kind: 'recovery' },
  { id: 'F4', title: 'Store telemetry data', group: 'Data & communication', kind: 'storage' },
  { id: 'F5', title: 'Flowrate control', group: 'Propulsion', kind: 'control' },
  { id: 'F6', title: 'Paraffin warmup', group: 'Propulsion', kind: 'control' },
  { id: 'F7', title: 'Remote communication', group: 'Data & communication', kind: 'ground' },
  { id: 'F8', title: 'Remote telemetry', group: 'Data & communication', kind: 'telemetry' },
]
const euroc = [
  { title: 'Independent by design', items: ['Redundant recovery electronics', 'Independent power supplies', 'Commercial off-the-shelf (COTS) backup flight computer', 'Six-hour launch-rail battery life'] },
  { title: 'A controlled return', items: ['Dual deployment recovery', 'Initial deployment near apogee', 'Main deployment ≤ 450 m AGL (above ground level)'] },
  { title: 'Shared flight reference', items: ['Mandatory CATS Vega flight computer', 'CATS Ground Station', 'RF transparency and antenna placement'] },
  { title: 'Ready for the environment', items: ['Secure safety-critical wiring', 'Electronics thermal testing', 'Safe/arm system for energetic devices'] },
]

export default function Electronics() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    document.title = 'Electronics · Phobos | CAESAR'
    if (meta) meta.content = 'Inside the nervous system of Phobos: CAESAR’s flight computer, sensing, telemetry, recovery interfaces, and ground-test electronics.'
    return () => { document.title = previousTitle; if (meta && previousDescription !== undefined) meta.content = previousDescription }
  }, [])

  return <div className="electronics-page" lang="en">
    <section className="electronics-hero" aria-labelledby="electronics-title">
      <div className="container">
        <a className="text-link electronics-back" href={sitePath('#electronics')}><span aria-hidden="true">←</span> Phobos / Our subteams</a>
        <div className="electronics-hero-grid">
          <div><p className="eyebrow"><span className="status-dot" /> Electronics</p><h1 id="electronics-title">The nervous<br />system of<br /><span>Phobos.</span></h1><p className="electronics-lead">Sensing the flight. Connecting the systems.<br />Bringing the data home.</p><p className="electronics-hero-copy">We develop the sensing, onboard computing, data logging, telemetry, and communication that connect Phobos to its critical rocket systems.</p><a className="text-link" href="#overview">Inside the electronics <span aria-hidden="true">↓</span></a></div>
          <figure className="electronics-hero-art"><div className="electronics-art-label"><span>PHOBOS / AVIONICS</span><span>IN DEVELOPMENT</span></div><div className="electronics-circuit" aria-hidden="true"><svg className="electronics-traces" viewBox="0 0 500 500" fill="none"><circle cx="250" cy="250" r="215" /><circle cx="250" cy="250" r="175" /><path d="M0 120 H110 L175 185 M0 380 H110 L175 315 M325 185 L390 120 H500 M325 315 L390 380 H500 M250 0 V160 M250 340 V500" /><g><circle cx="110" cy="120" r="4" /><circle cx="390" cy="120" r="4" /><circle cx="110" cy="380" r="4" /><circle cx="390" cy="380" r="4" /></g></svg><FlightComputerBoard /><span className="circuit-label circuit-label-top">SENSOR INPUT</span><span className="circuit-label circuit-label-bottom">TELEMETRY / CONTROL</span></div><figcaption><span>CAESAR FLIGHT COMPUTER</span><span>Functional illustration</span></figcaption></figure>
        </div>
        <div className="electronics-hero-strip"><span>01 / PHOBOS PROGRAMME</span><span>EMBEDDED SYSTEMS</span><span>FROM GROUND TEST TO FLIGHT</span></div>
      </div>
    </section>

    <section id="overview" className="section-space" aria-labelledby="overview-title"><div className="container">
      <div className="electronics-editorial" data-reveal><div><p className="eyebrow">01 / The connected rocket</p><h2 id="overview-title">One system.<br />Every flight signal.</h2></div><p className="electronics-copy">Phobos uses onboard electronics to collect sensor data, determine flight state, communicate with the ground, and store telemetry. The flight computer brings these functions together and interfaces with recovery and propulsion, turning measurements into information the rocket and the team can use.</p></div>
      <div data-reveal><Architecture /></div>
    </div></section>

    <section id="flight-computer" className="electronics-band section-space" aria-label="CAESAR Flight Computer"><div className="container">
      <SectionHeader label="02 / Onboard computing" title="CAESAR Flight Computer" />
      <div className="electronics-computer-layout" data-reveal><div className="electronics-processor"><span className="engineering-label">THE CORE / IN DEVELOPMENT</span><FlightComputerBoard /><h3>STM32F411</h3><p>Flight Computer</p><div className="processor-spec"><strong>100 <span>MHz</span></strong><span>ARM microcontroller</span></div><p className="processor-part">STM32F411CEU6 BlackPill</p><p className="electronics-copy">Our own flight computer runs the onboard logic and coordinates the electronics system.</p></div><div className="electronics-modules">{modules.map((module, i) => <article key={module.name} className="electronics-module"><div className="module-top"><Symbol kind={module.kind} /><span className="engineering-label">0{i + 1}</span></div><h3>{module.name}</h3><span className="module-role">{module.role}</span><p>{module.copy}</p></article>)}</div></div>
    </div></section>

    <section className="section-space" aria-label="Flight computer responsibilities"><div className="container"><SectionHeader label="03 / Flight computer responsibilities" title="Eight functions. One mission." /><p className="electronics-section-intro">The requirements guiding our flight computer’s development, from measuring altitude to supporting recovery and propulsion.</p><div className="electronics-requirements">{requirements.map(req => <article key={req.id} data-reveal><div><span className="requirement-id">{req.id}</span><Symbol kind={req.kind} /></div><p className="engineering-label">{req.group}</p><h3>{req.title}</h3></article>)}</div></div></section>

    <section id="telemetry" className="electronics-band section-space" aria-labelledby="telemetry-title"><div className="container"><div className="electronics-editorial" data-reveal><div><p className="eyebrow">04 / Telemetry</p><h2 id="telemetry-title">Flight data.<br />Ground perspective.</h2></div><p className="electronics-copy">Telemetry is the radio link that lets the team receive flight data from Phobos during operation. LoRa transmits that data to a ground receiver and laptop, while MicroSD logging keeps a record onboard.</p></div><figure className="telemetry-visual" data-reveal aria-label="Phobos transmits telemetry over LoRa 868 MHz to a ground receiver connected to a laptop ground station"><div className="telemetry-endpoint"><svg viewBox="0 0 80 130" fill="none" aria-hidden="true"><path d="M40 5 Q24 24 25 43 V100 H55 V43 Q56 24 40 5 Z M25 74 L10 102 V117 L25 108 M55 74 L70 102 V117 L55 108 M32 100 V114 H48 V100 M25 43 H55" /><circle cx="40" cy="58" r="6" /></svg><strong>Phobos</strong><span>Onboard telemetry</span></div><div className="telemetry-radio"><span className="engineering-label">LoRa / 868 MHz</span><svg viewBox="0 0 400 100" fill="none" aria-hidden="true"><path d="M0 50 H400" /><g><path d="M85 35 Q102 50 85 65 M112 21 Q144 50 112 79 M140 7 Q188 50 140 93 M215 35 Q232 50 215 65 M242 21 Q274 50 242 79 M270 7 Q318 50 270 93" /></g></svg><span>Radio telemetry →</span></div><div className="telemetry-endpoint"><Symbol kind="ground" /><strong>Ground receiver</strong><span>↓</span><strong>Laptop / Ground Station</strong></div><figcaption>Two paths for flight data: transmitted to the team and stored onboard.</figcaption></figure></div></section>

    <section className="electronics-testing section-space" aria-labelledby="testing-title"><div className="container"><div className="electronics-editorial" data-reveal><div><p className="eyebrow">05 / Ground-test electronics</p><h2 id="testing-title">Before flight,<br />measure the thrust.</h2></div><p className="electronics-copy">Engine static tests use a dedicated measurement chain on the ground. A load cell senses the engine’s thrust; an amplifier converts its signal into data a computer can read.</p></div><div className="test-instruments" data-reveal><article><span className="engineering-label">FORCE MEASUREMENT</span><h3>Load Cell</h3><p className="test-rating">Up to <strong>1000</strong> kg</p><p>Measures engine thrust during static tests.</p></article><article><span className="engineering-label">SIGNAL CONVERSION</span><h3>HX711 Load Cell Amplifier</h3><p>Converts the load-cell signal into digitally readable data.</p></article></div><figure className="test-chain" data-reveal aria-label="Static-test measurement chain"><ol>{['Rocket engine', 'Load cell', 'HX711', 'Computer', 'Thrust data'].map((step, i) => <li key={step}><span className="engineering-label">0{i + 1}</span><strong>{step}</strong>{i < 4 && <Arrow />}</li>)}</ol><figcaption>GROUND ONLY / Engine static-test instrumentation</figcaption></figure></div></section>

    <section className="electronics-band section-space" aria-labelledby="euroc-title"><div className="container"><div className="electronics-editorial" data-reveal><div><p className="eyebrow">06 / Competition requirements</p><h2 id="euroc-title">Built for EuRoC.</h2></div><p className="electronics-copy">Reliability is a system-level task. We develop Phobos with European Rocketry Challenge requirements in mind, covering recovery independence, power, integration, and testing.</p></div><div className="euroc-grid">{euroc.map((group, i) => <article key={group.title} data-reveal><span className="engineering-label">0{i + 1} / DESIGN PRIORITY</span><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div><aside className="euroc-note" data-reveal><span className="status-dot" aria-hidden="true" /><div><p>The mandatory CATS Vega system operates alongside CAESAR’s own electronics where applicable. Our custom flight computer does not replace mandatory EuRoC equipment.</p><p>Design priorities summarised from the 2025 requirements; the applicable competition edition governs final integration and verification.</p><a className="text-link" href="https://euroc.pt/wp-content/uploads/2025/03/PTS_EDU_EuRoC_ST_001928_SRD_v01-1.pdf" target="_blank" rel="noreferrer">EuRoC System Requirements · 2025 (PDF) <Arrow diagonal /></a></div></aside></div></section>

    <section id="architecture" className="section-space" aria-label="System architecture"><div className="container"><SectionHeader label="07 / System architecture" title="The complete signal path." /><p className="electronics-section-intro">Altitude and motion measurements enter the STM32 flight computer. Its interfaces connect onboard storage, radio telemetry, recovery, and propulsion.</p><div data-reveal><Architecture detailed /></div></div></section>

    <section className="electronics-closing section-space" aria-labelledby="engineering-title"><div className="container" data-reveal><p className="eyebrow"><span className="status-dot" /> 08 / The Electronics team</p><h2 id="engineering-title">From sensor data<br />to flight decisions.</h2><p>Embedded programming. Electronics. Sensors. Communications. Testing. System integration. We bring these disciplines together to build reliable electronics for Phobos, one interface and one test at a time.</p><a className="button button-primary" href={sitePath('#projekt')}>Explore the Phobos project <Arrow /></a><a className="text-link" href={sitePath('#om-oss')}>Meet CAESAR <Arrow /></a></div></section>
  </div>
}
