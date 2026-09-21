import { sitePath } from '../paths'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { links } from '../data/site'
import { subteams } from '../data/subteams'

const missionItems = [
  { id: 'overview', href: '#top', label: 'Overview' },
  ...subteams.map(team => ({ id: team.id, href: `#${team.id}`, label: team.name })),
  { id: 'vision', href: '#vision', label: 'Our vision' },
]

export default function Header({ isMembership = false }: { isMembership?: boolean }) {
  const homeSection = (hash: string) => isMembership ? sitePath(hash) : hash
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const missionLinks = useRef<HTMLDivElement>(null)
  const [activeMission, setActiveMission] = useState<string | null>('overview')
  const missionIndex = missionItems.findIndex(item => item.id === activeMission)

  useEffect(() => {
    const experience = document.querySelector<HTMLElement>('.rocket-experience')
    if (!experience) return
    let frame = 0
    const update = () => {
      frame = 0
      if (experience.dataset.mode === 'static') {
        const readingLine = window.innerHeight * .4
        const mission = experience.querySelector<HTMLElement>('.rocket-mission')!
        if (mission.getBoundingClientRect().bottom < readingLine) {
          setActiveMission(null)
          return
        }
        let active = 'overview'
        for (const item of missionItems.slice(1)) {
          const content = experience.querySelector<HTMLElement>(item.id === 'vision' ? '.rocket-mission' : `.callout-${item.id}`)
          if (content && content.getBoundingClientRect().top <= readingLine) active = item.id
        }
        setActiveMission(previous => previous === active ? previous : active)
        return
      }
      // Follow the existing scene controller, including its eased reverse scroll.
      // Keep the current label during camera travel between two subteams.
      const stage = experience.dataset.stage
      if (stage === 'transition') return
      const active = stage === 'intro' ? 'overview' : stage === 'mission' ? 'vision'
        : subteams.some(team => team.id === stage) ? stage! : null
      setActiveMission(previous => previous === active ? previous : active)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onScroll = () => { if (experience.dataset.mode === 'static') schedule() }
    const observer = new MutationObserver(schedule)
    observer.observe(experience, { attributes: true, attributeFilter: ['data-stage', 'data-mode'] })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  useLayoutEffect(() => {
    const row = missionLinks.current
    if (!row) return
    const update = () => {
      const active = row.querySelector<HTMLElement>('[aria-current="location"]')
      row.style.setProperty('--mission-visible', active?.offsetWidth ? '1' : '0')
      if (!active?.offsetWidth) return
      row.style.setProperty('--mission-x', `${active.offsetLeft}px`)
      row.style.setProperty('--mission-y', `${active.offsetTop + active.offsetHeight - 1}px`)
      row.style.setProperty('--mission-width', `${active.offsetWidth}`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(row)
    row.querySelectorAll('a').forEach(link => observer.observe(link))
    return () => observer.disconnect()
  }, [activeMission, open])

  useEffect(() => {
    let wasScrolled = false
    const onScroll = () => {
      const next = window.scrollY > 24
      if (next !== wasScrolled) { wasScrolled = next; setScrolled(next) }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
    }
    const onOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    const onResize = () => { if (window.innerWidth > 900) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header ref={header} className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href={sitePath()} aria-label="CAESAR – startsida"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" /></a>
        <button ref={toggle} className="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span>{open ? 'Stäng' : 'Meny'}</span><span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="main-navigation" className="main-navigation" aria-label="Huvudnavigation" onClick={() => setOpen(false)} onBlur={(event) => {
          if (event.relatedTarget && !header.current?.contains(event.relatedTarget as Node)) setOpen(false)
        }}>
          <div className="nav-main-links">
          <a className="nav-home" href={homeSection('#top')}>Hem</a>
          <a href={homeSection('#om-oss')}>Om oss</a><a href={homeSection('#projekt')}>Projekt</a><a href={homeSection('#senaste')}>Senaste</a><a href={homeSection('#partners')}>Partners</a>
          <a href="#kontakt">Kontakt</a>
          <a href={links.membership} aria-current={isMembership ? 'page' : undefined}>Bli medlem</a>
          <a className="nav-support" href={links.support}>Stöd oss <span aria-hidden="true">↗</span></a>
          <a className="language-link" href={links.english} lang="en" hrefLang="en" aria-label="Read in English">EN</a>
          </div>
          {!isMembership && <div className="nav-subteams" role="group" aria-label="Phobos mission navigation">
            <span className="nav-subteams-label">PHOBOS <span aria-hidden="true">// {missionIndex < 0 ? '—' : String(missionIndex + 1).padStart(2, '0')}</span></span>
            <div className="mission-links" ref={missionLinks}>
              {missionItems.map(item => <a key={item.id} href={item.href} lang="en" aria-current={activeMission === item.id ? 'location' : undefined}>{item.label}</a>)}
              <span className="mission-active-line" aria-hidden="true" />
            </div>
          </div>}
        </nav>
      </div>
    </header>
  )
}
