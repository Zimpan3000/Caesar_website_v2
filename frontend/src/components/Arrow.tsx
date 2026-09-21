export default function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">{diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>
}
