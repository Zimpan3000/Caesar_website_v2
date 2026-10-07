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

// Keep existing local bookmarks working while displaying English page URLs.
export function canonicalAppPathname(pathname: string) {
  const aliases: Record<string, string> = {
    '/bli-sponsor': '/become-a-sponsor',
    '/stod-oss': '/support-us',
    '/ga-med-i-caesar': '/join-us',
    '/sponsorer': '/partners',
  }
  return aliases[pathname] ?? pathname.replace(/^\/projekt\//, '/projects/')
}
