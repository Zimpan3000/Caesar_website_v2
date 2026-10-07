import { useEffect, type ReactNode } from 'react'
import Arrow from '../components/Arrow'
import SectionHeader from '../components/SectionHeader'
import { StructureSectionDrawing, RecoverySequence, EjectionSchematic, CamDrawing, PayloadDrawing } from '../components/StructuresDiagrams'
import { sitePath } from '../paths'
import { useScrollReveal } from '../useScrollReveal'
import '../structures.css'

function Values({ items, className = '' }: { items: [string, ReactNode][]; className?: string }) {
  return <dl className={`structures-values ${className}`}>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}

const responsibilities = [
  ['Aerodynamics', 'Fins, nose cone and their mounting.'],
  ['Recovery', 'Parachute deployment and mechanical recovery systems.'],
  ['Internal structure', 'All compartments above the oxidizer tank: recovery, payload and electronics bays.'],
  ['System integration', 'Mechanical integration and cable management for flight-computer-controlled systems.'],
  ['Ground support', 'Mechanical ground equipment for launches and motor testing.'],
]
const architecture: [string, string[]][] = [
  ['Command', ['Flight computer', 'Servo', 'Cam mechanism']],
  ['Ejection', ['CO₂ cartridge', 'Parachute bay pressure', 'Shear bolts fail', 'Rocket separates']],
  ['Recovery', ['Drag chute deploys', 'Release mechanism', 'Main parachute deploys']],
]
const electronicsPriorities = [
  ['RF transparency', 'Allow wireless communication and, where possible, maximize communication range.'],
  ['Pressure equalization', 'Maintain approximately freestream pressure for accurate barometric altitude measurements.'],
  ['Thermal environment', 'Keep electronics and batteries within safe operating temperatures.'],
  ['Mechanical integration', 'Secure electronics, wiring and components throughout flight.'],
]

