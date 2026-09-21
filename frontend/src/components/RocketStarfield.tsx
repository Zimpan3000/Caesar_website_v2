import { useEffect, useRef } from 'react'

// One canvas, capped resolution and a sparse population; no per-star DOM nodes.
export default function RocketStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return
    const viewport = canvas.parentElement!
    const motion = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 600px)')
    let width = 0
    let height = 0
    let frame = 0
    let lastFrame = 0
    let lastTick = 0
    let animationTime = 0
    let nextMeteor = 3000 + Math.random() * 2000
    let meteor: { x: number; y: number; distance: number; duration: number; start: number } | null = null
    let visible = false
    let stars: { x: number; y: number; radius: number; brightness: number; phase: number; period: number; color: string }[] = []

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      for (const star of stars) {
        // Independent slow swells with a smaller, faster shimmer; never a hard flash.
        const wave = .5 + .5 * Math.sin(time / star.period + star.phase)
        const shimmer = .82 + .18 * Math.sin(time / (star.period * .23) + star.phase * 2)
        const twinkle = motion.matches ? 1 : (.15 + 1.2 * wave ** 2) * shimmer
        const x = star.x * width
        const y = star.y * height
        const shine = Math.max(0, twinkle - .66)
        if (shine > 0 && star.radius > .85) {
          const halo = context.createRadialGradient(x, y, 0, x, y, star.radius * 5)
          halo.addColorStop(0, star.color)
          halo.addColorStop(1, 'transparent')
          context.globalAlpha = shine * star.brightness * .6
          context.fillStyle = halo
          context.fillRect(x - 6, y - 6, 12, 12)
        }
        context.globalAlpha = Math.min(1, star.brightness * twinkle)
        context.fillStyle = star.color
        context.beginPath()
        context.arc(x, y, star.radius, 0, Math.PI * 2)
        context.fill()
      }
      if (meteor && !motion.matches) {
        const progress = Math.min(1, (time - meteor.start) / meteor.duration)
        const x = meteor.x + progress * meteor.distance
        const y = meteor.y + progress * meteor.distance * .48
        const tail = Math.min(80, width * .14) * Math.min(1, progress * 6)
        const trail = context.createLinearGradient(x - tail, y - tail * .48, x, y)
        trail.addColorStop(0, 'rgba(130, 180, 222, 0)')
        trail.addColorStop(.8, 'rgba(175, 211, 239, .35)')
        trail.addColorStop(1, '#e2efff')
        context.globalAlpha = Math.sin(progress * Math.PI) * .65
        context.strokeStyle = trail
        context.lineWidth = 1.5
        context.beginPath()
        context.moveTo(x - tail, y - tail * .48)
        context.lineTo(x, y)
        context.stroke()
        context.fillStyle = '#e2efff'
        context.beginPath()
        context.arc(x, y, 1.4, 0, Math.PI * 2)
        context.fill()
        if (progress >= 1) meteor = null
      }
      context.globalAlpha = 1
    }
    const tick = (time: number) => {
      animationTime += lastTick ? Math.min(time - lastTick, 100) : 0
      lastTick = time
      if (time - lastFrame >= 1000 / 30) {
        if (!meteor && animationTime >= nextMeteor) {
          // Spread streaks across the background, leaving room for their travel.
          meteor = {
            x: width * (.06 + Math.random() * .72),
            y: height * (.18 + Math.random() * .62),
            distance: Math.min(155, width * .18),
            duration: 1300 + Math.random() * 600,
            start: animationTime,
          }
          nextMeteor = animationTime + 3000 + Math.random() * 2000
        }
        draw(animationTime)
        lastFrame = time
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      lastTick = 0
      if (motion.matches) meteor = null
      draw(animationTime)
      if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick)
    }
    const resize = () => {
      width = viewport.clientWidth
      // Static mode can be a long document: keep the canvas confined to the hero.
      height = Math.min(viewport.clientHeight, window.innerHeight) + 128
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = Math.min(125, Math.max(35, Math.round(width * height / 14500)))
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random(), y: Math.random(), radius: .6 + Math.random() * .85,
        brightness: index % 13 === 0 ? .29 : .39 + Math.random() * .45,
        phase: Math.random() * Math.PI * 2, period: 680 + Math.random() * 1920,
        color: index % 13 === 0 ? (index % 2 ? '#ef8a45' : '#6caee7') : '#c6d2df',
      }))
      sync()
    }
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    resize()
    resizeObserver.observe(viewport)
    intersectionObserver.observe(canvas)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return <canvas ref={canvasRef} className="rocket-starfield" aria-hidden="true" />
}
