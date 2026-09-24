import { useEffect, useRef, useState } from 'react'
import Arrow from '../components/Arrow'
import SectionHeader from '../components/SectionHeader'
import HybridEngineDrawing from '../components/HybridEngineDrawing'
import { propulsionMedia, type PropulsionFigure as FigureAsset } from '../data/propulsionMedia'
import { sitePath } from '../paths'
import { useScrollReveal } from '../useScrollReveal'
import '../propulsion.css'

function EngineeringFigure({ asset }: { asset?: FigureAsset }) {
  if (!asset) return null
  return <figure className="propulsion-project-figure"><h3>{asset.title}</h3><img src={sitePath(asset.path)} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" /><figcaption>{asset.caption}</figcaption></figure>
}

function EnginePlate() {
  const root = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 })
    observer.observe(root.current!)
    return () => observer.disconnect()
  }, [])
  return <figure ref={root} className={`propulsion-engine-plate${visible ? ' is-visible' : ''}`} aria-label="Hybrid engine cross-section: oxidizer tank, main valve, injector, paraffin fuel grain inside the chamber, and nozzle">
    <div className="propulsion-plate-header"><span>PHOBOS / ENGINE STUDY</span><span>IN DEVELOPMENT</span></div>
    <div className="propulsion-engine-art"><div className="propulsion-engine-datum" aria-hidden="true"><span>OXIDIZER FLOW ↓</span></div><HybridEngineDrawing />
      <div className="propulsion-engine-labels" aria-hidden="true"><span><i>01</i> N₂O TANK</span><span><i>02</i> MAIN VALVE</span><span><i>03</i> INJECTOR</span><span><i>04</i> PARAFFIN GRAIN<small>COMBUSTION CHAMBER</small></span><span><i>05</i> NOZZLE<small>EXHAUST ↓ / THRUST ↑</small></span></div>
    </div><figcaption><span>LIQUID OXIDIZER / SOLID FUEL</span><span>Functional illustration · not to scale</span></figcaption>
  </figure>
}

function Process({ steps, className = '' }: { steps: { title: string; detail?: string }[]; className?: string }) {
  return <ol className={`propulsion-process ${className}`}>{steps.map((step, index) => <li key={step.title}><span className="propulsion-label">{String(index + 1).padStart(2, '0')}</span><strong>{step.title}</strong>{step.detail && <span>{step.detail}</span>}{index < steps.length - 1 && <Arrow />}</li>)}</ol>
}

const grainSteps = [
  { title: 'Early casting', detail: 'Learning how paraffin forms a grain.' },
  { title: 'Mould iteration', detail: 'Refining the mould and central port geometry.' },
  { title: 'Layered casting', detail: 'Investigating voids, separation, and shrinkage.' },
  { title: 'Phenolic liner', detail: 'Exploring the grain–liner interface.' },
  { title: 'Flight grain', detail: 'Development objective · validation still required.' },
]

function PropulsionArchitecture() {
  return <figure className="propulsion-architecture" aria-label="Functional propulsion architecture and electronics interface">
    <div className="propulsion-architecture-heading"><span className="propulsion-label">PHOBOS / FUNCTIONAL ARCHITECTURE</span><span className="propulsion-label">FLUID PATH + CONTROL</span></div>
    <div className="propulsion-system-grid">
      <div className="propulsion-system-feed"><span className="propulsion-label">LIQUID OXIDIZER</span><strong>N₂O</strong><span>Oxidizer tank</span></div>
      <div className="propulsion-system-valve"><span className="propulsion-label">FLOW CONTROL</span><h3>Main Oxidizer Valve</h3><span>Servo actuator + custom connector</span></div>
      <div className="propulsion-system-pressure"><span className="propulsion-label">MEASUREMENT</span><strong>Pressure sensor</strong><span>Fluid-system pressure monitoring</span></div>
      <div className="propulsion-system-electronics"><span className="propulsion-label">CONTROL INTERFACE</span><h3>Flight computer</h3><p>Valve control → servo actuator</p><a className="text-link" href={sitePath('electronics')}>Explore Electronics <Arrow /></a><small>Pressure monitoring is shown in the fluid system; its electrical routing is not specified here.</small></div>
      <div className="propulsion-system-injector"><span className="propulsion-label">DELIVERY</span><strong>Injector</strong></div>
      <div className="propulsion-system-chamber"><span className="propulsion-label">COMBUSTION CHAMBER</span><strong>Paraffin fuel grain</strong><span>Solid fuel around a central port</span><div className="propulsion-port" aria-hidden="true"><i /><span>HOT GAS FLOW ↓</span><i /></div></div>
      <div className="propulsion-system-nozzle"><span className="propulsion-label">EXPANSION</span><strong>Nozzle</strong><span>Exhaust ↓ / Thrust ↑</span></div>
    </div><figcaption>Functional relationships only. Fuel grain is housed inside the chamber; the control link represents the valve interface described for CAESAR’s electronics.</figcaption>
  </figure>
}

