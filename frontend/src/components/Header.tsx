import { sitePath } from '../paths'
import { useEffect, useRef, useState } from 'react'
import HeaderDropdown from './HeaderDropdown'
import { links } from '../data/site'
import { subteams } from '../data/subteams'

const missionItems = [
  { id: 'overview', href: '#top', label: 'Overview' },
  ...subteams.map(team => ({ id: team.id, href: `#${team.id}`, label: team.name[0] + team.name.slice(1).toLowerCase() })),
  { id: 'vision', href: '#vision', label: 'Our Vision' },
]

const homeItems = [
  { id: 'top', label: 'Översikt' },
  ...missionItems.filter(item => !['overview', 'vision'].includes(item.id)),
  { id: 'vision', label: 'Vår vision' },
  { id: 'om-oss', label: 'Om oss' },
  { id: 'projekt', label: 'Projekt' },
  { id: 'senaste', label: 'Senaste nytt' },
  { id: 'partners', label: 'Partners' },
  { id: 'kontakt', label: 'Kontakt' },
]

export default function Header({ isMembership = false, isElectronics = false, isPropulsion = false, isStructures = false, isMarketing = false }: { isMembership?: boolean; isElectronics?: boolean; isPropulsion?: boolean; isStructures?: boolean; isMarketing?: boolean }) {
  const isTeamPage = isElectronics || isPropulsion || isStructures || isMarketing
  const homeSection = (hash: string) => isMembership || isTeamPage ? sitePath(hash) : hash
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<'home' | 'project' | null>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const [activeMission, setActiveMission] = useState<string | null>(isElectronics ? 'electronics' : isPropulsion ? 'propulsion' : isStructures ? 'structures' : isMarketing ? 'marketing' : isMembership ? null : 'overview')
  const [activeHomeSection, setActiveHomeSection] = useState<string | null>(isMembership || isTeamPage ? null : 'top')
  const changeDropdown = (name: 'home' | 'project', nextOpen: boolean) => {
    setOpenDropdown(current => nextOpen ? name : current === name ? null : current)
  }

  useEffect(() => {
    const experience = document.querySelector<HTMLElement>('.rocket-experience')
    if (!experience) return
    let frame = 0
    const selectSection = (id: string) => {
      setActiveHomeSection(id)
      setActiveMission(id === 'top' || id === 'projekt' ? 'overview'
        : missionItems.some(item => item.id === id) ? id : null)
    }
    const update = () => {
      frame = 0
      const readingLine = window.innerHeight * .4
      for (const id of ['kontakt', 'partners', 'senaste', 'projekt']) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= readingLine) {
          selectSection(id)
          return
        }
      }
      if (experience.dataset.mode === 'static') {
        const about = experience.querySelector<HTMLElement>('.about-story')!
        if (about.getBoundingClientRect().top <= readingLine) {
          selectSection('om-oss')
          return
        }
        let active = 'top'
        for (const item of missionItems.slice(1)) {
          const content = experience.querySelector<HTMLElement>(item.id === 'vision' ? '.rocket-mission' : `.callout-${item.id}`)
          if (content && content.getBoundingClientRect().top <= readingLine) active = item.id
        }
        selectSection(active)
        return
      }
      // Follow the existing scene controller, including its eased reverse scroll.
      // Keep the current label during camera travel between two subteams.
      const stage = experience.dataset.stage
      if (stage === 'transition') return
      const active = stage === 'about' ? 'om-oss' : ['mission', 'departure', 'earth'].includes(stage || '') ? 'vision'
        : subteams.some(team => team.id === stage) ? stage! : 'top'
      selectSection(active)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onScroll = () => schedule()
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
      if (event.key !== 'Escape') return
      setOpen(false)
      setOpenDropdown(null)
      toggle.current?.focus()
    }
    const onOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setOpenDropdown(null) }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside)
    }
  }, [open])

  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 900px)')
    const reset = () => {
      const focusedDropdown = document.activeElement?.closest('.navigation-disclosure')
      if (focusedDropdown) {
        if (breakpoint.matches) toggle.current?.focus()
        else focusedDropdown.querySelector<HTMLButtonElement>('.navigation-toggle')?.focus()
      }
      setOpen(false)
      setOpenDropdown(null)
    }
    breakpoint.addEventListener('change', reset)
    return () => breakpoint.removeEventListener('change', reset)
  }, [])

  return (
    <header ref={header} className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href={sitePath()} aria-label="CAESAR – startsida"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" /></a>
        <button ref={toggle} className="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded={open} onClick={() => { setOpen(!open); setOpenDropdown(null) }}>
          <span>{open ? 'Stäng' : 'Meny'}</span><span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="main-navigation" className="main-navigation" aria-label="Huvudnavigation" onClick={event => {
          if ((event.target as Element).closest('a')) { setOpen(false); setOpenDropdown(null) }
        }} onBlur={(event) => {
          if (!header.current?.contains(event.relatedTarget as Node)) { setOpen(false); setOpenDropdown(null) }
        }}>
          <div className="nav-main-links">
          <HeaderDropdown name="home" id="home-sections-navigation" label="Hem" title="STARTSIDAN" description="Hitta till varje del av CAESAR" titleHref={homeSection('#top')} lang="sv" open={openDropdown === 'home'} active={activeHomeSection !== null} onOpenChange={next => changeDropdown('home', next)} items={homeItems.map(item => ({ ...item, href: homeSection(`#${item.id}`), current: activeHomeSection === item.id ? 'location' : undefined }))} />
          <a href={homeSection('#om-oss')}>Om oss</a>
          <HeaderDropdown name="project" id="phobos-navigation" label="Projekt" title="PHOBOS" description="Advanced Rocketry Project" titleHref={homeSection('#projekt')} lang="en" open={openDropdown === 'project'} active={activeMission !== null} onOpenChange={next => changeDropdown('project', next)} items={missionItems.map(item => ({ ...item, href: subteams.some(team => team.id === item.id) ? sitePath(item.id) : homeSection(item.href), current: activeMission === item.id ? (isTeamPage ? 'page' : 'location') : undefined }))} />
          <a href={homeSection('#senaste')}>Senaste</a><a href={homeSection('#partners')}>Partners</a>
          <a href="#kontakt">Kontakt</a>
          <a href={links.membership} aria-current={isMembership ? 'page' : undefined}>Bli medlem</a>
          <a className="nav-support" href={links.support}>Stöd oss <span aria-hidden="true">↗</span></a>
          <a className="language-link" href={links.english} lang="en" hrefLang="en" aria-label="Read in English">EN</a>
          </div>
        </nav>
      </div>
    </header>
  )
}
