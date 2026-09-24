import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import SectionHeader from '../components/SectionHeader'
import { links, partners, socials } from '../data/site'
import { sitePath } from '../paths'
import { useScrollReveal } from '../useScrollReveal'
import '../marketing.css'

const responsibilities = [
  ['Brand', 'A shared identity.', 'Developing and maintaining the visual identity that makes CAESAR recognizable.'],
  ['Content', 'The substance behind the story.', 'Turning technical progress into understandable, engaging communication.'],
  ['Partnerships', 'A conversation that goes both ways.', 'Helping communicate the value of CAESAR to current and potential partners.'],
  ['Recruitment', 'An invitation to get involved.', 'Showing students what CAESAR does and how they can become part of it.'],
  ['Documentation', 'A record of the work.', 'Capturing the development of Phobos through photography, video and writing.'],
  ['Digital', 'A place to connect.', 'Developing CAESAR’s presence across the website and digital channels.'],
]
const stages = [
  ['Design', 'The idea takes shape.', 'Explain the thinking behind a design and the questions it sets out to answer.'],
  ['Manufacturing', 'Ideas become hardware.', 'Show the making, the craft and the people bringing components to life.'],
  ['Testing', 'Put the work to the test.', 'Document what a test explores, what it reveals and what comes next.'],
  ['Integration', 'The pieces come together.', 'Make the collaboration between systems and teams visible.'],
  ['Launch', 'Bring people into the moment.', 'Tell the story of the preparation and the work behind a flight.'],
  ['Recovery', 'The story continues.', 'Document the return and the lessons to carry into the next iteration.'],
]
const disciplines = [
  { id: 'propulsion', name: 'Propulsion', detail: 'The energy to fly.' },
  { id: 'electronics', name: 'Electronics', detail: 'The systems that connect.' },
  { id: 'structures', name: 'Structures', detail: 'The vehicle that brings it together.' },
  { id: 'marketing', name: 'Marketing', detail: 'The story that connects people.' },
]

function SocialLinks({ label }: { label: string }) {
  return <nav className="marketing-socials" aria-label={label}>{socials.map(social => <a key={social.name} href={social.url} target="_blank" rel="noreferrer">{social.name}<Arrow diagonal /></a>)}</nav>
}

function TeamNetwork() {
  return <figure className="marketing-team-network" data-reveal>
    <div className="marketing-network-grid">
      <div className="marketing-network-center"><span className="marketing-label">ONE SHARED MISSION</span><strong>PHOBOS</strong><span>Built together.</span></div>
      {disciplines.map(team => team.id === 'marketing'
        ? <div key={team.id} className={`marketing-network-node marketing-network-${team.id}`}><strong>{team.name}</strong><span>{team.detail}</span></div>
        : <a key={team.id} className={`marketing-network-node marketing-network-${team.id}`} href={sitePath(team.id)}><strong>{team.name}<Arrow /></strong><span>{team.detail}</span></a>)}
    </div>
    <figcaption>Four disciplines around one project. Different contributions, shared ownership of the mission.</figcaption>
  </figure>
}

