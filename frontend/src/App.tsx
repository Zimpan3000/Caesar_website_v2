import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Membership from './pages/Membership'
import Support from './pages/Support'
import Sponsor from './pages/Sponsor'
import RocketProject from './pages/RocketProject'
import { rocketProjects } from './data/rocketProjects'
import Electronics from './pages/Electronics'
import Propulsion from './pages/Propulsion'
import Structures from './pages/Structures'
import Marketing from './pages/Marketing'
import Footer from './components/Footer'
import { appPathname, sitePath } from './paths'

const MembersApp = lazy(() => import('./members/MembersApp'))

export default function App() {
  const [location, setLocation] = useState(() => window.location.pathname)
  const pathname = appPathname(location)
  const rocketProject = rocketProjects.find(project => pathname === `/projekt/${project.slug}`)
  const isMembership = pathname === '/ga-med-i-caesar'
  const isSupport = pathname === '/stod-oss'
  const isSponsor = pathname === '/bli-sponsor'
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
    if (!['/', '/electronics', '/propulsion', '/structures', '/marketing', '/ga-med-i-caesar', '/stod-oss', '/bli-sponsor', '/projects/deimos', ...rocketProjects.map(project => `/projekt/${project.slug}`)].includes(appPathname(url.pathname))) return
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

  if (legacyProject) return <p className="container redirect-message">Opening Deimos… <a href="https://caesar.se/projekt/deimos/">Continue to the project</a></p>

  if (pathname === '/login' || pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return <Suspense fallback={<p className="container redirect-message" role="status">Loading workspace…</p>}><MembersApp pathname={pathname} /></Suspense>
  }

  return (
    <div className="app" id="top" onClick={navigate}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header key={pathname} isRocketProject={!!rocketProject} isMembership={isMembership} isSupport={isSupport} isSponsor={isSponsor} isElectronics={isElectronics} isPropulsion={isPropulsion} isStructures={isStructures} isMarketing={isMarketing} />
      <main id="main" tabIndex={-1}>
        {rocketProject ? <RocketProject key={rocketProject.slug} project={rocketProject} /> : isSponsor ? <Sponsor /> : isSupport ? <Support /> : isMembership ? <Membership /> : isElectronics ? <Electronics /> : isPropulsion ? <Propulsion /> : isStructures ? <Structures /> : isMarketing ? <Marketing /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}
