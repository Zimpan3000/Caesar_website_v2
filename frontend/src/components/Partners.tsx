import { links, partners } from '../data/site'
import { sitePath } from '../paths'
import Arrow from './Arrow'

const homepagePartners = [
  ...partners,
  { name: 'RS Components (RS Online)', image: sitePath('assets/rs-components.png'), url: 'https://se.rs-online.com/web/' },
]

export default function Partners() {
  return <section id="partners" className="partners-section section-space" aria-labelledby="partners-title"><div className="container" data-reveal><div className="partners-heading"><p className="eyebrow">Together, we go further</p><h2 id="partners-title">Our Partners</h2><p>Thank you to the partners who make our journey possible.</p></div><div className="partner-logos">{homepagePartners.map((partner) => <a key={partner.name} href={partner.url} target="_blank" rel="noreferrer"><img src={partner.image} alt={partner.name} loading="lazy" /></a>)}</div><div className="partners-bottom"><a className="text-link" href={links.partners}>Meet Our Partners <Arrow /></a><a className="text-link" href={links.sponsor}>Become a Sponsor <Arrow diagonal /></a></div></div></section>
}
