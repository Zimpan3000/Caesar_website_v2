import { useEffect, useRef } from 'react'
import Arrow from './Arrow'

type Destination = { id: string; href: string; label: string; current?: 'page' | 'location' }
type Props = {
  name: 'home' | 'project'
  id: string
  label: string
  title: string
  description: string
  titleHref: string
  lang: string
  items: Destination[]
  open: boolean
  active: boolean
  onOpenChange: (open: boolean) => void
}

export default function HeaderDropdown({ name, id, label, title, description, titleHref, lang, items, open, active, onOpenChange }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const cancelClose = () => clearTimeout(closeTimer.current)
  const canHover = () => window.matchMedia('(min-width: 901px) and (hover: hover)').matches

  useEffect(() => () => clearTimeout(closeTimer.current), [])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Close this disclosure before the outer mobile menu handles Escape.
      event.stopPropagation()
      cancelClose()
      onOpenChange(false)
      toggle.current?.focus()
    }
    const onOutside = (event: PointerEvent) => {
      // Navigation clicks close/switch menus after the click has landed. Closing
      // an accordion on pointerdown would move the next link out from under it.
      if ((event.target as Element).closest('.main-navigation')) return
      if (!root.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onOutside)
    }
  }, [open, onOpenChange])

  return <div ref={root} className={`navigation-disclosure ${name}-navigation${open ? ' is-open' : ''}`} onPointerEnter={event => {
    cancelClose()
    if (event.pointerType === 'mouse' && canHover()) onOpenChange(true)
  }} onPointerLeave={() => {
    if (canHover() && !root.current?.contains(document.activeElement)) closeTimer.current = setTimeout(() => onOpenChange(false), 150)
  }} onFocus={cancelClose} onBlur={event => {
    // Mobile accordions remain expanded while focus moves within the menu.
    if (window.matchMedia('(min-width: 901px)').matches && !event.currentTarget.contains(event.relatedTarget as Node)) onOpenChange(false)
  }}>
    <button ref={toggle} type="button" className={`navigation-toggle ${name}-toggle${active ? ' is-active' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => onOpenChange(!open)} onKeyDown={event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        onOpenChange(true)
        requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>('.navigation-destinations a')?.focus())
      }
    }}>{label} <svg className="navigation-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg></button>
    <div id={id} className={`navigation-dropdown ${name}-dropdown`} hidden={!open}>
      <div className={`navigation-dropdown-inner ${name}-dropdown-inner`} lang={lang}>
        <a className={`navigation-heading ${name}-heading`} href={titleHref}><span>{title} <span>// 01</span></span><span>{description}</span></a>
        <div className={`navigation-destinations ${name}-destinations`}>
          {items.map(item => <a key={item.id} href={item.href} aria-current={item.current}><span>{item.label}</span><Arrow /></a>)}
        </div>
      </div>
    </div>
  </div>
}
