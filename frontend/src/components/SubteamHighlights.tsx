export default function SubteamHighlights() {
  return (
    <div className="subteam-highlights" aria-hidden="true">
      <div className="team-effect effect-electronics">
        <span className="detail-glow" /><span className="detail-pulse" /><span className="detail-scan" />
      <svg viewBox="0 0 320 240" fill="none">
        <path className="signal-path" d="M65 75h50l20 20h50l20-20h45M70 165h35l25-25h70l20 20h35M115 95v45m90-45v45" />
        <g className="signal-nodes"><circle cx="65" cy="75" r="3" /><circle cx="250" cy="75" r="3" /><circle cx="70" cy="165" r="3" /><circle cx="255" cy="160" r="3" /></g>
      </svg>
      </div>
      <div className="team-effect effect-propulsion"><span className="propulsion-halo detail-glow" /><span className="propulsion-ring detail-pulse" /><span className="detail-scan" /></div>
      <div className="team-effect effect-structures">
        <span className="detail-glow" /><span className="detail-pulse" /><span className="detail-scan" />
      <svg viewBox="0 0 320 300" fill="none">
        <path d="M60 60h200M60 52v16m200-16v16M80 80v165m-8-165h16m-16 165h16M240 80v165m-8-165h16m-16 165h16M100 105h120M100 210h120" />
        <text x="160" y="44" textAnchor="middle">DIAMETER</text>
      </svg>
      </div>
      <div className="team-effect effect-marketing"><span className="brand-halo detail-glow" /><span className="detail-pulse" /><span className="detail-scan" /><span className="brand-bracket bracket-left" /><span className="brand-bracket bracket-right" /></div>
    </div>
  )
}