export default function Propulsion() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    document.title = 'Propulsion · Phobos | CAESAR'
    if (meta) meta.content = 'Powering Phobos: explore CAESAR’s hybrid engine, performance analysis, paraffin fuel-grain development, fluid systems, and testing.'
    return () => { document.title = previousTitle; if (meta && previousDescription !== undefined) meta.content = previousDescription }
  }, [])

  return <div className="propulsion-page" lang="en">
    <section className="propulsion-hero" aria-labelledby="propulsion-title"><div className="container">
      <a className="text-link propulsion-back" href={sitePath('#propulsion')}><span aria-hidden="true">←</span> Phobos / Our subteams</a>
      <div className="propulsion-hero-grid"><div><p className="eyebrow"><span className="status-dot" /> Propulsion // Phobos</p><h1 id="propulsion-title">Powering<br /><span>Phobos.</span></h1><p className="propulsion-hero-lead">The Propulsion team develops the hybrid rocket engine and supporting fluid systems that generate and control the thrust required to take Phobos from the launch rail to the sky.</p><a className="text-link" href="#engine">Follow the flow <span aria-hidden="true">↓</span></a><p className="propulsion-label propulsion-design-status">STUDENT ENGINEERING / INITIAL DESIGN SIZING</p></div><EnginePlate /></div>
      <dl className="propulsion-hero-figures"><div><dt>ENGINE ARCHITECTURE</dt><dd>Hybrid <span>engine</span></dd></div><div><dt>DESIGN THRUST</dt><dd>~1 <span>kN</span></dd></div><div><dt>CHAMBER PRESSURE</dt><dd>30 <span>bar</span></dd></div><div><dt>PROPELLANT PAIR</dt><dd>N₂O <span>+ paraffin</span></dd></div></dl>
    </div></section>

    <section id="engine" className="section-space" aria-labelledby="engine-title"><div className="container">
      <div className="propulsion-editorial" data-reveal><div><p className="eyebrow">01 / Engine</p><h2 id="engine-title">How Phobos<br />generates thrust.</h2></div><p className="propulsion-copy">A hybrid engine brings together propellants in two different states: liquid nitrous oxide as the oxidizer and solid paraffin wax as the fuel. The fluid system delivers oxidizer into the combustion chamber, where it reacts with fuel from the paraffin grain. The resulting hot gases expand through the nozzle to generate thrust.</p></div>
      <figure className="propulsion-engine-flow" data-reveal aria-label="Hybrid engine propellant flow"><ol>{[
        ['Oxidizer tank', 'Nitrous oxide / N₂O'], ['Main Oxidizer Valve', 'Controlled oxidizer delivery'], ['Injector', 'Into the chamber'], ['Combustion chamber', '+ Paraffin fuel grain'], ['Nozzle', 'Hot gases expand'], ['Thrust', 'Force on the rocket'],
      ].map(([title, detail], index) => <li key={title}><span className="propulsion-label">0{index + 1}</span><strong>{title}</strong><span>{detail}</span>{index < 5 && <Arrow />}</li>)}</ol><figcaption>FROM LIQUID + SOLID TO HOT GAS / Functional flow, not a manufacturing layout.</figcaption></figure>
      <div className="propulsion-principles" data-reveal><article><span className="propulsion-label">FEED</span><h3>Move the oxidizer.</h3><p>The tank, valve, and injector form the delivery path for liquid nitrous oxide.</p></article><article><span className="propulsion-label">REACT</span><h3>Use the solid fuel.</h3><p>The paraffin grain sits inside the chamber, with a central port through which the flow passes.</p></article><article><span className="propulsion-label">EXPAND</span><h3>Produce thrust.</h3><p>The nozzle turns the hot-gas flow into directed exhaust, producing a force on the rocket in the opposite direction.</p></article></div>
    </div></section>

    <section id="performance" className="propulsion-band section-space" aria-labelledby="performance-title"><div className="container">
      <div className="propulsion-editorial" data-reveal><div><p className="eyebrow">02 / Performance analysis</p><h2 id="performance-title">Designing<br />the engine.</h2></div><p className="propulsion-copy">The team used NASA CEA — Chemical Equilibrium with Applications — to investigate engine performance across a range of oxidizer-to-fuel mass ratios and chamber pressures. These calculations guide the design; they are not measured engine results.</p></div>
      <div className="propulsion-analysis-sweep" data-reveal><div><span className="propulsion-label">O/F RATIO / ANALYSIS SWEEP</span><p>5.0 <span>→</span> 9.0</p></div><div><span className="propulsion-label">CHAMBER PRESSURE / ANALYSIS SWEEP</span><p>20 <span>→</span> 35 <small>bar</small></p></div></div>
      <div className="propulsion-metrics" data-reveal><article><span className="propulsion-metric-symbol">I<sub>sp</sub></span><div><h3>Specific impulse</h3><p>A measure of how efficiently the rocket engine uses its propellant.</p></div></article><article><span className="propulsion-metric-symbol">c*</span><div><h3>Characteristic velocity</h3><p>A combustion-performance metric that is independent of nozzle performance.</p></div></article></div>
      <div className="propulsion-media-grid"><EngineeringFigure asset={propulsionMedia.isp} /><EngineeringFigure asset={propulsionMedia.cstar} /></div>
      <div className="propulsion-design-point" data-reveal><div><span className="propulsion-label">SELECTED DESIGN POINT</span><p className="propulsion-isp">235.98 <span>s</span></p><span>Calculated specific impulse</span></div><dl><div><dt>O/F RATIO</dt><dd>6</dd></div><div><dt>CHAMBER PRESSURE</dt><dd>30 <span>bar</span></dd></div></dl></div>
      <p className="propulsion-design-rationale" data-reveal>The selection of 30 bar and O/F = 6 balances performance with lower combustion temperature and stresses, limiting nozzle oxidation and remaining consistent with relevant hybrid-engine design experience considered by the team.</p>
    </div></section>

    <section className="propulsion-sizing section-space" aria-labelledby="thrust-title"><div className="container">
      <div className="propulsion-thrust-intro" data-reveal><div><p className="eyebrow">03 / From performance to thrust</p><h2 id="thrust-title">Sizing for<br />lift-off.</h2><p className="propulsion-copy">Start with the launch mass. Set the thrust-loading assumption. Translate the force target into a preliminary propellant budget.</p></div><div className="propulsion-thrust-number"><span className="propulsion-label">ENGINE DESIGN TARGET</span><strong>~1<span>kN</span></strong><span>F = 5 × g × m ≈ 981 N</span></div></div>
      <div data-reveal><Process className="propulsion-sizing-story" steps={[
        { title: '20 kg', detail: 'Assumed launch mass' }, { title: '5 g', detail: 'Thrust-loading assumption' }, { title: '~1 kN', detail: 'Thrust target' }, { title: '0.48 kg/s', detail: 'Reported flow estimate' }, { title: '10 s', detail: 'Nominal burn time' },
      ]} /></div>
      <div className="propulsion-flow-budget" data-reveal><div className="propulsion-budget-total"><span className="propulsion-label">REPORTED TOTAL MASS FLOW</span><strong>0.4799 <span>kg/s</span></strong><p>Preliminary sizing estimate</p></div><dl><div><dt>FUEL</dt><dd>0.069 <span>kg/s</span></dd><dd>0.69 <span>kg over 10 s</span></dd></div><div><dt>OXIDIZER</dt><dd>0.416 <span>kg/s</span></dd><dd>4.16 <span>kg over 10 s</span></dd></div></dl></div>
      <p className="propulsion-fine-print">Preliminary estimates, not measured performance. The reported flow values and calculated specific impulse are not yet a reconciled sizing model.</p>
      <details className="propulsion-calculations" data-reveal><summary>Engineering notes &amp; calculation assumptions <span aria-hidden="true">+</span></summary><div><p><strong>Thrust target.</strong> With m = 20 kg and g ≈ 9.81 m/s², F = 5 × g × m ≈ 981 N. Here, 5 g describes F/m before gravity and drag; it is not a net upward acceleration of 5 g.</p><p><strong>Flow consistency.</strong> Using F = ṁ × g × Isp with 981 N and 235.98 s gives approximately 0.424 kg/s, rather than the reported 0.4799 kg/s. The component estimates, 0.069 + 0.416 kg/s, sum to approximately 0.485 kg/s. The supplied values are retained as preliminary estimates that need reconciliation.</p><p><strong>Propellant budget.</strong> Applying the reported component flows over 10 s gives 0.416 × 10 = 4.16 kg of oxidizer and 0.069 × 10 = 0.69 kg of fuel.</p></div></details>
    </div></section>

    <section id="propellants" className="propulsion-propellants section-space" aria-labelledby="propellants-title"><div className="container"><p className="eyebrow" data-reveal>04 / Propellant</p><h2 id="propellants-title" data-reveal>Two propellants.<br />One engine.</h2><div className="propulsion-propellant-pair" data-reveal><article><span className="propulsion-label">OXIDIZER / LIQUID</span><div className="propulsion-chemical">N₂O</div><h3>Nitrous Oxide</h3><p>The oxidizer is delivered through the fluid system into the combustion chamber, supporting the reaction with the fuel.</p></article><article><span className="propulsion-label">FUEL / SOLID</span><div className="propulsion-grain-symbol" aria-hidden="true"><i /></div><h3>Paraffin Wax</h3><p>The solid fuel grain sits inside the combustion chamber. Paraffin was selected partly for its relatively high regression rate — how quickly the burning surface recedes — and its practical manufacturing and storage properties compared with alternatives the team investigated.</p></article></div></div></section>

    <section id="fuel-grain" className="section-space" aria-labelledby="grain-title"><div className="container"><div className="propulsion-editorial" data-reveal><div><p className="eyebrow">05 / Fuel grain development</p><h2 id="grain-title">Developing<br />the fuel grain.</h2></div><p className="propulsion-copy">The grain is an engineering project in its own right. The team has experimented with casting paraffin and iterated through multiple mould and casting designs, developing both the composition and the manufacturing process.</p></div>
      <div data-reveal><Process steps={grainSteps} /></div><p className="propulsion-fine-print">Development progression, not a sequence of flight-qualified solutions. Layered casting and liner approaches remain subjects of investigation.</p>
      <div className="propulsion-grain-research" data-reveal><div><span className="propulsion-label">COMPOSITION</span><h3>More than wax.</h3><p>EVA additives are being investigated to improve mechanical stability and reduce cracking. Carbon black has also been investigated in relation to combustion and regression behaviour.</p></div><div><span className="propulsion-label">MANUFACTURING</span><h3>Consistency is the challenge.</h3><p>Mould design, central port geometry, layered casting, and phenolic liners all affect the developing grain concept. Producing a smooth, consistent grain without problematic air pockets, voids, separation, or shrinkage remains a major challenge.</p></div></div><EngineeringFigure asset={propulsionMedia.grain} />
    </div></section>

    <section id="fluid-system" className="propulsion-band section-space" aria-labelledby="fluid-title"><div className="container"><div className="propulsion-editorial" data-reveal><div><p className="eyebrow">06 / Fluid system</p><h2 id="fluid-title">Controlling<br />the oxidizer.</h2></div><p className="propulsion-copy">The fluid system transports nitrous oxide from the tank to the combustion chamber. Filling, isolation, pressure monitoring, and delivery must work together as part of the engine system.</p></div>
      <figure className="propulsion-plumbing" data-reveal aria-label="Simplified oxidizer plumbing architecture"><div className="propulsion-plumbing-path"><span className="propulsion-label">OXIDIZER FEED PATH ↓</span><ol>{['Oxidizer storage / fill', 'Quick disconnect', 'Run tank', 'Main Oxidizer Valve (MOV)', 'Pressure measurement', 'Injector', 'Combustion chamber'].map((step, i) => <li key={step}><span className="propulsion-label">0{i + 1}</span><strong>{step}</strong></li>)}</ol></div><div className="propulsion-plumbing-notes"><article><span className="propulsion-label">MONITOR &amp; PROTECT</span><h3>Pressure sensors<br />&amp; pressure relief</h3><p>Pressure measurement and relief provisions are part of the fluid-system design.</p></article><article><span className="propulsion-label">CONNECT &amp; ISOLATE</span><h3>Quick disconnects,<br />check valve &amp; fittings</h3><p>Connection hardware and flow-direction control support the filling and oxidizer-delivery system.</p></article><p className="propulsion-fine-print">Functional overview. Exact component positions and plumbing details are not represented.</p></div><figcaption>PLUMBING / Simplified system relationships, not a piping and instrumentation drawing.</figcaption></figure><EngineeringFigure asset={propulsionMedia.plumbing} />
    </div></section>

    <section className="section-space" aria-labelledby="tubing-title"><div className="container"><div className="propulsion-editorial" data-reveal><div><p className="eyebrow">07 / Tubing &amp; fittings</p><h2 id="tubing-title">Built to handle<br />the pressure.</h2></div><p className="propulsion-copy">The team investigated flexible nylon, steel-braided PTFE, and stainless steel tubing. Steel tubing was selected for its high pressure capability and large safety margin, together with the ability to cut it to length and bend it into the required geometry.</p></div><div className="propulsion-materials" data-reveal><div><span className="propulsion-label">INVESTIGATED</span><h3>Flexible Nylon</h3></div><div><span className="propulsion-label">INVESTIGATED</span><h3>Steel-braided PTFE</h3></div><div className="is-selected"><span className="propulsion-label">SELECTED APPROACH</span><h3>Steel tubing</h3></div></div><p className="propulsion-fitting-note" data-reveal>Swagelok tubing and compression fittings form part of the component ecosystem considered for the fluid system.</p></div></section>

    <section id="servo-valve" className="propulsion-valve-section section-space" aria-labelledby="valve-title"><div className="container"><div className="propulsion-editorial" data-reveal><div><p className="eyebrow">08 / Servo valve</p><h2 id="valve-title">Remote control<br />of oxidizer flow.</h2></div><p className="propulsion-copy">The Main Oxidizer Valve must be remotely actuated. The team designed a custom connector and bracket to mechanically couple a digital servo to the ball valve. The current approach uses approximately direct 1:1 actuation to reduce mechanical complexity and potential failure points.</p></div>
      <figure className="propulsion-actuator" data-reveal aria-label="Servo, custom connector and ball valve form the remotely actuated valve assembly"><div><svg viewBox="0 0 150 110" fill="none" aria-hidden="true"><path d="M30 30 H116 V93 H30 Z M22 40 H30 M116 40 H127 M50 30 V17 H94 V30 M56 17 V10 H89 V17" /><circle cx="72" cy="56" r="16" /><path d="M72 56 L105 56 M45 80 H65" /></svg><span className="propulsion-label">01 / ACTUATOR</span><strong>Servo</strong></div><div className="actuator-coupling"><svg viewBox="0 0 150 110" fill="none" aria-hidden="true"><path d="M28 24 H122 V87 H108 V38 H42 V87 H28 Z M57 45 H93 V78 H57 Z M75 38 V45 M75 78 V94" /><circle cx="35" cy="31" r="2" /><circle cx="115" cy="31" r="2" /></svg><span className="propulsion-label">02 / CUSTOM PART</span><strong>Connector + bracket</strong></div><div><svg viewBox="0 0 150 110" fill="none" aria-hidden="true"><path d="M12 51 H45 V81 H12 Z M105 51 H138 V81 H105 Z M45 46 H105 V87 H45 Z M65 46 V29 H85 V46 M49 29 H118 V20 H49 Z" /><circle cx="75" cy="66" r="14" /><path d="M61 66 H89" /></svg><span className="propulsion-label">03 / FLOW CONTROL</span><strong>Ball valve</strong></div><figcaption>Illustrative mechanical coupling / approximately direct 1:1 actuation.</figcaption></figure>
      <div className="propulsion-valve-specs" data-reveal><article><span className="propulsion-label">CURRENT VALVE</span><h3>RS PRO</h3><p>Stainless steel reduced-bore, 2-way ball valve</p><dl><div><dt>Connection</dt><dd>1/4″ BSPP</dd></div><div><dt>Operating pressure</dt><dd>68 bar</dd></div><div><dt>Required valve torque</dt><dd>≈ 0.8 Nm</dd></div></dl></article><article><span className="propulsion-label">CURRENT SERVO</span><h3>Miuzei 35 kg</h3><p>270° digital servo</p><p className="propulsion-fine-print">“35 kg” is the supplied model description. The approximately 0.8 Nm figure describes the valve’s torque requirement.</p><p>The custom mechanical interface is part of the team’s ongoing design and component-testing work.</p></article></div>
      <div className="propulsion-valve-evolution" data-reveal><Process steps={[{ title: 'Valve selection' }, { title: 'Connector iterations' }, { title: 'Current assembly' }]} /></div><div className="propulsion-media-grid"><EngineeringFigure asset={propulsionMedia.valve} /><EngineeringFigure asset={propulsionMedia.iterations} /><EngineeringFigure asset={propulsionMedia.assembly} /></div>
    </div></section>

    <section id="ignition" className="section-space" aria-labelledby="ignition-title"><div className="container propulsion-ignition-layout" data-reveal><div><p className="eyebrow">09 / Ignition development</p><h2 id="ignition-title">Igniting<br />the engine.</h2><p className="propulsion-copy">Ignition must initiate hybrid combustion reliably while satisfying safety and regulatory constraints. The team has investigated several concepts; the ignition approach remains under development.</p></div><div className="propulsion-ignition-decisions"><article><span className="propulsion-label">UNDER CONSIDERATION / NON-PYROTECHNIC</span><h3>Heated element / wire</h3><h3>Electrical spark ignition</h3></article><article><span className="propulsion-label">DOCUMENTED DECISION</span><h3>Pyrotechnic concepts ruled out</h3><p>The project documentation records that the necessary storage and use licences were not held at that time. This constraint shaped the concepts investigated.</p></article></div></div></section>

    <section id="system-architecture" className="propulsion-band section-space" aria-label="Engine system architecture"><div className="container"><SectionHeader label="10 / Engine system architecture" title="One engine. Connected systems." /><div data-reveal><PropulsionArchitecture /></div></div></section>

    <section id="testing" className="section-space" aria-labelledby="testing-title"><div className="container"><div className="propulsion-editorial" data-reveal><div><p className="eyebrow">11 / Development &amp; testing</p><h2 id="testing-title">Design. Build.<br />Test. Repeat.</h2></div><p className="propulsion-copy">Phobos propulsion is an iterative engineering project. Sizing, fluid-system design, and fuel-grain development inform the hardware. Component testing and static fire testing are part of the development programme, providing the evidence needed to assess and refine the design.</p></div><div data-reveal><Process className="propulsion-test-process" steps={['Engine sizing', 'Fluid system design', 'Fuel grain development', 'Component testing', 'Static fire testing', 'Iteration'].map(title => ({ title }))} /></div><p className="propulsion-fine-print">Development activities and planned verification, not a claim that every stage is complete or flight-qualified.</p></div></section>

    <section className="propulsion-closing section-space" aria-labelledby="propulsion-closing-title"><div className="container" data-reveal><p className="eyebrow"><span className="status-dot" /> The Propulsion team</p><h2 id="propulsion-closing-title">Turning stored<br />energy into flight.</h2><p>Designing, manufacturing, testing, and integrating the hybrid engine that powers Phobos. Our work connects the propellants, the hardware, and the systems that take the rocket from the launch rail to the sky.</p><div><a className="button button-primary" href={sitePath('electronics')}>Explore Electronics <Arrow /></a><a className="button button-outline" href={sitePath('#projekt')}>Back to Phobos <Arrow /></a></div></div></section>
  </div>
}
