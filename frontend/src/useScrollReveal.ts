import { useEffect } from 'react'

// Shared by ordinary content pages; GSAP owns the homepage's pinned scene.
export function useScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    let observer: IntersectionObserver | undefined
    const configure = () => {
      observer?.disconnect()
      elements.forEach(element => element.classList.remove('reveal-pending'))
      if (preference.matches) return
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
}