export default function Marketing() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    document.title = 'Marketing · Phobos | CAESAR'
    if (meta) meta.content = 'Building more than a rocket: meet the CAESAR Marketing team’s work in storytelling, brand, documentation, partnerships and student recruitment.'
    return () => { document.title = previousTitle; if (meta && previousDescription !== undefined) meta.content = previousDescription }
  }, [])

  return <div className="marketing-page" lang="en">
    <section className="marketing-hero" aria-labelledby="marketing-title"><div className="container">
      <a className="text-link marketing-back" href={sitePath('#marketing')}><span aria-hidden="true">←</span> Phobos / Our subteams</a>
      <div className="marketing-hero-grid">
        <div className="marketing-hero-copy"><p className="eyebrow"><span className="status-dot" /> PHOBOS // MARKETING</p><h1 id="marketing-title">Building<br />more than<br /><span>a rocket.</span></h1><p>Behind Phobos is a team, a story and a community. Marketing is responsible for communicating the project, developing the CAESAR brand and connecting our engineering work with students, partners and the world around us.</p><a className="text-link" href="#phobos-story">Follow the journey <span aria-hidden="true">↓</span></a></div>
        <div className="marketing-cover" aria-label="CAESAR editorial image collection">
          <figure className="marketing-cover-team"><div className="marketing-photo"><img src={sitePath('assets/team.jpeg')} alt="The CAESAR team together in a workshop in front of the CAESAR logo" width="1024" height="640" {...{ fetchpriority: 'high' }} /></div><figcaption><span>THE PEOPLE BEHIND PHOBOS</span><span>CAESAR / CHALMERS</span></figcaption></figure>
          <div className="marketing-cover-bottom"><div className="marketing-cover-brand"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" /><span>A shared identity.<br />An ambitious idea.</span></div><figure className="marketing-cover-rocket"><img src={sitePath('assets/phobos.png')} alt="Phobos rocket render with CAESAR branding" width="1024" height="640" /><figcaption>THE PROJECT / PHOBOS RENDER</figcaption></figure></div>
        </div>
      </div>
      <div className="marketing-hero-line"><span>ENGINEERING, MADE VISIBLE.</span><span>PEOPLE / STORIES / IDENTITY</span><a href="#our-role" aria-label="Discover the Marketing team’s role"><span aria-hidden="true">↓</span></a></div>
    </div></section>

    <section id="our-role" className="section-space" aria-label="The Marketing team’s role"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">01 / Our role</p><h2>Engineering<br />deserves to be seen.</h2></div><p className="marketing-copy">Developing a rocket is only part of building a successful aerospace project. The work also needs to be documented, communicated and presented to the people who make it possible.</p></div>
      <div className="marketing-responsibilities">{responsibilities.map(([label, title, copy], index) => <article key={label} data-reveal><p className="marketing-label"><span>0{index + 1}</span> / {label}</p><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </div></section>

    <section id="phobos-story" className="marketing-band section-space" aria-label="The Phobos story"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">02 / The Phobos story</p><h2>Every stage<br />has a story.</h2></div><div><p className="marketing-copy">From the first design to the journey back, each stage produces engineering progress worth documenting. Marketing connects those moments into a coherent story about Phobos and the people building it.</p><p className="marketing-note">A view of the project journey and what we aim to document, rather than a record of completed milestones.</p></div></div>
      <ol className="marketing-timeline" aria-label="The development journey">{stages.map(([stage, title, copy], index) => <li key={stage} data-reveal><span className="marketing-label">0{index + 1} / {stage}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
      <div className="marketing-story-footer"><span>THE WORK. THE PEOPLE. THE PROCESS.</span><a className="text-link" href="#content-media">See the project through our lens <Arrow /></a></div>
    </div></section>

    <section id="engineering-stories" className="section-space" aria-label="Translating engineering"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">03 / Translating engineering</p><h2>From engineering<br />to communication.</h2></div><p className="marketing-copy">The challenge is to make complex engineering understandable while preserving its substance. Working with the technical teams keeps the story connected to the decisions, results and questions behind the hardware.</p></div>
      <figure className="marketing-translation" data-reveal><div className="marketing-translation-grid"><div><span className="marketing-label">THE SOURCE</span><h3>Engineering work</h3><ul>{['Technical results', 'Tests', 'CAD', 'Hardware', 'Data'].map(item => <li key={item}>{item}</li>)}</ul></div><div className="marketing-translation-center"><span className="marketing-label">CONTEXT / CLARITY / IDENTITY</span><h3>Marketing</h3><p>Understand the work.<br />Find the story.<br />Make it accessible.</p></div><div><span className="marketing-label">THE EXPRESSION</span><h3>Communication</h3><ul>{['Stories', 'Photography', 'Video', 'Website', 'Social content'].map(item => <li key={item}>{item}</li>)}</ul></div></div><div className="marketing-audience"><span className="marketing-label">CONNECTING WITH</span><span>Students</span><span>Partners</span><span>The public</span></div><figcaption>Engineering knowledge becomes communication people can follow, understand and engage with.</figcaption></figure>
      <div className="marketing-links">{disciplines.filter(team => team.id !== 'marketing').map(team => <a key={team.id} className="text-link" href={sitePath(team.id)}>Explore {team.name} <Arrow /></a>)}</div>
    </div></section>

    <section id="content-media" className="marketing-gallery-section section-space" aria-label="Content and media"><div className="container">
      <SectionHeader label="04 / Content & media" title="Documenting the journey." />
      <p className="marketing-intro">The people behind the work. The project taking shape. The identity that brings it together. A selection of CAESAR’s team photography and project visuals.</p>
      <div className="marketing-gallery">
        <figure className="marketing-gallery-people" data-reveal><div className="marketing-photo"><img src={sitePath('assets/caesar-team.webp')} alt="CAESAR members in their black team shirts, gathered for a group portrait" width="1262" height="864" loading="lazy" /></div><figcaption><span>01 / TEAM</span><strong>A shared ambition, many perspectives.</strong><span>The students behind CAESAR.</span></figcaption></figure>
        <figure className="marketing-gallery-project" data-reveal><div className="marketing-photo"><img src={sitePath('assets/phobos.png')} alt="Project visualization of the Phobos rocket" width="1024" height="640" loading="lazy" /></div><figcaption><span>02 / PROJECT VISUAL</span><strong>Give an idea a visible form.</strong><span>Phobos render · project imagery.</span></figcaption></figure>
        <figure className="marketing-gallery-identity" data-reveal><div className="marketing-identity-art"><img src={sitePath('assets/caesar-full.png')} alt="The CAESAR wordmark and rocket emblem" width="2172" height="724" loading="lazy" /><span>CHALMERS AEROSPACE SOCIETY<br />FOR ADVANCED ROCKETRY</span></div><figcaption><span>03 / IDENTITY</span><strong>One recognizable CAESAR.</strong><span>A visual thread across the project.</span></figcaption></figure>
      </div>
      <div className="marketing-editor-note"><span className="marketing-label">WHAT WE LOOK TO CAPTURE</span><p>Workshop development, tests, team life, events, launch and recovery: the moments that make a project worth following.</p></div>
    </div></section>

    <section id="digital" className="section-space" aria-label="Digital presence"><div className="container">
      <div className="marketing-digital-grid"><div data-reveal><p className="eyebrow">05 / Digital presence</p><h2>Our digital<br />launchpad.</h2><p className="marketing-copy">The website gives CAESAR’s engineering a place people can explore. Project updates sit alongside technical information, team stories, partner visibility, membership information and documentation of our projects.</p><a className="text-link" href={sitePath('#senaste')}>Read project updates <Arrow /></a><SocialLinks label="Follow CAESAR online" /></div>
        <figure className="marketing-browser" data-reveal><div className="marketing-browser-bar"><span aria-hidden="true">● ● ●</span><span>CAESAR / THE WEBSITE</span><Arrow diagonal /></div><a href={sitePath()} aria-label="Explore the CAESAR homepage"><img src={sitePath('assets/caesar-website.jpg')} alt="Screenshot of the CAESAR homepage with its rocket visual, navigation and project introduction" width="1440" height="1000" loading="lazy" /></a><figcaption>A window into the project. Explore the work, meet the team and find your way in.</figcaption></figure>
      </div>
    </div></section>

    <section id="marketing-partners" className="marketing-partners section-space" aria-label="CAESAR partnerships"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">06 / Partnerships</p><h2>Engineering is<br />a team effort.</h2></div><p className="marketing-copy">Projects like Phobos depend on more than the students building the rocket. Collaboration with companies, organizations and the wider aerospace community brings knowledge, resources and opportunities that help turn ambitious ideas into real hardware.</p></div>
      <div className="partner-logos" data-reveal>{partners.map(partner => <a key={partner.name} href={partner.url} target="_blank" rel="noreferrer"><img src={partner.image} alt={partner.name} loading="lazy" /></a>)}</div>
      <div className="marketing-partners-bottom"><p>Making the work visible also means recognizing the people and organizations who help make it possible.</p><div className="marketing-links"><a className="text-link" href={links.partners}>Explore our partners <Arrow /></a><a className="text-link" href={links.support}>Support CAESAR <Arrow diagonal /></a></div></div>
    </div></section>

    <section id="get-involved" className="section-space" aria-label="Recruitment"><div className="container marketing-recruitment-grid">
      <div data-reveal><p className="eyebrow">07 / Get involved</p><h2>The next rocket<br /><span>needs you.</span></h2><p className="marketing-copy">CAESAR gives students the opportunity to work on real, interdisciplinary engineering projects alongside their studies. Marketing helps make those opportunities visible and invites new people into the organization.</p><a className="button button-primary" href={links.membership}>Join CAESAR <Arrow /></a><p className="marketing-note">Explore membership and how to apply for project participation.</p></div>
      <div className="marketing-contributions" data-reveal><p className="marketing-label">DIFFERENT SKILLS. A SHARED DIRECTION.</p><div><h3>Engineering</h3><ul><li>Electronics</li><li>Propulsion</li><li>Structures</li></ul></div><div><h3>Creative & organizational</h3><ul><li>Marketing</li><li>Communication</li><li>Project work</li></ul></div><span className="marketing-note">Ways to contribute to the project, not a list of current vacancies.</span></div>
    </div></section>

    <section id="one-project" className="marketing-band section-space" aria-label="One project, many disciplines"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">08 / The shared mission</p><h2>One project.<br />Many disciplines.</h2></div><p className="marketing-copy">Phobos is the result of different disciplines working toward the same mission. Marketing is part of that collaboration, helping connect the work inside the project with the people around it.</p></div><TeamNetwork />
    </div></section>

    <section id="people" className="section-space" aria-label="The people behind CAESAR"><div className="container">
      <div className="marketing-editorial" data-reveal><div><p className="eyebrow">09 / People behind the project</p><h2>The people<br />behind the mission.</h2></div><div><p className="marketing-copy">CAESAR is built by students who choose to spend their time turning ambitious ideas into real engineering.</p><a className="text-link" href={sitePath('#om-oss')}>Meet CAESAR <Arrow /></a></div></div>
      <figure className="marketing-people-photo" data-reveal><div className="marketing-photo"><img src={sitePath('assets/team.jpeg')} alt="CAESAR’s team gathered together in the workshop" width="1024" height="640" loading="lazy" /></div><figcaption><span>BUILT BY STUDENTS.</span><span>CAESAR / CHALMERS AEROSPACE SOCIETY FOR ADVANCED ROCKETRY</span></figcaption></figure>
    </div></section>

    <section className="marketing-closing section-space" aria-labelledby="marketing-closing-title"><div className="container" data-reveal><p className="eyebrow"><span className="status-dot" /> Keep following. Keep building.</p><h2 id="marketing-closing-title">Follow Phobos<br />from workshop<br /><span>to launch.</span></h2><p>Every test, iteration and breakthrough brings Phobos one step closer to flight.</p><div className="marketing-links"><a className="button button-primary" href={sitePath('#projekt')}>Explore Phobos <Arrow /></a><a className="button button-outline" href={links.membership}>Join CAESAR <Arrow /></a></div><SocialLinks label="Keep following CAESAR" /></div></section>
  </div>
}
