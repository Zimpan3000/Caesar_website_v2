import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import { links, socials } from '../data/site'
import { sitePath } from '../paths'
import { useScrollReveal } from '../useScrollReveal'
import '../contact.css'

export default function Contact() {
  useScrollReveal()
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Contact | CAESAR'
    if (description) description.content = 'Get in touch with CAESAR, the Chalmers Aerospace Society for Advanced Rocketry, for general enquiries, project questions and collaboration.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <article className="contact-page" aria-labelledby="contact-title">
    <div className="container">
      <a className="text-link contact-back" href={sitePath()}><span aria-hidden="true">←</span> Back to home</a>
      <header className="contact-hero">
        <div>
          <p className="eyebrow"><span className="status-dot" /> Contact / CAESAR</p>
          <h1 id="contact-title">Get in<br /><span>touch.</span></h1>
          <p className="contact-lead">Have a question about CAESAR, our projects or what we do? We’d like to hear from you.</p>
          <p className="contact-location">Chalmers Aerospace Society for Advanced Rocketry<br />Göteborg, Sweden</p>
        </div>
        <section className="contact-email" aria-labelledby="contact-email-title">
          <p className="eyebrow">Start a conversation</p>
          <h2 id="contact-email-title">General enquiries</h2>
          <p>For questions, ideas or opportunities to collaborate, send us an email and tell us how we can help.</p>
          <a className="contact-address" href="mailto:info@caesar.se">info@caesar.se <Arrow diagonal /></a>
          <span className="contact-email-note">Opens your email app</span>
        </section>
      </header>

      <section className="contact-directions" aria-labelledby="contact-directions-title" data-reveal>
        <div><p className="eyebrow">Find your next step</p><h2 id="contact-directions-title">Get involved.</h2><p>Explore how to join the team or support our work.</p></div>
        <div className="contact-options">
          <a href={links.membership}><span><strong>Join CAESAR</strong><span>Membership and opportunities to work with the team.</span></span><Arrow /></a>
          <a href={links.sponsor}><span><strong>Become a Sponsor</strong><span>Support student engineering and explore a partnership.</span></span><Arrow /></a>
        </div>
      </section>

      <section className="contact-social" aria-labelledby="contact-social-title" data-reveal>
        <div><p className="eyebrow">Stay connected</p><h2 id="contact-social-title">Follow the journey.</h2></div>
        <nav aria-label="CAESAR social media">{socials.map(social => <a className="text-link" key={social.name} href={social.url} target="_blank" rel="noreferrer">{social.name} <Arrow diagonal /><span className="contact-sr-only"> (opens in a new tab)</span></a>)}</nav>
      </section>
    </div>
  </article>
}
