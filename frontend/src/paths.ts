// Vite supplies '/' during development and '/new/' in the deployment build.
export function sitePath(path = '') {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export function appPathname(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const localPath = pathname === base ? '/' : pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length) : pathname
  return localPath.replace(/\/$/, '') || '/'
}
