import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, FocusEvent, HTMLAttributes, PointerEvent, ReactNode } from 'react'

/** Hover dwell before the first tooltip opens. */
const OPEN_DELAY_MS = 500
/** Scale variant: the dwell before every tooltip, with no warm window to skip it. */
const SCALE_DELAY_MS = 300
/** After one closes, another opens instantly for this long, so scanning a row of icons feels immediate. */
const SKIP_DELAY_MS = 300

// Shared across every tooltip and tooltip group on the page: the moment the
// last one closed. Anything opening within SKIP_DELAY_MS of it skips the dwell.
let lastClosedAt = 0

/** What a Tooltip inside a TooltipGroup hands to the group instead of showing its own label. */
type GroupApi = {
  show: (id: string, anchor: HTMLElement, label: ReactNode, delay: number, at: number) => void
  relabel: (id: string, label: ReactNode) => void
}

const GroupContext = createContext<GroupApi | null>(null)

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
  variant = 'default',
  children,
}: {
  label: ReactNode
  side?: 'top' | 'bottom'
  /**
   * scale: the naive treatment, kept for comparison. No warm window: every
   * tooltip waits 300ms and scales in over 160ms, every time.
   */
  variant?: 'default' | 'scale'
  children: ReactNode
}) {
  const group = useContext(GroupContext)
  const id = useId()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  // Warm: opened inside the skip window, so it appears without the fade.
  const [instant, setInstant] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const isOpen = useRef(false)
  // Fixed for the tooltip's life; a ref keeps hide() free of props.
  const sharesWarmth = useRef(variant === 'default')

  // In a group, a label that changes while showing (Copy to Copied) updates in place.
  useEffect(() => {
    group?.relabel(id, label)
  }, [group, id, label])

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
    if (variant === 'scale') {
      // Every hover waits the same dwell; keyboard focus (delay 0) opens at once.
      if (delay === 0) setVisible(true, false)
      else timer.current = window.setTimeout(() => setVisible(true, false), SCALE_DELAY_MS)
      return
    }
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
    if (isOpen.current && sharesWarmth.current) lastClosedAt = performance.now()
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

  if (group) {
    // Inside a group: no label of its own; the group shows one shared tooltip.
    return (
      <span
        ref={anchorRef}
        className="tooltip-anchor"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' && anchorRef.current)
            group.show(id, anchorRef.current, label, OPEN_DELAY_MS, event.timeStamp)
        }}
        onFocus={(event) => {
          if (anchorRef.current && event.target instanceof Element && event.target.matches(':focus-visible'))
            group.show(id, anchorRef.current, label, 0, event.timeStamp)
        }}
      >
        {children}
      </span>
    )
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
        data-variant={variant}
        data-open={open || undefined}
        data-instant={instant || undefined}
        aria-hidden="true"
      >
        {label}
      </span>
    </span>
  )
}

/**
 * Opt-in group mode for a row of adjacent triggers (toolbars, icon rows, tab
 * bars). Every Tooltip inside shares one tooltip: the first opens with the
 * usual dwell and entry (or at once inside the warm window), then it stays
 * open, gliding along the row to each trigger and swapping its text. Leaving
 * the group, blur or Escape closes it. Renders the row's own element, which
 * becomes the tooltip's positioning context.
 */
export function TooltipGroup({
  side = 'top',
  className,
  children,
  ...rest
}: { side?: 'top' | 'bottom'; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false)
  const [instant, setInstant] = useState(false)
  const [label, setLabel] = useState<ReactNode>(null)
  const [place, setPlace] = useState({ x: 0, top: 0, bottom: 0 })
  const timer = useRef<number | undefined>(undefined)
  const isOpen = useRef(false)
  const activeId = useRef<string | null>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  /** Whether it was open as of the last move, so only a move while open glides. */
  const wasOpen = useRef(false)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /*
   * CSS glides the tooltip between triggers (left). While closed, or as it
   * opens, it is placed without animating, so it never slides in from the
   * last trigger it showed.
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
  }, [place, open])

  function setVisible(next: boolean, warm: boolean) {
    isOpen.current = next
    setInstant(warm)
    setOpen(next)
  }

  /** Point the shared tooltip at a trigger, measured within the group. */
  function point(id: string, anchor: HTMLElement, text: ReactNode) {
    activeId.current = id
    setLabel(text)
    setPlace({
      x: anchor.offsetLeft + anchor.offsetWidth / 2,
      top: anchor.offsetTop,
      bottom: anchor.offsetTop + anchor.offsetHeight,
    })
  }

  /** `at` is the triggering event's timeStamp, on the same clock as performance.now(). */
  function hide(at: number) {
    window.clearTimeout(timer.current)
    if (isOpen.current) lastClosedAt = at
    // The text stays, so it fades out still naming the last trigger.
    setVisible(false, false)
  }

  const api: GroupApi = {
    show(id, anchor, text, delay, at) {
      window.clearTimeout(timer.current)
      if (isOpen.current) {
        point(id, anchor, text)
        return
      }
      const warm = at - lastClosedAt < SKIP_DELAY_MS
      if (warm || delay === 0) {
        point(id, anchor, text)
        setVisible(true, warm)
        return
      }
      timer.current = window.setTimeout(() => {
        point(id, anchor, text)
        setVisible(true, false)
      }, delay)
    },
    relabel(id, text) {
      if (activeId.current === id) setLabel(text)
    },
  }

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') hide(event.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const style = {
    left: place.x,
    '--anchor-top': `${place.top}px`,
    '--anchor-bottom': `${place.bottom}px`,
  } as CSSProperties

  return (
    <GroupContext.Provider value={api}>
      <div
        {...rest}
        className={`tooltip-group${className ? ` ${className}` : ''}`}
        onPointerLeave={(event) => {
          rest.onPointerLeave?.(event)
          if (event.pointerType === 'mouse') hide(event.timeStamp)
        }}
        onBlur={(event) => {
          rest.onBlur?.(event)
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hide(event.timeStamp)
        }}
      >
        {children}
        <span
          ref={tipRef}
          className="tooltip tooltip--shared"
          data-side={side}
          data-open={open || undefined}
          data-instant={instant || undefined}
          style={style}
          aria-hidden="true"
        >
          {label}
        </span>
      </div>
    </GroupContext.Provider>
  )
}
