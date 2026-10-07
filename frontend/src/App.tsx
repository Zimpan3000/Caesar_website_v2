import { lazy, Suspense, useEffect, useState, type MouseEvent } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Membership from './pages/Membership'
import Support from './pages/Support'
import Sponsor from './pages/Sponsor'
import Partners from './pages/Partners'
import Contact from './pages/Contact'
import RocketProject from './pages/RocketProject'
import { rocketProjects } from './data/rocketProjects'
import Electronics from './pages/Electronics'
import Propulsion from './pages/Propulsion'
import Structures from './pages/Structures'
import Marketing from './pages/Marketing'
import Footer from './components/Footer'
import { appPathname, canonicalAppPathname, sitePath } from './paths'

const MembersApp = lazy(() => import('./members/MembersApp'))

export default function App() {
  const [location, setLocation] = useState(() => window.location.pathname)
  const pathname = canonicalAppPathname(appPathname(location))
  const rocketProject = rocketProjects.find(project => pathname === `/projects/${project.slug}`)
  const isMembership = pathname === '/join-us'
  const isSupport = pathname === '/support-us'
  const isSponsor = pathname === '/become-a-sponsor'
  const isPartners = pathname === '/partners'
  const isContact = pathname === '/contact'
  const isElectronics = pathname === '/electronics'
  const isPropulsion = pathname === '/propulsion'
  const isStructures = pathname === '/structures'
  const isMarketing = pathname === '/marketing'
  useEffect(() => {
    if (pathname === appPathname(location)) return
    const url = new URL(window.location.href)
    url.pathname = sitePath(`${pathname}/`)
    window.history.replaceState(window.history.state, '', url)
    setLocation(url.pathname)
  }, [location, pathname])
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
    const destination = canonicalAppPathname(appPathname(url.pathname))
    if (!['/', '/electronics', '/propulsion', '/structures', '/marketing', '/join-us', '/support-us', '/become-a-sponsor', '/partners', '/contact', ...rocketProjects.map(project => `/projects/${project.slug}`)].includes(destination)) return
    if (destination !== appPathname(url.pathname)) url.pathname = sitePath(`${destination}/`)
    event.preventDefault()
    window.history.pushState(null, '', url)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setLocation(url.pathname)
    requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))
  }
  if (pathname === '/login' || pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return <Suspense fallback={<p className="container redirect-message" role="status">Loading workspace…</p>}><MembersApp pathname={pathname} /></Suspense>
  }

  return (
    <div className="app" id="top" onClick={navigate}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header key={pathname} isRocketProject={!!rocketProject} isMembership={isMembership} isSupport={isSupport} isSponsor={isSponsor} isPartners={isPartners} isContact={isContact} isElectronics={isElectronics} isPropulsion={isPropulsion} isStructures={isStructures} isMarketing={isMarketing} />
      <main id="main" tabIndex={-1}>
        {rocketProject ? <RocketProject key={rocketProject.slug} project={rocketProject} /> : isContact ? <Contact /> : isPartners ? <Partners /> : isSponsor ? <Sponsor /> : isSupport ? <Support /> : isMembership ? <Membership /> : isElectronics ? <Electronics /> : isPropulsion ? <Propulsion /> : isStructures ? <Structures /> : isMarketing ? <Marketing /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}