export default function Structures() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    document.title = 'Structures · Phobos | CAESAR'
    if (meta) meta.content = 'Engineered for the journey back: explore Phobos recovery, aerodynamics, payload bays and mechanical integration with the CAESAR Structures team.'
    return () => { document.title = previousTitle; if (meta && previousDescription !== undefined) meta.content = previousDescription }
  }, [])

  return <div className="structures-page" lang="en">
    <section className="structures-hero" aria-labelledby="structures-title">
      <div className="container">
        <a className="text-link structures-back" href={sitePath('#structures')}><span aria-hidden="true">←</span> Phobos / Our subteams</a>
        <div className="structures-hero-grid">
          <div className="structures-hero-copy"><p className="eyebrow"><span className="status-dot" /> PHOBOS // STRUCTURES</p><h1 id="structures-title">Engineered for<br />the journey<br /><span>back.</span></h1><p className="structures-lead">The Structures team develops the aerodynamic components, internal compartments, recovery system and mechanical integration that keep Phobos stable during ascent and bring it safely back to the ground.</p><a href="#recovery" className="text-link">Follow the recovery sequence <span aria-hidden="true">↓</span></a></div>
          <StructureSectionDrawing />
        </div>
        <Values className="structures-hero-metrics" items={[
          ['Recovery', 'Dual-stage'], ['Payload', <>4 × <small>PocketSat</small></>], ['Stability target', <>2–3 <small>calibers</small></>], ['Main parachute target', <>9 <small>m/s</small></>],
        ]} />
      </div>
    </section>

    <section id="responsibilities" className="section-space" aria-label="Structures responsibilities"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">01 / The mechanical interfaces</p><h2>More than<br />the airframe.</h2></div><p className="structures-copy">The external shape is only the beginning. Structures connects the compartments, mechanisms and mounting points that let Phobos function as one vehicle, from ground support to the journey home.</p></div>
      <div className="structures-responsibilities">{responsibilities.map(([title, copy], i) => <article key={title} data-reveal><span className="structures-label">0{i + 1} /</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </div></section>

    <section id="recovery" className="structures-band section-space" aria-label="Recovery system"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">02 / Recovery · the development focus</p><h2>Getting<br />Phobos home.</h2></div><div><p className="structures-copy">Recovery is one of the rocket’s most critical systems, and the main focus of Structures development so far. A pressure-actuated ejection system begins a dual-stage return: first the drag chute, then the main parachute.</p><p className="structures-note">Select a stage to explore the mechanism. The drawings show the operating concept, not final geometry or deployment timing.</p></div></div>
      <ul className="structures-parts" aria-label="Recovery components">{['Main parachute', 'Main parachute bag', 'Drag chute', 'CO₂ cartridge', 'Ejection system', 'Parachute release mechanism', 'Shear bolts'].map(part => <li key={part}>{part}</li>)}</ul>
      <RecoverySequence />
    </div></section>

    <section id="recovery-architecture" className="section-space" aria-label="Recovery system architecture"><div className="container">
      <SectionHeader label="03 / Recovery system architecture" title="One command. A mechanical chain." />
      <figure className="structures-architecture" data-reveal>
        <div className="structures-architecture-groups">{architecture.map(([title, nodes], index) => <div key={title}><p className="structures-label">0{index + 1} / {title}</p><ol start={index === 0 ? 1 : index === 1 ? 4 : 8}>{nodes.map(node => <li key={node}>{node}</li>)}</ol></div>)}</div>
        <figcaption>Read from command through ejection to recovery. The release mechanism is servo-operated; its later command releases the shorter drag-chute connection.</figcaption>
      </figure>
    </div></section>

    <section id="descent" className="structures-band section-space" aria-label="Parachute sizing"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">04 / Parachute engineering</p><h2>Designing<br />the descent.</h2></div><p className="structures-copy">Parachute sizing balances drag against gravity. At terminal descent, the two forces are equal; the target descent velocity sets the required parachute area.</p></div>
      <aside className="structures-load-callout" data-reveal><div><p className="eyebrow">Deployment load / supplied estimate</p><h3>The opening is a load case.</h3><p>With a drag coefficient of 1, air density of 1.225 kg/m³, parachute area of 3.75 m² and velocity of 40 m/s, the supplied drag-force calculation records the estimates shown here. Recovery loads must be considered as part of the structural design.</p><p className="structures-note">The stated inputs do not reproduce the recorded force exactly. These estimates are retained from the design notes and need reconciliation; they are not verified final flight loads. Actual velocity and atmospheric density change during descent.</p></div><div className="structures-load-number"><strong>≈ 3880 <small>N</small></strong><span>≈ 19.8 g / 20 kg rocket</span><span className="structures-label">SUPPLIED EXAMPLE · NOT A TEST RESULT</span></div></aside>
    </div></section>

    <section id="ejection" className="section-space" aria-label="Pressure-actuated ejection"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">05 / Pressure-actuated ejection</p><h2>A pressure change.<br />A planned separation.</h2></div><p className="structures-copy">CO₂ pressurizes the sealed parachute bay. The design calculations use the pressure difference between ground level and altitude as a basis for determining the required ejection pressure and shear load.</p></div>
      <EjectionSchematic />
      <details className="structures-calculations"><summary>View calculation details</summary><div>
        <p className="structures-copy">The supplied ideal-gas / adiabatic approximation relates the volume ratio to cartridge and ejection pressures, then estimates the CO₂ temperature and mixed-gas temperature.</p>
        <p className="structures-note">P<sub>c</sub>: cartridge pressure · T<sub>0</sub>: initial temperature · γ: ratio of specific heats. These approximations document the design approach; no final cartridge size is specified.</p>
      </div></details>
    </div></section>

    <section id="puncture-mechanism" className="structures-band section-space" aria-label="CO₂ puncture mechanism"><div className="container">
      <SectionHeader label="06 / CO₂ puncture mechanism" title="Turning torque into deployment." />
      <p className="structures-intro">Puncturing the CO₂ cartridge requires substantial linear force. A servo drives a cam, converting torque and rotation into movement of the puncture mechanism.</p>
      <div data-reveal><CamDrawing /></div>
      <div className="structures-cam-notes" data-reveal><p className="structures-label">DESIGN NOTES</p><p className="structures-note">The simplified design model needs verification for the physical mechanism. Friction is not represented and must be considered in the design.</p></div>
    </div></section>

    <section id="payload" className="section-space" aria-label="Payload bay"><div className="container structures-payload-layout">
      <div data-reveal><p className="eyebrow">07 / Payload bay</p><h2>Four passengers.<br />One compartment.</h2><p className="structures-copy">Phobos carries four PocketSats. The current plan is to use non-deployable dummy payloads.</p><Values items={[
        ['Payload', '4 × PocketSat'], ['Size / each', '50 × 50 × 50 mm'], ['Mass / each', '250 g'], ['Total payload mass', '1 kg'],
      ]} /></div><div data-reveal><PayloadDrawing /></div>
    </div></section>

    <section id="electronics-bay" className="structures-band section-space" aria-label="Electronics bay"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">08 / Electronics bay</p><h2>A home for<br />the flight systems.</h2></div><div><p className="structures-copy">Batteries, PCBs, electronics and sensors need a physical environment that supports their work. Structures provides the mounting, compartment design and cable management that integrate these systems into Phobos.</p><a className="text-link" href={sitePath('electronics')}>Explore Electronics <Arrow /></a></div></div>
      <div className="structures-bay-priorities">{electronicsPriorities.map(([title, copy], index) => <article key={title} data-reveal><span className="structures-label">0{index + 1} / DESIGN REQUIREMENT</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </div></section>

    <section id="aerodynamics" className="section-space" aria-label="Aerodynamics"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">09 / Aerodynamics</p><h2>Stability<br />by design.</h2></div><p className="structures-copy">Fin geometry, fin mounting, nose cone design and aerodynamic integration all sit within Structures. The external geometry must provide sufficient stability while limiting drag over the expected flight conditions.</p></div>
      <div className="structures-aero-study" data-reveal><div className="structures-aero-number"><span className="structures-label">STABILITY MARGIN / DESIGN TARGET</span><strong>2–3</strong><span>calibers throughout flight</span></div><div><div className="structures-aero-lines" aria-hidden="true"><svg viewBox="0 0 520 150" fill="none"><path d="M15 34 Q230 32 338 18 M15 60 Q130 58 250 39 M15 117 Q130 119 250 138 M15 141 Q230 143 338 155" /><path d="M100 88 Q197 48 340 48 H504 M100 88 Q197 128 340 128 H504 M100 88 H510" /></svg></div><h3>A pointier nose cone is not automatically a better nose cone.</h3><p>Its geometry should be optimized to reduce aerodynamic drag for the expected flight conditions.</p><span className="structures-label">CONCEPTUAL FLOW STUDY / NO FINAL GEOMETRY IMPLIED</span></div></div>
    </div></section>

    <section id="structural-engineering" className="structures-band section-space" aria-label="Structural pressure and shear bolts"><div className="container">
      <SectionHeader label="10 / Structural engineering" title="Hold together. Release by design." />
      <div className="structures-engineering-pair">
        <article data-reveal><span className="structures-label">01 / CYLINDRICAL PRESSURE LOADS</span><h3>Pressure in the wall.</h3><p>For a sufficiently thin cylindrical wall, with wall thickness small relative to radius, pressure capability can be estimated using a hoop-stress model.</p><p className="structures-note">Material strength can depend on temperature and must be considered for the expected operating conditions. No material properties or safety factor are specified here.</p></article>
        <article data-reveal><span className="structures-label">02 / SHEAR BOLTS</span><h3>A deliberate release point.</h3><p>The bolts hold the rocket sections together during normal flight. They are intentionally designed to fail when the recovery bay reaches the required pressure.</p><Values className="structures-variables" items={[
          ['d', 'Required bolt diameter'], ['F', 'Shear force'], ['τ', 'Shear strength / yield value in the model'],
        ]} /><p className="structures-note">Design theory for a homogeneous solid bolt in single shear. This model documents the engineering principle, not a final bolt specification or fabrication instruction.</p></article>
      </div>
    </div></section>

    <section id="integration" className="section-space" aria-label="System integration"><div className="container">
      <div className="structures-editorial" data-reveal><div><p className="eyebrow">11 / System integration</p><h2>One rocket.<br />Many systems.</h2></div><p className="structures-copy">Structures provides the physical interfaces that allow propulsion, electronics, recovery and payload to operate together. Mechanical mounting and cable management turn separate systems into an integrated vehicle.</p></div>
      <figure className="structures-integration" data-reveal><div className="structures-integration-grid"><div className="structures-integration-aero">Aerodynamics</div><a className="structures-integration-prop" href={sitePath('propulsion')}>Propulsion <Arrow /></a><div className="structures-integration-core"><span className="structures-label">PHYSICAL INTERFACES</span><strong>Structures</strong><span>Mounting / compartments / cabling</span></div><a className="structures-integration-elec" href={sitePath('electronics')}>Electronics <Arrow /></a><div className="structures-integration-recovery">Recovery</div><div className="structures-integration-payload">Payload</div></div><figcaption>Structures connects the aerodynamic envelope with the systems inside.</figcaption></figure>
      <div className="structures-crosslinks"><a className="text-link" href={sitePath('propulsion')}>Explore Propulsion <Arrow /></a><a className="text-link" href={sitePath('electronics')}>Explore Electronics <Arrow /></a></div>
    </div></section>

    <section className="structures-closing section-space" aria-labelledby="structures-closing-title"><div className="container" data-reveal><p className="eyebrow"><span className="status-dot" /> The Structures team</p><h2 id="structures-closing-title">Built to fly.<br /><span>Designed to return.</span></h2><p>From aerodynamic stability to parachute deployment, the Structures team turns Phobos into an integrated vehicle capable of surviving both ascent and recovery.</p><div className="structures-crosslinks"><a className="button button-primary" href={sitePath('#projekt')}>Explore Phobos <Arrow /></a><a className="text-link" href={sitePath('#om-oss')}>Meet the Team <Arrow /></a></div></div></section>
  </div>
}
