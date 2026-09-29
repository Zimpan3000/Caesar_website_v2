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
  { id: 'top', label: 'Overview' },
  ...missionItems.filter(item => !['overview', 'vision'].includes(item.id)),
  { id: 'vision', label: 'Our Vision' },
  { id: 'om-oss', label: 'About Us' },
  { id: 'projekt', label: 'Projects' },
  { id: 'partners', label: 'Partners' },
  { id: 'kontakt', label: 'Contact' },
]

export default function Header({ isRocketProject = false, isMembership = false, isSupport = false, isSponsor = false, isElectronics = false, isPropulsion = false, isStructures = false, isMarketing = false }: { isRocketProject?: boolean; isMembership?: boolean; isSupport?: boolean; isSponsor?: boolean; isElectronics?: boolean; isPropulsion?: boolean; isStructures?: boolean; isMarketing?: boolean }) {
  const isTeamPage = isElectronics || isPropulsion || isStructures || isMarketing
  const homeSection = (hash: string) => isRocketProject || isMembership || isSupport || isSponsor || isTeamPage ? sitePath(hash) : hash
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<'home' | 'project' | null>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const [activeMission, setActiveMission] = useState<string | null>(isRocketProject ? 'phobos' : isElectronics ? 'electronics' : isPropulsion ? 'propulsion' : isStructures ? 'structures' : isMarketing ? 'marketing' : isMembership || isSupport || isSponsor ? null : 'overview')
  const [activeHomeSection, setActiveHomeSection] = useState<string | null>(isRocketProject || isMembership || isSupport || isSponsor || isTeamPage ? null : 'top')
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
      for (const id of ['kontakt', 'partners', 'projekt']) {
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
        <a className="brand" href={sitePath()} aria-label="CAESAR home"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR" width="2172" height="724" /></a>
        <button ref={toggle} className="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded={open} onClick={() => { setOpen(!open); setOpenDropdown(null) }}>
          <span>{open ? 'Close' : 'Menu'}</span><span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="main-navigation" className="main-navigation" aria-label="Main navigation" onClick={event => {
          if ((event.target as Element).closest('a')) { setOpen(false); setOpenDropdown(null) }
        }} onBlur={(event) => {
          if (!header.current?.contains(event.relatedTarget as Node)) { setOpen(false); setOpenDropdown(null) }
        }}>
          <div className="nav-main-links">
          <HeaderDropdown name="home" id="home-sections-navigation" label="Home" title="HOMEPAGE" description="Explore every part of CAESAR" titleHref={homeSection('#top')} lang="en" open={openDropdown === 'home'} active={activeHomeSection !== null} onOpenChange={next => changeDropdown('home', next)} items={homeItems.map(item => ({ ...item, href: homeSection(`#${item.id}`), current: activeHomeSection === item.id ? 'location' : undefined }))} />
          <a href={homeSection('#om-oss')}>About Us</a>
          <HeaderDropdown name="project" id="phobos-navigation" label="Projects" title="PHOBOS" description="Hybrid rocket / Target altitude 3 km" titleHref={links.phobos} lang="en" open={openDropdown === 'project'} active={activeMission !== null} onOpenChange={next => changeDropdown('project', next)} items={[
            { id: 'projects', label: 'All Projects', href: homeSection('#projekt'), current: activeHomeSection === 'projekt' ? 'location' : undefined },
            { id: 'phobos', label: 'Phobos', href: links.phobos, current: isRocketProject ? 'page' : undefined },
            ...missionItems.filter(item => item.id !== 'overview').map(item => ({ ...item, href: subteams.some(team => team.id === item.id) ? sitePath(item.id) : homeSection(item.href), current: activeMission === item.id ? (isTeamPage ? 'page' as const : 'location' as const) : undefined })),
          ]} />
          <a href={homeSection('#partners')}>Partners</a>
          <a href={links.sponsor} aria-current={isSponsor ? 'page' : undefined}>Become a Sponsor</a>
          <a href="#kontakt">Contact</a>
          <a href={links.membership} aria-current={isMembership ? 'page' : undefined}>Join Us</a>
          <a className="nav-support" href={links.support} aria-current={isSupport ? 'page' : undefined}>Support Us <span aria-hidden="true">↗</span></a>
          </div>
        </nav>
      </div>
    </header>
  )
}
