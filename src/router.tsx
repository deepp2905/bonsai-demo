import { useEffect, useState } from 'react'

function normalize(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

/** Subscribe to the browser's location. */
export function usePathname() {
  const [pathname, setPathname] = useState(() => normalize(window.location.pathname))

  useEffect(() => {
    const sync = () => setPathname(normalize(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return pathname
}

/** Push a new entry onto the history stack and re-render. */
export function navigate(to: string) {
  const next = normalize(to)
  if (normalize(window.location.pathname) === next) return

  window.history.pushState(null, '', next)
  // pushState does not emit popstate, so the subscription needs a nudge.
  window.dispatchEvent(new PopStateEvent('popstate'))
}