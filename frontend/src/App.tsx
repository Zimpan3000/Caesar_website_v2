import { useEffect, useRef } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Membership from './pages/Membership'
import Footer from './components/Footer'
import { appPathname } from './paths'

export default function App() {
  const pathname = appPathname(window.location.pathname)
  const isMembership = pathname === '/ga-med-i-caesar'
  const legacyProject = pathname === '/projects/deimos'
  const redirectStarted = useRef(false)
  useEffect(() => {
    if (legacyProject && !redirectStarted.current) {
      redirectStarted.current = true
      window.location.replace('https://caesar.se/projekt/deimos/')
    }
  }, [legacyProject])

  if (legacyProject) return <p className="container redirect-message">Öppnar Deimos… <a href="https://caesar.se/projekt/deimos/">Fortsätt till projektet</a></p>

  return (
    <div className="app" id="top">
      <a className="skip-link" href="#main">Hoppa till innehållet</a>
      <Header isMembership={isMembership} />
      <main id="main" tabIndex={-1}>
        {isMembership ? <Membership /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}
