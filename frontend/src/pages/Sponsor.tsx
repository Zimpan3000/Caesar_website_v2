import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import { links } from '../data/site'
import { sitePath } from '../paths'
import '../sponsor.css'

const opportunities = [
  { title: 'Visibility through engineering', text: 'A partnership can give your organisation visibility through CAESAR’s projects, events and activities. Together, we can discuss an approach that fits the collaboration.' },
  { title: 'Connect with future engineers', text: 'Meet motivated engineering students and get to know their work, ideas and ambitions. Build connections with the next generation of engineering talent.' },
  { title: 'Technical exchange', text: 'Share industry experience and explore opportunities for technical collaboration. Knowledge exchange gives students fresh perspectives on real engineering challenges.' },
  { title: 'Engineering in practice', text: 'Support an ambitious, student-led aerospace and rocketry society at Chalmers. Your involvement helps students put theory into practice, develop their skills and test new ideas.' },
]

export default function Sponsor() {
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Become a Sponsor | CAESAR'
    if (description) description.content = 'Partner with CAESAR, the student-led aerospace and rocketry society at Chalmers. Explore sponsorship, technical exchange and connections with future engineers.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <article className="sponsor-page" aria-labelledby="sponsor-title">
    <div className="container">
      <a className="text-link sponsor-back" href={sitePath()}><span aria-hidden="true">←</span> Back to home</a>
      <header className="sponsor-hero">
        <div>
          <p className="eyebrow"><span className="status-dot" /> Become a Sponsor / CAESAR</p>
          <h1 id="sponsor-title">Engineering drive.<br /><span>Shared ambition.</span></h1>
        </div>
        <div className="sponsor-intro">
          <p>Help turn students’ space ambitions into hands-on engineering opportunities.</p>
          <p>CAESAR is a student-led aerospace and rocketry society at Chalmers. We welcome companies and organisations interested in supporting our work and exploring ways to collaborate.</p>
          <a className="button button-primary sponsor-cta" href="mailto:info@caesar.se">Contact Us <Arrow diagonal /></a>
        </div>
      </header>

      <section className="sponsor-opportunities" aria-labelledby="sponsor-opportunities-title">
        <div className="sponsor-section-heading">
          <p className="eyebrow">Partner with CAESAR</p>
          <h2 id="sponsor-opportunities-title">More than a contribution.</h2>
          <p>Visibility, new connections and technical exchange. We can shape a partnership around your interests and the society’s needs.</p>
        </div>
        <div className="sponsor-benefits">
          {opportunities.map((item, index) => <div className="sponsor-benefit" key={item.title}>
            <span className="sponsor-index" aria-hidden="true">0{index + 1}</span>
            <h3>{item.title}</h3><p>{item.text}</p>
          </div>)}
        </div>
      </section>

      <section className="sponsor-contributions" aria-labelledby="sponsor-contributions-title">
        <div className="sponsor-section-heading">
          <p className="eyebrow">Many ways to contribute</p>
          <h2 id="sponsor-contributions-title">What can we achieve together?</h2>
          <p>Sponsorship can take many forms. Tell us what you can offer, and we can discuss how it could support CAESAR’s work.</p>
        </div>
        <ul className="sponsor-resources">
          <li><h3>Financial support</h3><p>Funding that creates opportunities for projects and hands-on development.</p></li>
          <li><h3>Components & materials</h3><p>Resources for designs, prototypes and testing.</p></li>
          <li><h3>Manufacturing & software</h3><p>Machining, manufacturing support and engineering software.</p></li>
          <li><h3>Expertise & other resources</h3><p>Technical advice, knowledge exchange or other relevant contributions.</p></li>
        </ul>
      </section>

      <section className="sponsor-contact" aria-labelledby="sponsor-contact-title">
        <div>
          <p className="eyebrow">Let’s talk</p>
          <h2 id="sponsor-contact-title">Interested in becoming a sponsor?</h2>
          <p>Contact CAESAR to discuss possible collaborations and sponsorship arrangements. Tell us a little about your organisation and what you would like to contribute or explore with us.</p>
        </div>
        <div className="sponsor-contact-actions">
          <a className="button button-primary sponsor-cta" href="mailto:info@caesar.se">Contact Us <Arrow diagonal /></a>
          <a className="text-link" href="mailto:info@caesar.se">info@caesar.se</a>
        </div>
      </section>
      <p className="sponsor-individual">Would you like to make a personal donation? <a href={links.support}>Support Us via Swish <span aria-hidden="true">→</span></a></p>
    </div>
  </article>
}
