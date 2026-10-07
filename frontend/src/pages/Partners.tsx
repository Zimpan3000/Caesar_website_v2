import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import { links, partners } from '../data/site'
import { useScrollReveal } from '../useScrollReveal'
import '../partners.css'

const contributions = [
  {
    id: 'tranemo', name: 'Tranemo', asset: 'tranemo.png',
    category: 'Team Clothing Partner', theme: 'A shared identity.', detail: 'Team clothing',
    copy: 'Tranemo supports CAESAR by providing clothing for our team. Their contribution helps us create a strong and professional team identity, whether we are working on our projects or representing CAESAR.',
  },
  {
    id: 'astronomisk-ungdom', name: 'Astronomisk Ungdom', asset: 'astronomisk-ungdom.png',
    category: 'Financial & Network Partner', theme: 'Part of something bigger.', detail: 'Funding & connections',
    copy: 'Astronomisk Ungdom supports CAESAR financially and connects us to a wider Swedish community of young people passionate about space and spaceflight. Through their network, CAESAR becomes part of a broader ecosystem working to inspire and develop the next generation of space enthusiasts and engineers.',
    context: 'Astronomisk Ungdom is a Swedish non-profit youth organization that promotes interest in astronomy and spaceflight among young people.',
  },
  {
    id: 'chalmers', name: 'Chalmers', asset: 'chalmers.png',
    category: 'Facilities & Financial Support', theme: 'Space to put ideas into practice.', detail: 'Facilities & funding',
    copy: 'Chalmers provides CAESAR with access to facilities and financial support that help make our projects possible. Being part of the Chalmers environment gives our members the opportunity to turn engineering knowledge into ambitious, hands-on rocket projects.',
  },
  {
    id: 'axjo', name: 'Axjo', asset: 'axjo.svg',
    category: 'Storage Solutions Partner', theme: 'A place for every component.', detail: 'Storage solutions & boxes',
    copy: 'Axjo develops packaging and storage solutions for industry. They support CAESAR by providing storage solutions and storage boxes for our equipment and components, helping us keep our workspace and technical material organized.',
  },
]

function PartnershipOrbit() {
  return <div className="partnership-orbit" aria-hidden="true">
    <svg viewBox="0 0 440 400" fill="none">
      <circle className="orbit-guide" cx="220" cy="200" r="176" />
      <circle className="orbit-guide orbit-guide-inner" cx="220" cy="200" r="124" />
      <path className="orbit-axis" d="M220 6V394M26 200H414" />
      <path className="orbit-connections" d="M220 70L350 274H90ZM220 70V200M90 274L220 200L350 274" />
      <circle className="orbit-core" cx="220" cy="200" r="60" />
      <text className="orbit-brand" x="220" y="201" textAnchor="middle">CAESAR</text>
      <text className="orbit-small" x="220" y="220" textAnchor="middle">STUDENT ROCKETRY</text>
      <g className="orbit-node"><circle cx="220" cy="70" r="5" /><circle cx="350" cy="274" r="5" /><circle cx="90" cy="274" r="5" /></g>
      <g className="orbit-label"><text x="220" y="48" textAnchor="middle">TEAM</text><text x="350" y="300" textAnchor="middle">COMMUNITY</text><text x="90" y="300" textAnchor="middle">OPPORTUNITY</text></g>
    </svg>
    <span className="partnership-notation">Connected by a shared ambition</span>
  </div>
}

export default function Partners() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Our Partners | CAESAR'
    if (description) description.content = 'Meet Tranemo, Astronomisk Ungdom, Chalmers and Axjo, and discover how their clothing, funding, networks, facilities and storage solutions support CAESAR’s student rocket projects.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <article className="partnership-page" aria-labelledby="partnership-title">
    <div className="container">
      <header className="partnership-hero">
        <div className="partnership-intro">
          <p className="eyebrow"><span className="status-dot" /> CAESAR / Shared ambition</p>
          <h1 id="partnership-title">Our<br /><span>Partners</span><span className="partnership-period">.</span></h1>
          <p className="partnership-lead">Building rockets requires more than engineering. Our partners provide the resources, equipment, opportunities and support that make our projects possible.</p>
        </div>
        <PartnershipOrbit />
      </header>

      <nav className="partnership-index" aria-label="Meet our partners">
        {contributions.map((partner, index) => <a key={partner.id} href={`#${partner.id}`}>
          <span className="partnership-notation partnership-index-number">0{index + 1}</span>
          <span><strong>{partner.name}</strong><small>{partner.detail}</small></span>
          <span className="partnership-index-arrow" aria-hidden="true">↓</span>
        </a>)}
      </nav>

      <div className="partnership-stories">
        {contributions.map((partner, index) => {
          const identity = partners.find(item => item.image.endsWith(`/${partner.asset}`))!
          return <section key={partner.id} id={partner.id} className={`partnership-story partnership-story-${partner.id}`} aria-labelledby={`${partner.id}-title`}>
            <div className="partnership-story-copy" data-reveal>
              <p className="partnership-category"><span aria-hidden="true">0{index + 1} /</span> {partner.category}</p>
              <h2 id={`${partner.id}-title`}>{partner.name}</h2>
              <p className="partnership-theme">{partner.theme}</p>
              <p className="partnership-description">{partner.copy}</p>
              {partner.context && <p className="partnership-context">{partner.context}</p>}
              <a className="text-link partnership-visit" href={identity.url} target="_blank" rel="noreferrer">Visit {partner.name} <Arrow diagonal /><span className="partnership-sr-only"> (opens in a new tab)</span></a>
            </div>
            <figure className="partnership-identity" data-reveal>
              <div className="partnership-plate-meta partnership-notation"><span>CAESAR / PARTNER 0{index + 1}</span><span aria-hidden="true">+</span></div>
              <div className="partnership-logo"><img src={identity.image} alt={`${partner.name} logo`} loading="lazy" /></div>
              <figcaption><span className="partnership-notation">Enabling the mission</span><span>{partner.detail}</span></figcaption>
            </figure>
          </section>
        })}
      </div>

      <section className="partnership-invitation" aria-labelledby="partnership-invitation-title" data-reveal>
        <div><p className="eyebrow">Build with us</p><h2 id="partnership-invitation-title">Be part of<br />what comes next<span className="partnership-period">.</span></h2><p>Help students turn their ambition into hands-on rocket engineering.</p></div>
        <a className="button button-outline" href={links.sponsor}>Become a Sponsor <Arrow diagonal /></a>
      </section>
    </div>
  </article>
}
