import Arrow from './Arrow'
import { links } from '../data/site'

export default function MissionTransition() {
  return (
    <div id="vision" className="rocket-mission" aria-hidden="true">
      <div className="mission-title">
        <p className="eyebrow"><span className="status-dot" /> CAESAR</p>
        <h2>Chalmers<br />mot rymden<span className="mission-period">.</span></h2>
      </div>
      <div className="mission-details">
      <p className="mission-statement">Vi ska se till att Chalmers står starkt i den internationella rymdkapplöpningen.</p>
      <a className="button mission-cta" href={links.phobos} tabIndex={-1}>Utforska Phobos <Arrow /></a>
      <a className="mission-continue" href="#om-oss" tabIndex={-1}>Möt människorna bakom <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  )
}
