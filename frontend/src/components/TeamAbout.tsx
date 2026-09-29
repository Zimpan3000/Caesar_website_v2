import { sitePath } from '../paths'

export default function TeamAbout() {
  return (
    <section id="om-oss" className="about-story" aria-labelledby="about-title">
      <div className="about-composition">
        <div className="about-copy">
          <p className="about-label"><span aria-hidden="true" />01 / WHO WE ARE</p>
          <h2 id="about-title">WE ARE CAESAR<span>.</span></h2>
          <div className="about-body">
            <p className="about-lead"><strong>CAESAR was founded in 2021 as Chalmers Raketgrupp by Chalmers students with a shared interest in space and aerospace engineering.</strong></p>
            <p>We design and develop rockets to bring Chalmers closer to space. As a member, you gain hands-on experience throughout the process, from the first concept to launch.</p>
            <p>We also offer technical talks, visits to sponsors and other organisations, and activities that bring our members together around a shared interest in aerospace engineering.</p>
          </div>
        </div>
        <figure className="about-portrait">
          <img src={sitePath('assets/caesar-team.webp')} alt="The CAESAR team wearing black society shirts in front of a dark curtain" width="1262" height="864" decoding="async" />
          <figcaption lang="en"><span aria-hidden="true" />TEAM CAESAR — CHALMERS UNIVERSITY OF TECHNOLOGY</figcaption>
        </figure>
      </div>
    </section>
  )
}
