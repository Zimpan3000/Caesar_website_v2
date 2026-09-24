import { useScrollReveal } from '../useScrollReveal'
import { useEffect } from 'react'
import RocketScrollExperience from '../components/RocketScrollExperience'
import ProjectFeature from '../components/ProjectFeature'
import SectionHeader from '../components/SectionHeader'
import NewsCard from '../components/NewsCard'
import Partners from '../components/Partners'
import Arrow from '../components/Arrow'
import { links, news } from '../data/site'

export default function Home() {
  useEffect(() => {
    if (!window.location.hash) return
    let cancelled = false
    let frame = 0
    // Cross-page links arrive before React has mounted the target sections.
    // Wait for fonts and the initial scene layout before positioning the page.
    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [])

  useScrollReveal()

  return <>
    <RocketScrollExperience />
    <ProjectFeature />
    <section id="senaste" className="news-section section-space" aria-label="Senaste från CAESAR"><div className="container"><SectionHeader label="03 / Från föreningen" title="Senaste från CAESAR"><a className="text-link" href={links.latest}>Alla nyheter <Arrow /></a></SectionHeader><div className="news-grid">{news.map((item) => <NewsCard key={item.url} item={item} />)}</div></div></section>
    <Partners />
  </>
}
