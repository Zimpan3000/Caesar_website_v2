import { sitePath } from '../paths'
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TechnicalCallout from './TechnicalCallout'
import ScrollProgress from './ScrollProgress'
import MissionTransition from './MissionTransition'
import SubteamHighlights from './SubteamHighlights'
import RocketStarfield from './RocketStarfield'
import EarthTransition from './EarthTransition'
import TeamAbout from './TeamAbout'
import FlightComputer from './FlightComputer'
import HybridPropulsion from './HybridPropulsion'
import VehicleArchitecture from './VehicleArchitecture'
import MarketingOutreach from './MarketingOutreach'
import { subteams, subteamTiming } from '../data/subteams'
import '../rocket-experience.css'

gsap.registerPlugin(ScrollTrigger)

// Preserve the relative scene timing and the longer reading interval for About.
const rocketDuration = 100
const aboutStart = 111.25
const aboutScrollScale = 3
const storyDuration = aboutStart + 12.5 * aboutScrollScale
const aboutAnchorPercent = (aboutStart + (118 - aboutStart) * aboutScrollScale) / storyDuration * 100
const sceneLinks = [
  ...subteams.map(team => ({ id: team.id, selector: `.callout-${team.id}`, time: team.progress * rocketDuration })),
  { id: 'vision', selector: '.rocket-mission', time: 99 },
]

