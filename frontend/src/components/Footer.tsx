import { sitePath } from '../paths'
import { links, socials } from '../data/site'
import Arrow from './Arrow'

export default function Footer() {
  return (
    <footer id="kontakt" className="site-footer"><div className="container">
      <div className="footer-invitation" data-reveal><div><p className="eyebrow">Your journey starts here</p><h2>Space is closer<br />than you think.</h2></div><a className="button button-primary" href={links.membership}>Join CAESAR <Arrow diagonal /></a></div>
      <div className="footer-main">
        <div className="footer-brand"><a className="brand" href={sitePath()} aria-label="CAESAR home"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" loading="lazy" /></a><p>Chalmers Aerospace Society<br />for Advanced Rocketry</p><span>Göteborg, Sweden</span></div>
        <nav aria-label="Footer navigation"><h3>CAESAR</h3><a href={sitePath()}>Home</a><a href={links.about}>About Us</a><a href={links.board}>Board 26/27</a><a href={links.documents}>Governing Documents</a><a href={links.latest}>Latest News</a></nav>
        <nav aria-label="Projects and involvement"><h3>Explore</h3><a href={links.projects}>All Projects</a><a href={links.phobos}>Phobos</a><a href={sitePath('projects/deimos')}>Deimos</a><a href={links.partners}>Our Partners</a><a href={links.sponsor}>Become a Sponsor</a><a href={links.support}>Support Us <span aria-hidden="true">↗</span></a><a href={links.membership}>Membership</a></nav>
        <nav aria-label="Contact and social media"><h3>Stay in Touch</h3><a href="mailto:info@caesar.se">info@caesar.se <span aria-hidden="true">↗</span></a>{socials.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noreferrer">{social.name} <span aria-hidden="true">↗</span></a>)}<a href={links.newsletter} target="_blank" rel="noreferrer">Newsletter <span aria-hidden="true">↗</span></a></nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} CAESAR</span><span>Built by students. Bound for space.</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
    </div></footer>
  )
}
