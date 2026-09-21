import { sitePath } from '../paths'
import Arrow from './Arrow'
import { links } from '../data/site'

export default function TeamAbout() {
  return (
    <section id="om-oss" className="about-story" aria-labelledby="about-title">
      <div className="about-composition">
        <div className="about-copy">
          <p className="about-label"><span aria-hidden="true" />01 / VILKA VI ÄR</p>
          <h2 id="about-title">VI ÄR CAESAR<span>.</span></h2>
          <div className="about-body">
            <p className="about-lead"><strong>CAESAR startades 2021, då under namnet Chalmers Raketgrupp, av chalmerister med ett gemensamt intresse för rymden och rymdteknik.</strong></p>
            <p>Vi designar och utvecklar raketer för att ta Chalmers närmare rymden. Som medlem får du praktisk erfarenhet genom hela utvecklingen – från första koncept till uppskjutning.</p>
            <p>För att ge våra medlemmar bästa möjliga förutsättningar erbjuder vi även tekniska föreläsningar, studiebesök hos sponsorer och andra aktörer samt aktiviteter som stärker gemenskapen och intresset för rymdteknik.</p>
            <a className="text-link" href={links.about}>Läs mer om CAESAR <Arrow diagonal /></a>
          </div>
        </div>
        <figure className="about-portrait">
          <img src={sitePath('assets/caesar-team.webp')} alt="CAESARs team samlat i föreningens svarta tröjor framför en mörk ridå" width="1262" height="864" decoding="async" />
          <figcaption lang="en"><span aria-hidden="true" />TEAM CAESAR — CHALMERS UNIVERSITY OF TECHNOLOGY</figcaption>
        </figure>
      </div>
    </section>
  )
}
