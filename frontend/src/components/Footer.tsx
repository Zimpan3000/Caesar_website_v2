import { sitePath } from '../paths'
import { links, socials } from '../data/site'
import Arrow from './Arrow'

export default function Footer() {
  return (
    <footer id="kontakt" className="site-footer"><div className="container">
      <div className="footer-invitation" data-reveal><div><p className="eyebrow">Din resa börjar här</p><h2>Rymden är närmare<br />än du tror.</h2></div><a className="button button-primary" href={links.membership}>Bli en del av CAESAR <Arrow diagonal /></a></div>
      <div className="footer-main">
        <div className="footer-brand"><a className="brand" href={sitePath()} aria-label="CAESAR – startsida"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" loading="lazy" /></a><p>Chalmers Aerospace Society<br />for Advanced Rocketry</p><span>Göteborg, Sverige</span></div>
        <nav aria-label="Sidfotsnavigation"><h3>CAESAR</h3><a href={sitePath()}>Hem</a><a href={links.about}>Vilka vi är</a><a href={links.board}>Styrelse 26/27</a><a href={links.documents}>Styrdokument</a><a href={links.latest}>Senaste</a></nav>
        <nav aria-label="Projekt och engagemang"><h3>Utforska</h3><a href={links.projects}>Alla projekt</a><a href={links.phobos}>Phobos</a><a href={sitePath('projects/deimos')}>Deimos</a><a href={links.partners}>Våra partners</a><a href={links.support}>Stöd CAESAR <span aria-hidden="true">↗</span></a><a href={links.membership}>Medlemskap</a></nav>
        <nav aria-label="Kontakt och sociala medier"><h3>Håll kontakten</h3><a href="mailto:info@caesar.se">info@caesar.se <span aria-hidden="true">↗</span></a>{socials.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noreferrer">{social.name} <span aria-hidden="true">↗</span></a>)}<a href={links.newsletter} target="_blank" rel="noreferrer">Nyhetsbrev <span aria-hidden="true">↗</span></a></nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} CAESAR</span><span>Byggt av studenter. Med sikte på rymden.</span><a href="#top">Till toppen <span aria-hidden="true">↑</span></a></div>
    </div></footer>
  )
}
