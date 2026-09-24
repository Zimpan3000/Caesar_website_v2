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
    document.title = 'Bli medlem | CAESAR'
    if (description) description.content = 'Bli medlem i CAESAR helt kostnadsfritt. Stötta vår verksamhet eller ansök om en projektplats och var med på resan mot rymden.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <div className="membership-page">
    <section className="membership-hero" aria-labelledby="membership-title">
      <div className="container">
        <a className="text-link membership-back" href={sitePath()}><span aria-hidden="true">←</span> Till startsidan</a>
        <div className="membership-hero-grid">
          <div>
            <p className="eyebrow"><span className="status-dot" /> Bli medlem i CAESAR</p>
            <h1 id="membership-title">Din plats på<br />resan mot<br /><span>rymden.</span></h1>
            <p className="membership-lead">En gemensam nyfikenhet. En större ambition.<br />Bli en del av CAESAR.</p>
            <a className="text-link" href="#medlemskap">Upptäck medlemskapet <span aria-hidden="true">↓</span></a>
          </div>
          <figure className="membership-photo">
            <div><img src={sitePath('assets/team.jpeg')} alt="CAESARs team samlat framför föreningens logotyp" width="1024" height="640" {...{ fetchpriority: 'high' }} /></div>
            <figcaption><span>CAESAR / Chalmers Aerospace Society</span><span>Göteborg, Sverige</span></figcaption>
          </figure>
        </div>
        <div className="membership-facts" aria-label="Om medlemskapet">
          <span><i className="status-dot" aria-hidden="true" /> Kostnadsfritt medlemskap</span>
          <span>En del av Astronomisk Ungdom</span>
          <span>En del av Space Students Sweden</span>
        </div>
      </div>
    </section>

    <section id="medlemskap" className="membership-section section-space" aria-labelledby="membership-apply-title">
      <div className="container membership-content-grid">
        <div>
          <p className="eyebrow">01 / Medlemskap</p>
          <h2 id="membership-apply-title">Ansök om<br />medlemskap<span className="blue-period">.</span></h2>
        </div>
        <div className="membership-copy">
          <p>Du kan kostnadsfritt ansöka om medlemskap i CAESAR genom att klicka på knappen nedan och fylla i medlemsformuläret. Som medlem stöttar du vår verksamhet och får kallelser till våra föreningsstämmor.</p>
          <p>Som medlem kan du välja att bli mer aktivt engagerad i vår förening genom att söka en plats i vår projektverksamhet.</p>
          <p>CAESAR är en del av Astronomisk Ungdom och Space Students Sweden, vilket innebär att du också blir medlem i dessa organisationer när du går med i CAESAR.</p>
          <a className="button button-primary" href={links.membershipForm}>Bli medlem <Arrow diagonal /></a>
          <p className="membership-help">Om du behöver hjälp med medlemsregistrering kan du kontakta oss på <a href="mailto:info@caesar.se">info@caesar.se</a>.</p>
        </div>
      </div>
    </section>

    <section className="membership-projects section-space" aria-labelledby="membership-project-title">
      <div className="container membership-content-grid">
        <div>
          <p className="eyebrow">02 / Ta nästa steg</p>
          <h2 id="membership-project-title">Projektdeltagare<span className="blue-period">.</span></h2>
        </div>
        <div className="membership-copy">
          <span className="membership-age">18+ / Projektverksamhet</span>
          <p>Vill du delta i våra projekt kan du ansöka om att bli <strong>projektdeltagare</strong>. För att bli <strong>projektdeltagare</strong> måste du vara <strong>minst 18 år</strong>.</p>
          <a className="button button-outline" href={links.projectApplication}>Ansök om en projektplats <Arrow diagonal /></a>
        </div>
      </div>
    </section>
  </div>
}
