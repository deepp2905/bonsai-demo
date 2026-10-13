import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { navigate } from '../router'

/** An anchor that routes on the client instead of reloading the document. */
export function Link({
  to,
  children,
  ...rest
}: {
  to: string
  children: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle modified clicks and non-primary buttons.
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (event.button !== 0) return

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}