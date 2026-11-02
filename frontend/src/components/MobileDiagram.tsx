import { useState, type ReactNode } from 'react'

// Mount interactive diagrams on demand instead of running four hidden scenes.
export default function MobileDiagram({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <details className="mobile-diagram" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>{label}<span aria-hidden="true">+</span></summary>
    {open && <div className="mobile-diagram-content">{children}</div>}
  </details>
}