export default function RocketScrollExperience() {
  const root = useRef<HTMLElement>(null)
  const [avionicsVisible, setAvionicsVisible] = useState(false)
  const [propulsionVisible, setPropulsionVisible] = useState(false)
  const [structuresVisible, setStructuresVisible] = useState(false)
  const [marketingVisible, setMarketingVisible] = useState(false)

  const navigate = (progress: number) => {
    const section = root.current
    if (!section) return
    const viewport = section.querySelector<HTMLElement>('.rocket-viewport')!
    const top = section.getBoundingClientRect().top + window.scrollY
    const team = subteams.find(team => team.progress === progress)
    if (team) section.querySelector<HTMLButtonElement>(`[data-stage="${team.id}"]`)?.focus({ preventScroll: true })
    window.scrollTo({ top: top + (section.offsetHeight - viewport.offsetHeight) * progress * rocketDuration / storyDuration, behavior: 'auto' })
  }

  useLayoutEffect(() => {
    const section = root.current!
    const media = gsap.matchMedia()

    media.add({
      desktop: '(min-width: 901px)',
      mobile: '(max-width: 900px)',
      reduced: '(prefers-reduced-motion: reduce)',
      static: '(prefers-reduced-motion: reduce), (max-height: 600px), (max-width: 900px) and (max-height: 720px)',
    }, (context) => {
      const { mobile, reduced, static: staticMode } = context.conditions!
      const select = gsap.utils.selector(section)
      const viewport = select('.rocket-viewport')[0] as HTMLElement
      const rocket = select('.rocket-image')[0] as HTMLImageElement
      const intro = select('.rocket-intro')[0] as HTMLElement
      const mission = select('.rocket-mission')[0] as HTMLElement
      const navigation = select('.rocket-progress')[0] as HTMLElement
      const about = select('.about-story')[0] as HTMLElement
      const aboutAnchor = select('.about-anchor')[0] as HTMLElement
      const aboutLink = about.querySelector<HTMLAnchorElement>('a')!
      const composition = select('.about-composition')[0] as HTMLElement
      const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-stage]'))
      const panels = Array.from(section.querySelectorAll<HTMLElement>('.technical-callout'))
      const missionLinks = Array.from(mission.querySelectorAll<HTMLAnchorElement>('a'))
      const introLinks = Array.from(intro.querySelectorAll<HTMLElement>('a, button'))
      const height = () => viewport.clientHeight
      const initialX = () => mobile ? 0 : viewport.clientWidth * .19
      const initialY = () => height() * (mobile ? .09 : .035)
      // Native hash links target the settled scroll scenes. In the static layout,
      // the same IDs belong to the content itself, so links work in both modes.
      const setSceneAnchors = (scrollMode: boolean) => sceneLinks.forEach(scene => {
        const anchor = section.querySelector<HTMLElement>(`[data-scene-anchor="${scene.id}"]`)!
        const content = select(scene.selector)[0] as HTMLElement
        const target = scrollMode ? anchor : content
        const other = scrollMode ? content : anchor
        other.removeAttribute('id')
        target.id = scene.id
      })
      setSceneAnchors(!staticMode)

      const restoreAccessibility = () => {
        intro.removeAttribute('aria-hidden')
        introLinks.forEach(link => link.removeAttribute('tabindex'))
        mission.setAttribute('aria-hidden', 'true')
        missionLinks.forEach(link => link.setAttribute('tabindex', '-1'))
        panels.forEach(panel => {
          panel.setAttribute('aria-hidden', 'true')
          panel.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.tabIndex = -1)
        })
        navigation.removeAttribute('aria-hidden')
        buttons.forEach(button => { button.removeAttribute('aria-current'); button.removeAttribute('tabindex') })
        about.removeAttribute('aria-hidden')
        aboutLink.removeAttribute('tabindex')
        aboutAnchor.removeAttribute('id')
        about.id = 'om-oss'
        setSceneAnchors(false)
      }

      if (staticMode) {
        section.dataset.mode = 'static'
        setAvionicsVisible(true)
        setPropulsionVisible(true)
        setStructuresVisible(true)
        setMarketingVisible(true)
        mission.removeAttribute('aria-hidden')
        missionLinks.forEach(link => link.removeAttribute('tabindex'))
        panels.forEach(panel => {
          panel.removeAttribute('aria-hidden')
          panel.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.tabIndex = 0)
        })
        // Short viewports use normal document flow. One trigger owns both halves
        // of the About composition; reduced motion keeps them immediately visible.
        if (!reduced) {
          gsap.fromTo(select('.about-copy, .about-portrait'), { autoAlpha: 0, y: 20 }, {
            autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out',
            scrollTrigger: { trigger: about, start: 'top 85%', toggleActions: 'play none none reverse' },
          })
        }
        return restoreAccessibility
      }

      section.dataset.mode = 'scroll'
      setAvionicsVisible(false)
      setPropulsionVisible(false)
      setStructuresVisible(false)
      setMarketingVisible(false)
      about.removeAttribute('id')
      aboutAnchor.id = 'om-oss'
      about.setAttribute('aria-hidden', 'true')
      aboutLink.tabIndex = -1
      gsap.set(rocket, { x: initialX, y: initialY, scale: 1, force3D: true })
      gsap.set(select('.rocket-grid, .rocket-measurements, .technical-callout, .team-effect, .rocket-mission'), { autoAlpha: 0 })
      gsap.set(select('.team-effect'), { xPercent: -50, yPercent: -50, x: 0, y: 0 })
      gsap.set(select('.progress-fill'), { scaleX: mobile ? 0 : 1, scaleY: mobile ? 1 : 0, transformOrigin: mobile ? 'left' : 'top' })
      gsap.set(select('.earth-visual'), { autoAlpha: 0, y: () => height() * .7, scale: .9 })
      gsap.set(select('.about-copy, .about-portrait'), { autoAlpha: 0, y: 20 })

      let currentStage = ''
      let missionVisible = false
      let introVisible = true
      let navigationVisible = true
      let aboutVisible = false
      // A single real-time reveal starts text and image on the same animation
      // frame. It reverses from its current progress when scrolling back up.
      const aboutReveal = gsap.to(select('.about-copy, .about-portrait'), {
        autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out', paused: true,
        onComplete: () => { if (aboutVisible) aboutLink.tabIndex = 0 },
      })
      const effectPositions = subteams.map(team => ({
        point: team.point,
        setY: gsap.quickSetter(select(`.effect-${team.id}`), 'y', 'px'),
      }))

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // Follow the section height so scenes and links share the faster pacing.
          end: () => `+=${section.offsetHeight - viewport.offsetHeight}`,
          // Interpolate the artwork only; wheel, touch, keyboard and scrollbar
          // movement stay native, without snapping or scroll interception.
          scrub: .12,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          // Project each highlight onto its actual rocket region as the camera travels.
          const rocketY = Number(gsap.getProperty(rocket, 'y'))
          const rocketScale = Number(gsap.getProperty(rocket, 'scaleX'))
          effectPositions.forEach(effect => effect.setY(rocketY + rocket.offsetHeight * rocketScale * (effect.point - .5)))
          const scrollTime = this.time()
          const time = scrollTime <= aboutStart ? scrollTime : aboutStart + (scrollTime - aboutStart) / aboutScrollScale
          const activeIndex = subteams.findIndex(team => time >= team.start && time < team.end + subteamTiming.exit)
          const stage = activeIndex >= 0 ? subteams[activeIndex].id : time < 10 ? 'intro' : time >= 112 ? 'about' : time >= 103.3 ? 'earth' : time >= 100 ? 'departure' : time >= 90 ? 'mission' : 'transition'
          if (stage !== currentStage) {
            currentStage = stage
            section.dataset.stage = stage
            setAvionicsVisible(stage === 'electronics')
            setPropulsionVisible(stage === 'propulsion')
            setStructuresVisible(stage === 'structures')
            setMarketingVisible(stage === 'marketing')
            buttons.forEach((button, index) => {
              if (index === activeIndex) button.setAttribute('aria-current', 'step')
              else button.removeAttribute('aria-current')
            })
            panels.forEach((panel, index) => {
              panel.setAttribute('aria-hidden', String(index !== activeIndex))
              panel.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.tabIndex = index === activeIndex ? 0 : -1)
            })
          }
          // Keep hidden panels and navigation out of the keyboard/screen-reader path.
          const showMission = time >= 94 && time < 101
          if (showMission !== missionVisible) {
            missionVisible = showMission
            mission.setAttribute('aria-hidden', String(!showMission))
            missionLinks.forEach(link => link.tabIndex = showMission ? 0 : -1)
          }
          const showIntro = time < 10
          if (showIntro !== introVisible) {
            introVisible = showIntro
            intro.setAttribute('aria-hidden', String(!showIntro))
            introLinks.forEach(link => link.tabIndex = showIntro ? 0 : -1)
          }
          const showNavigation = time < 91
          if (showNavigation !== navigationVisible) {
            navigationVisible = showNavigation
            navigation.setAttribute('aria-hidden', String(!showNavigation))
            buttons.forEach(button => button.tabIndex = showNavigation ? 0 : -1)
          }
          const showAbout = time >= 112
          if (showAbout !== aboutVisible) {
            aboutVisible = showAbout
            about.setAttribute('aria-hidden', String(!showAbout))
            if (showAbout) aboutReveal.play()
            else { aboutReveal.reverse(); aboutLink.tabIndex = -1 }
          }
        },
      })

      timeline
        .to(intro, { autoAlpha: 0, y: -35, duration: 6 }, 4)
        .to(select('.rocket-grid'), { autoAlpha: .25, duration: 8 }, 6)
        .to(select('.rocket-measurements'), { autoAlpha: .65, duration: 6 }, 8)
        .to(select('.rocket-grid, .rocket-measurements'), { autoAlpha: 0, duration: 5 }, 88)
        .to(select('.rocket-starfield'), { y: -48, duration: storyDuration }, 0)
        .to(select('.progress-fill'), { scaleX: 1, scaleY: 1, duration: 80 }, 10)
        .to(navigation, { autoAlpha: 0, duration: 3 }, 88)

      subteams.forEach((team, index) => {
        const zoom = mobile ? team.zoom * .86 : team.zoom
        // The selected detail stays above the text on mobile, and at eye level on desktop.
        const y = () => rocket.offsetHeight * zoom * (.5 - team.point) + height() * (mobile ? -.21 : -.04)
        const camera = { x: 0, y, scale: zoom, duration: index === 0 ? 11 : subteamTiming.cameraTravel, ease: 'power1.inOut' }
        if (index === 0) timeline.fromTo(rocket, { x: initialX, y: initialY, scale: 1 }, camera, 4)
        else timeline.to(rocket, camera, team.start + subteamTiming.reveal - subteamTiming.cameraTravel)

        // Camera and complete copy hold still for 12 timeline units.
        // These are scroll landmarks, not timed pauses or extra tween duration.
        timeline.addLabel(`${team.id}-hold`, team.start + subteamTiming.reveal)
        timeline.addLabel(`${team.id}-depart`, team.start + subteamTiming.reveal + subteamTiming.hold)

        const panel = select(`.callout-${team.id}`)
        const within = (selector: string) => select(`.callout-${team.id} ${selector}`)
        const effect = select(`.effect-${team.id}`)
        const direction = team.side === 'left' ? -1 : 1
        timeline
          .to(panel, { autoAlpha: 1, duration: 1 }, team.start)
          .fromTo(within('.callout-line'), { scaleX: 0 }, { scaleX: 1, duration: 2 }, team.start)
          .fromTo(within('.technical-index'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2 }, team.start + .5)
          .fromTo(within('h2'), { autoAlpha: 0, x: direction * 10 }, { autoAlpha: 1, x: 0, duration: 2 }, team.start + 1)
          .fromTo(within('.subteam-description'), { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: 2 }, team.start + 2)
          .fromTo(within('.subteam-keywords li'), { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 1.5, stagger: .125 }, team.start + 3)
          .fromTo(effect, { autoAlpha: 0, scale: .97 }, { autoAlpha: 1, scale: 1, duration: 4 }, team.start + 1)
          .to(panel, { autoAlpha: 0, duration: subteamTiming.exit }, team.end)
          .to(effect, { autoAlpha: 0, duration: subteamTiming.exit }, team.end)
          .fromTo(select(`.effect-${team.id} .detail-scan`), { yPercent: 0 }, { yPercent: 780, duration: subteamTiming.hold }, team.start + subteamTiming.reveal)
          .fromTo(select(`.effect-${team.id} .detail-pulse`), { scale: .92, opacity: .15 }, { scale: 1.12, opacity: .55, duration: subteamTiming.hold / 2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, team.start + subteamTiming.reveal)
      })

      // Signal and branding highlights are scrubbed with the camera, never autoplayed.
      timeline
        .fromTo(select('.signal-nodes'), { opacity: .25 }, { opacity: .9, duration: 4 }, 20)
        .fromTo(select('.propulsion-halo'), { scale: .8 }, { scale: 1.05, duration: 7 }, 37)
        .to(rocket, { x: 0, y: 0, scale: mobile ? .66 : .94, duration: 10, ease: 'power1.inOut' }, 87)
        .fromTo(mission, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 5 }, 93)
        .to({}, { duration: 2 }, 98)

      timeline
        .addLabel('earth-departure', rocketDuration)
        .to(mission, { autoAlpha: 0, y: -30, duration: 1.5 }, 100)
        .to(select('.rocket-viewport-footer'), { autoAlpha: 0, duration: 1.5 }, 100)
        .to(rocket, { y: () => -height(), autoAlpha: 0, duration: 3.2, ease: 'power1.in' }, 100)
        // A short breath of empty space precedes the first sliver of horizon.
        .to(select('.earth-visual'), { autoAlpha: 1, duration: .8 }, 103.3)
        .to(select('.earth-visual'), { y: 0, scale: 1.08, duration: 6.2, ease: 'sine.out' }, 103.3)
        .addLabel('earth-settled', 109.5)

      // Earth and the composition's later mobile travel remain scroll-linked.
      // Entrance opacity/translation belongs exclusively to aboutReveal above.
      const aboutTimeline = gsap.timeline({ defaults: { ease: 'none' } })
        .to(select('.earth-visual'), { y: () => height() * (mobile ? .15 : .12), autoAlpha: mobile ? .5 : .65, duration: 4.5, ease: 'sine.inOut' }, 0)
        // Keep longer stacked content reachable on small screens; the desktop
        // composition stays still when the copy and smaller portrait fit.
        .to(composition, { y: () => Math.min(0, height() - composition.offsetTop - composition.offsetHeight - 40), duration: 4.5 }, 7.75)
        .to({}, { duration: .25 }, 12.25)
      timeline.add(aboutTimeline.timeScale(1 / aboutScrollScale), aboutStart)

      return restoreAccessibility
    }, section)

    return () => media.revert()
  }, [])

  return (
    <section ref={root} className="rocket-experience" aria-label="Lär känna CAESAR och våra fyra subteam" data-stage="intro">
      <span className="about-anchor" aria-hidden="true" style={{ top: `calc(${aboutAnchorPercent}% - ${aboutAnchorPercent}svh)` }} />
      {sceneLinks.map(scene => <span key={scene.id} className="scene-anchor" data-scene-anchor={scene.id} aria-hidden="true" style={{ top: `calc(${scene.time / storyDuration * 100}% - ${scene.time / storyDuration * 100}svh)` }} />)}
      <div className="rocket-viewport">
        <RocketStarfield />
        <div className="rocket-grid" aria-hidden="true" />
        <div className="rocket-camera">
          <img className="rocket-image" src={sitePath('assets/caesar-rocket.png')} alt="CAESARs svarta raket med silverfärgad noskon och föreningens logotyp" width="1024" height="1536" {...{ fetchpriority: 'high' }} />
        </div>
        <div className="rocket-intro">
          <div className="rocket-intro-copy">
            <p className="eyebrow rocket-origin" lang="en"><span className="status-dot" /> Chalmers · Gothenburg · Sweden</p>
            <h1 lang="en"><span>Chalmers</span>{' '}<span>Aerospace Society</span>{' '}<span>for Advanced</span>{' '}<span>Rocketry</span></h1>
            <span className="rocket-intro-rule" aria-hidden="true" />
            <p className="rocket-intro-note">Fyra team. En gemensam riktning.<br />Med sikte på rymden.</p>
          </div>
          <a className="scroll-prompt" href="#electronics"><span className="scroll-prompt-arrow" aria-hidden="true"><span>↓</span></span><span>Scrolla för att utforska<span className="scroll-prompt-caption">Upptäck raketen och våra fyra team</span></span></a>
          <a className="skip-experience" href="#om-oss">Till föreningen <span aria-hidden="true">↗</span></a>
        </div>

        <div className="rocket-measurements" aria-hidden="true"><span className="measure-top">ONE ROCKET / FOUR TEAMS</span><span className="measure-bottom">CAESAR · PHOBOS</span><span className="measure-cross cross-top">+</span><span className="measure-cross cross-bottom">+</span></div>
        <SubteamHighlights />
        <div className="subteam-panels">{subteams.map((team, index) => team.id === 'electronics' ? (
          <div className="electronics-scene" key={team.id}>
            <TechnicalCallout team={team} index={index} />
            <FlightComputer visible={avionicsVisible} />
          </div>
        ) : team.id === 'propulsion' ? (
          <div className="propulsion-scene" key={team.id}>
            <TechnicalCallout team={team} index={index} />
            <HybridPropulsion visible={propulsionVisible} />
          </div>
        ) : team.id === 'structures' ? (
          <div className="structures-scene" key={team.id}>
            <TechnicalCallout team={team} index={index} />
            <VehicleArchitecture visible={structuresVisible} />
          </div>
        ) : <div className="marketing-scene" key={team.id}><TechnicalCallout team={team} index={index} /><MarketingOutreach visible={marketingVisible} /></div>)}</div>
        <MissionTransition />
        <EarthTransition />
        <TeamAbout />
        <ScrollProgress onNavigate={navigate} />
        <div className="rocket-viewport-footer" aria-hidden="true"><span>PHOBOS / PÅGÅENDE PROJEKT</span><span>FRÅN IDÉ TILL UPPSKJUTNING</span></div>
      </div>
    </section>
  )
}
