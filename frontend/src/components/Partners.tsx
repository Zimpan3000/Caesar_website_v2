import { links, partners } from '../data/site'
import Arrow from './Arrow'

export default function Partners() {
  return <section id="partners" className="partners-section section-space" aria-labelledby="partners-title"><div className="container" data-reveal><div className="partners-heading"><p className="eyebrow">Tillsammans når vi längre</p><h2 id="partners-title">Våra partners</h2><p>Tack till er som gör vår resa möjlig.</p></div><div className="partner-logos">{partners.map((partner) => <a key={partner.name} href={partner.url} target="_blank" rel="noreferrer"><img src={partner.image} alt={partner.name} loading="lazy" /></a>)}</div><div className="partners-bottom"><a className="text-link" href={links.partners}>Möt våra partners <Arrow /></a><a className="text-link" href={links.support}>Bli en del av resan <Arrow diagonal /></a></div></div></section>
}
