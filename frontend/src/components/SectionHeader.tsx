import type { ReactNode } from 'react'

export default function SectionHeader({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <div className="section-header" data-reveal><div><p className="eyebrow">{label}</p><h2>{title}</h2></div>{children}</div>
}
