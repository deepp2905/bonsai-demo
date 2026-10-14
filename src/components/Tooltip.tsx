import { useEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent, ReactNode } from 'react'

/** Hover dwell before the first tooltip opens. */
const OPEN_DELAY_MS = 500
/** After one closes, another opens instantly for this long, so scanning a row of icons feels immediate. */
const SKIP_DELAY_MS = 300

// Shared across every tooltip on the page: the moment the last one closed.
let lastClosedAt = 0

/**
 * A small label that names an icon control. Opens on hover (after a short
 * dwell) and on keyboard focus; closes on leave, blur or Escape.
 *
 * It is a visual label only: the trigger must already carry its accessible
 * name (an aria-label), so the tooltip is hidden from assistive tech rather
 * than announced twice.
 */
export function Tooltip({
  label,
  side = 'top',
  children,
}: {
  label: ReactNode
  side?: 'top' | 'bottom'
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Warm: opened inside the skip window, so it appears without the fade.
  const [instant, setInstant] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const isOpen = useRef(false)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') hide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function show(delay: number) {
    window.clearTimeout(timer.current)
    const warm = performance.now() - lastClosedAt < SKIP_DELAY_MS
    if (warm || delay === 0) {
      setVisible(true, warm)
      return
    }
    timer.current = window.setTimeout(() => setVisible(true, false), delay)
  }

  function hide() {
    window.clearTimeout(timer.current)
    // Stamped now, not in a state updater, so the next trigger sees it on the same pointer move.
    if (isOpen.current) lastClosedAt = performance.now()
    setVisible(false, false)
  }

  function setVisible(next: boolean, warm: boolean) {
    isOpen.current = next
    setInstant(warm)
    setOpen(next)
  }

  function onPointerEnter(event: PointerEvent) {
    // A tap would leave it stuck open; touch gets no tooltip.
    if (event.pointerType === 'mouse') show(OPEN_DELAY_MS)
  }

  function onFocus(event: FocusEvent) {
    // Keyboard focus only, not the focus a mouse click leaves behind.
    if (event.target instanceof Element && event.target.matches(':focus-visible')) show(0)
  }

  return (
    <span
      className="tooltip-anchor"
      onPointerEnter={onPointerEnter}
      onPointerLeave={hide}
      onFocus={onFocus}
      onBlur={hide}
    >
      {children}
      <span
        className="tooltip"
        data-side={side}
        data-open={open || undefined}
        data-instant={instant || undefined}
        aria-hidden="true"
      >
        {label}
      </span>
    </span>
  )
}
