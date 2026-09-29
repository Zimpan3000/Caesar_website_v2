import { sitePath } from '../paths'
import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import { links } from '../data/site'
import '../membership.css'

export default function Membership() {
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Join Us | CAESAR'
    if (description) description.content = 'Join CAESAR for free. Support our work or apply to take part in a project and join our journey towards space.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <div className="membership-page">
    <section className="membership-hero" aria-labelledby="membership-title">
      <div className="container">
        <a className="text-link membership-back" href={sitePath()}><span aria-hidden="true">←</span> Back to home</a>
        <div className="membership-hero-grid">
          <div>
            <p className="eyebrow"><span className="status-dot" /> Join CAESAR</p>
            <h1 id="membership-title">Your place on<br />the journey<br /><span>to space.</span></h1>
            <p className="membership-lead">Shared curiosity. Greater ambition.<br />Become part of CAESAR.</p>
            <a className="text-link" href="#medlemskap">Explore membership <span aria-hidden="true">↓</span></a>
          </div>
          <figure className="membership-photo">
            <div><img src={sitePath('assets/team.jpeg')} alt="The CAESAR team gathered in front of the society’s logo" width="1024" height="640" {...{ fetchpriority: 'high' }} /></div>
            <figcaption><span>CAESAR / Chalmers Aerospace Society</span><span>Göteborg, Sweden</span></figcaption>
          </figure>
        </div>
        <div className="membership-facts" aria-label="About membership">
          <span><i className="status-dot" aria-hidden="true" /> Free membership</span>
          <span>Part of Astronomisk Ungdom</span>
          <span>Part of Space Students Sweden</span>
        </div>
      </div>
    </section>

    <section id="medlemskap" className="membership-section section-space" aria-labelledby="membership-apply-title">
      <div className="container membership-content-grid">
        <div>
          <p className="eyebrow">01 / Membership</p>
          <h2 id="membership-apply-title">Apply for<br />membership<span className="blue-period">.</span></h2>
        </div>
        <div className="membership-copy">
          <p>Membership of CAESAR is free. Use the button below to complete the membership form. As a member, you support our work and receive invitations to our general meetings.</p>
          <p>To get more actively involved, you can also apply to join one of our projects.</p>
          <p>CAESAR is part of Astronomisk Ungdom and Space Students Sweden, so joining CAESAR also makes you a member of these organisations.</p>
          <a className="button button-primary" href={links.membershipForm}>Join Us <Arrow diagonal /></a>
          <p className="membership-help">If you need help registering, contact us at <a href="mailto:info@caesar.se">info@caesar.se</a>.</p>
        </div>
      </div>
    </section>

    <section className="membership-projects section-space" aria-labelledby="membership-project-title">
      <div className="container membership-content-grid">
        <div>
          <p className="eyebrow">02 / Take the next step</p>
          <h2 id="membership-project-title">Project Members<span className="blue-period">.</span></h2>
        </div>
        <div className="membership-copy">
          <span className="membership-age">18+ / Project Participation</span>
          <p>To work on our projects, apply to become a <strong>project member</strong>. You must be <strong>at least 18 years old</strong> to participate.</p>
          <a className="button button-outline" href={links.projectApplication}>Apply to Join a Project <Arrow diagonal /></a>
        </div>
      </div>
    </section>
  </div>
}
