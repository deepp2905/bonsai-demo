import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'
import { Bold, Image, Italic, Link2, Smile } from 'lucide-react'
import { Verdict } from './DemoParts'
import { OPEN_DELAY_MS, SKIP_DELAY_MS, Tooltip } from './Tooltip'

const TOOLS = [
  { label: 'Bold', icon: Bold },
  { label: 'Italic', icon: Italic },
  { label: 'Link', icon: Link2 },
  { label: 'Image', icon: Image },
  { label: 'Emoji', icon: Smile },
]

/** Before: every icon has its own tooltip, which waits and scales in on every hover. */
function BeforeToolbar() {
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting, before">
      {TOOLS.map(({ label, icon: Icon }) => (
        <Tooltip key={label} label={label} variant="scale">
          <button type="button" className="toolbar__button" aria-label={label}>
            <Icon size={16} strokeWidth={2} />
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

/**
 * After: one tooltip for the whole toolbar. The first one waits a short dwell
 * and fades in; from then on it stays open, and moving to another icon glides
 * it there over 150ms and swaps the text, its width simply fitting the new
 * label. It closes when the pointer leaves the toolbar, and reopens instantly
 * if it comes back straight away.
 */
function AfterToolbar() {
  const [open, setOpen] = useState(false)
  // Reopened inside the skip window, so it appears without the fade.
  const [instant, setInstant] = useState(false)
  const [active, setActive] = useState(0)
  const [x, setX] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  const isOpen = useRef(false)
  const lastClosedAt = useRef(0)
  const tipRef = useRef<HTMLSpanElement>(null)
  /** Whether it was open as of the last move, so only a move while open glides. */
  const wasOpen = useRef(false)

  /*
   * CSS glides the tooltip between icons (left). While closed, or as it opens,
   * it is placed without animating, so it never slides in from the last icon.
   */
  useLayoutEffect(() => {
    const tip = tipRef.current
    if (!tip) return
    if (!wasOpen.current) {
      tip.style.transitionProperty = 'opacity, scale, translate'
      void tip.offsetWidth
      tip.style.transitionProperty = ''
    }
    wasOpen.current = open
  }, [active, open])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /** Point the tooltip at an icon: its text, and the icon's centre. */
  function point(index: number, button: HTMLElement) {
    setActive(index)
    setX(button.offsetLeft + button.offsetWidth / 2)
  }

  function setVisible(next: boolean, warm: boolean) {
    isOpen.current = next
    setInstant(warm)
    setOpen(next)
  }

  /** `at` is the triggering event's timeStamp, on the same clock as performance.now(). */
  function show(index: number, button: HTMLElement, delay: number, at: number) {
    window.clearTimeout(timer.current)
    if (isOpen.current) {
      point(index, button)
      return
    }
    const warm = at - lastClosedAt.current < SKIP_DELAY_MS
    if (warm || delay === 0) {
      point(index, button)
      setVisible(true, warm)
      return
    }
    timer.current = window.setTimeout(() => {
      point(index, button)
      setVisible(true, false)
    }, delay)
  }

  function hide(at: number) {
    window.clearTimeout(timer.current)
    if (isOpen.current) lastClosedAt.current = at
    // The text stays as it was, so it fades out still naming the last icon.
    setVisible(false, false)
  }

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') hide(event.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function onPointerEnter(event: PointerEvent<HTMLButtonElement>, index: number) {
    // A tap would leave it stuck open; touch gets no tooltip.
    if (event.pointerType === 'mouse') show(index, event.currentTarget, OPEN_DELAY_MS, event.timeStamp)
  }

  function onFocus(event: FocusEvent<HTMLButtonElement>, index: number) {
    // Keyboard focus only, not the focus a mouse click leaves behind.
    if (event.currentTarget.matches(':focus-visible')) show(index, event.currentTarget, 0, event.timeStamp)
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hide(event.timeStamp)
  }

  return (
    <div
      className="toolbar"
      role="toolbar"
      aria-label="Formatting, after"
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') hide(event.timeStamp)
      }}
      onBlur={onBlur}
    >
      {TOOLS.map(({ label, icon: Icon }, index) => (
        <button
          key={label}
          type="button"
          className="toolbar__button"
          aria-label={label}
          onPointerEnter={(event) => onPointerEnter(event, index)}
          onFocus={(event) => onFocus(event, index)}
        >
          <Icon size={16} strokeWidth={2} />
        </button>
      ))}
      <span
        ref={tipRef}
        className="tooltip tooltip--shared"
        data-side="top"
        data-open={open || undefined}
        data-instant={instant || undefined}
        style={{ left: x }}
        aria-hidden="true"
      >
        {TOOLS[active].label}
      </span>
    </div>
  )
}

/** The before-and-after pair for the toolbar tooltips entry. */
export function TooltipCompare() {
  return (
    <figure className="slot">
      <div className="slot__frame demo">
        <div className="demo__trigger">
          <BeforeToolbar />
          <Verdict verdict="worse" />
        </div>
        <div className="demo__trigger">
          <AfterToolbar />
          <Verdict verdict="better" />
        </div>
      </div>
      <figcaption className="type-caption slot__caption">
        Sweep across the icons to see each tooltip
      </figcaption>
    </figure>
  )
}
