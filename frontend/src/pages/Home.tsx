import { useScrollReveal } from '../useScrollReveal'
import { useEffect } from 'react'
import RocketScrollExperience from '../components/RocketScrollExperience'
import ProjectFeature from '../components/ProjectFeature'
import Partners from '../components/Partners'

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
    <Partners />
  </>
}
