import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Membership from './pages/Membership'
import Electronics from './pages/Electronics'
import Propulsion from './pages/Propulsion'
import Structures from './pages/Structures'
import Marketing from './pages/Marketing'
import Footer from './components/Footer'
import { appPathname, sitePath } from './paths'

export default function App() {
  const [location, setLocation] = useState(() => window.location.pathname)
  const pathname = appPathname(location)
  const isMembership = pathname === '/ga-med-i-caesar'
  const isElectronics = pathname === '/electronics'
  const isPropulsion = pathname === '/propulsion'
  const isStructures = pathname === '/structures'
  const isMarketing = pathname === '/marketing'
  const legacyProject = pathname === '/projects/deimos'
  const redirectStarted = useRef(false)
  useEffect(() => {
    const onPopState = () => setLocation(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element).closest('a')
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
    const url = new URL(anchor.href)
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
    if (!url.pathname.startsWith(sitePath())) return
    if (!['/', '/electronics', '/propulsion', '/structures', '/marketing', '/ga-med-i-caesar', '/projects/deimos'].includes(appPathname(url.pathname))) return
    event.preventDefault()
    window.history.pushState(null, '', url)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setLocation(url.pathname)
    requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))
  }
  useEffect(() => {
    if (legacyProject && !redirectStarted.current) {
      redirectStarted.current = true
      window.location.replace('https://caesar.se/projekt/deimos/')
    }
  }, [legacyProject])

  if (legacyProject) return <p className="container redirect-message">Öppnar Deimos… <a href="https://caesar.se/projekt/deimos/">Fortsätt till projektet</a></p>

  return (
    <div className="app" id="top" onClick={navigate}>
      <a className="skip-link" href="#main">Hoppa till innehållet</a>
      <Header key={pathname} isMembership={isMembership} isElectronics={isElectronics} isPropulsion={isPropulsion} isStructures={isStructures} isMarketing={isMarketing} />
      <main id="main" tabIndex={-1}>
        {isMembership ? <Membership /> : isElectronics ? <Electronics /> : isPropulsion ? <Propulsion /> : isStructures ? <Structures /> : isMarketing ? <Marketing /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}
