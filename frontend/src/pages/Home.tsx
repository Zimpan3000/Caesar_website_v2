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

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    let observer: IntersectionObserver | undefined
    const configure = () => {
      observer?.disconnect()
      elements.forEach(element => element.classList.remove('reveal-pending'))
      if (preference.matches) return
      // One observer for ordinary sections. GSAP exclusively owns the pinned
      // rocket/About scene; those elements never receive data-reveal.
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); observer?.unobserve(entry.target) }
        })
      }, { threshold: .04 })
      elements.forEach(element => {
        if (element.getBoundingClientRect().top > window.innerHeight) { element.classList.add('reveal-pending'); observer!.observe(element) }
      })
    }
    configure()
    preference.addEventListener('change', configure)
    return () => { observer?.disconnect(); preference.removeEventListener('change', configure); elements.forEach(element => element.classList.remove('reveal-pending')) }
  }, [])

  return <>
    <RocketScrollExperience />
    <ProjectFeature />
    <section id="senaste" className="news-section section-space" aria-label="Senaste från CAESAR"><div className="container"><SectionHeader label="03 / Från föreningen" title="Senaste från CAESAR"><a className="text-link" href={links.latest}>Alla nyheter <Arrow /></a></SectionHeader><div className="news-grid">{news.map((item) => <NewsCard key={item.url} item={item} />)}</div></div></section>
    <Partners />
  </>
}
