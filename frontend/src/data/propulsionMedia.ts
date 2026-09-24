// Optional project figures. No original propulsion images are currently in the
// repository. Add verified assets under public/assets and register them here;
// omitted entries render nothing, rather than broken images or invented graphs.
export type PropulsionFigure = {
  path: string // Relative to public/, e.g. assets/propulsion/isp_overlay.png
  title: string
  alt: string
  caption: string
  width: number
  height: number
}

export const propulsionMedia: Partial<Record<'isp' | 'cstar' | 'plumbing' | 'grain' | 'valve' | 'iterations' | 'assembly', PropulsionFigure>> = {}
