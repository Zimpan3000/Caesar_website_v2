import Arrow from './Arrow'
import { links } from '../data/site'

export default function MissionTransition() {
  return (
    <div id="vision" className="rocket-mission" aria-hidden="true">
      <div className="mission-title">
        <p className="eyebrow"><span className="status-dot" /> CAESAR</p>
        <h2>Chalmers<br />bound for space<span className="mission-period">.</span></h2>
      </div>
      <div className="mission-details">
      <p className="mission-statement">Our ambition is to give Chalmers a strong place in the international pursuit of space.</p>
      <a className="button mission-cta" href={links.phobos} tabIndex={-1}>Explore Phobos <Arrow /></a>
      <a className="mission-continue" href="#om-oss" tabIndex={-1}>Meet the people behind it <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  )
}
