import { sitePath } from '../paths'
export default function EarthTransition() {
  return (
    <div className="earth-story" aria-hidden="true">
      <div className="earth-visual">
        <img className="earth-image" src={sitePath('assets/earth-horizon-1249.webp')} srcSet={`${sitePath('assets/earth-horizon-800.webp')} 800w, ${sitePath('assets/earth-horizon-1249.webp')} 1249w`} sizes="(max-aspect-ratio: 11/10) 119svh, 108vw" width="1249" height="700" alt="" decoding="async" />
      </div>
    </div>
  )
}
