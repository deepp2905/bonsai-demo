import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'

/** How long each toast lives, measured from when it arrives. Paused while the stack is hovered. */
const LIFETIME_MS = 4000
/** How many toasts can be on screen at once; a new one past this pushes the oldest out. */
const MAX_VISIBLE = 4
/** After only: how many pushed-out toasts wait off screen to come back. Past this, the oldest is dropped. */
const MAX_HIDDEN = 6
/** After only: how long a returning toast takes to drop back in. Matches the entry timing. */
const RETURN_MS = 260

/**
 * Why a toast is leaving. Each reason has its own exit in the After stack:
 * - expire:   its time ran out. It dips 32px and fades, 160ms.
 * - overflow: a new toast pushed it past the cap. It is carried up one slot
 *             with the stack, fading, on the 260ms entry timing.
 * - close:    the person pressed close or Undo. It drops 64px and fades, 200ms.
 */
type ExitKind = 'expire' | 'overflow' | 'close'

/** How long each exit runs, so the toast is removed once it has finished. Mirrors index.css. */
const AFTER_EXIT_MS: Record<ExitKind, number> = { expire: 160, overflow: 260, close: 200 }
/** Before uses one plain 200ms fade, whatever the reason. */
const BEFORE_EXIT_MS: Record<ExitKind, number> = { expire: 200, overflow: 200, close: 200 }

/** Press feedback for the trigger: a quick spring down to 0.97, no overshoot. */
const press = { scale: 0.97 }
const pressSpring = { type: 'spring', duration: 0.2, bounce: 0 } as const

/** Sample notifications: each one reports an action that can be undone. */
const MESSAGES = [
  { title: 'Tab closed', body: 'Analytics: Overview' },
  { title: 'Project archived', body: 'Q4 Brand Refresh' },
  { title: 'Invoice deleted', body: 'INV-2041 · Northwind' },
  { title: 'Moved to trash', body: 'hero-final-v3.png' },
  { title: 'Member removed', body: 'Priya Shah from Design' },
  { title: 'Task completed', body: 'Send proposal draft' },
  { title: 'Label removed', body: 'Urgent' },
  { title: 'Comment deleted', body: 'On “Homepage hero”' },
  { title: 'Client archived', body: 'Acme Studio' },
  { title: 'Reminder dismissed', body: 'Follow up with Lena' },
]

type Toast = {
  id: number
  title: string
  body: string
  /**
   * shown:   on screen, holding a slot.
   * leaving: running its exit animation, then removed (or hidden, after overflow).
   * hidden:  pushed out by overflow and waiting off screen to come back (After only).
   */
  status: 'shown' | 'leaving' | 'hidden'
  /** While leaving: the slot it held, so its exit starts from there. */
  leavingFrom?: number
  exit?: ExitKind
  /** Just came back from hidden: drops in from above instead of rising from below. */
  returning?: boolean
}

const isShown = (toast: Toast) => toast.status === 'shown'

/**
 * Keep the stack full from the queue: while there is a free slot and a hidden
 * toast waiting, the most recently pushed-out one comes back. Hidden toasts are
 * always older than shown ones, so it lands in the top slot. Then trim the queue.
 */
function refill(list: Toast[], keepHidden: boolean) {
  if (!keepHidden) return list

  let next = list
  let free = MAX_VISIBLE - next.filter(isShown).length
  while (free > 0) {
    const waiting = next.filter((toast) => toast.status === 'hidden')
    if (waiting.length === 0) break
    const back = waiting[waiting.length - 1].id
    next = next.map((toast) =>
      toast.id === back ? { ...toast, status: 'shown', returning: true } : toast,
    )
    free--
  }

  const hidden = next.filter((toast) => toast.status === 'hidden')
  if (hidden.length > MAX_HIDDEN) {
    const drop = new Set(hidden.slice(0, hidden.length - MAX_HIDDEN).map((toast) => toast.id))
    next = next.filter((toast) => !drop.has(toast.id))
  }
  return next
}

/**
 * A small toast queue. Each toast leaves on its own clock, and every exit
 * records why it happened, so the stack can animate each reason differently.
 * With `keepHidden`, toasts pushed out by overflow wait off screen and come
 * back when a slot frees up.
 */
function useToastQueue(exitMs: Record<ExitKind, number>, keepHidden: boolean) {
  const [toasts, setToasts] = useState<Toast[]>([])
  /** What the last change was, so the toasts that move use entry or exit timing. */
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter')
  const nextId = useRef(0)
  const timers = useRef(new Set<number>())
  /**
   * Each toast's expiry clock. While the stack is hovered or focused every
   * clock is paused (`timer` unset) and `remaining` holds the time left.
   * Hidden toasts keep their clocks too, so nothing stale comes back.
   */
  const clocks = useRef(new Map<number, { timer?: number; startedAt: number; remaining: number }>())
  const held = useRef(false)
  const returnsScheduled = useRef(new Set<number>())

  useEffect(() => {
    const pending = timers.current
    const running = clocks.current
    return () => {
      pending.forEach((t) => window.clearTimeout(t))
      pending.clear()
      running.forEach((clock) => window.clearTimeout(clock.timer))
      running.clear()
    }
  }, [])

  useEffect(() => {
    // Stop the clocks of toasts that are gone (removed, or dropped from the queue).
    const ids = new Set(toasts.map((toast) => toast.id))
    clocks.current.forEach((clock, id) => {
      if (!ids.has(id)) {
        window.clearTimeout(clock.timer)
        clocks.current.delete(id)
      }
    })

    // A returning toast only needs its drop-in once; clear the flag after it has run.
    toasts.forEach((toast) => {
      if (!toast.returning || returnsScheduled.current.has(toast.id)) return
      returnsScheduled.current.add(toast.id)
      later(() => {
        returnsScheduled.current.delete(toast.id)
        setToasts((list) => list.map((t) => (t.id === toast.id ? { ...t, returning: false } : t)))
      }, RETURN_MS)
    })
  })

  function later(fn: () => void, ms: number) {
    const t = window.setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }

  function remove(id: number) {
    setToasts((list) => refill(list.filter((toast) => toast.id !== id), keepHidden))
  }

  function startClock(id: number, ms: number) {
    const clock = { startedAt: performance.now(), remaining: ms, timer: undefined as number | undefined }
    if (!held.current) clock.timer = window.setTimeout(() => dismiss(id, 'expire'), ms)
    clocks.current.set(id, clock)
  }

  /** Hover or focus anywhere on the stack: freeze every clock with the time it has left. */
  function pause() {
    held.current = true
    const now = performance.now()
    clocks.current.forEach((clock) => {
      if (clock.timer === undefined) return
      window.clearTimeout(clock.timer)
      clock.remaining -= now - clock.startedAt
      clock.timer = undefined
    })
  }

  /** Pointer and focus have left the stack: run out the rest of every clock. */
  function resume() {
    held.current = false
    const now = performance.now()
    clocks.current.forEach((clock, id) => {
      if (clock.timer !== undefined) return
      clock.startedAt = now
      clock.timer = window.setTimeout(() => dismiss(id, 'expire'), Math.max(clock.remaining, 0))
    })
  }

  /** Start a toast's exit from the slot it holds. A hidden toast that expires just goes. */
  function dismiss(id: number, exit: ExitKind = 'close') {
    const clock = clocks.current.get(id)
    if (clock) window.clearTimeout(clock.timer)
    clocks.current.delete(id)

    setPhase('exit')
    setToasts((list) => {
      const target = list.find((toast) => toast.id === id)
      if (!target || target.status === 'leaving') return list
      if (target.status === 'hidden') return list.filter((toast) => toast.id !== id)

      const shown = list.filter(isShown)
      const slot = shown.length - 1 - shown.indexOf(target)
      const next = list.map((toast) =>
        toast.id === id ? { ...toast, status: 'leaving' as const, leavingFrom: slot, exit } : toast,
      )
      return refill(next, keepHidden)
    })
    later(() => remove(id), exitMs[exit])
  }

  function push() {
    // At the cap, the oldest shown toast is pushed out in the same batch as the new one arrives.
    const shown = toasts.filter(isShown)
    const pushedOut = shown.length >= MAX_VISIBLE ? shown[0].id : undefined

    setPhase('enter')
    const id = nextId.current++
    setToasts((list) => {
      let next = list
      if (pushedOut !== undefined) {
        next = next.map((toast) =>
          toast.id === pushedOut
            ? { ...toast, status: 'leaving' as const, leavingFrom: MAX_VISIBLE - 1, exit: 'overflow' as const }
            : toast,
        )
      }
      return [...next, { id, ...MESSAGES[id % MESSAGES.length], status: 'shown' as const }]
    })
    startClock(id, LIFETIME_MS)

    if (pushedOut !== undefined) {
      // Once its exit has run: wait off screen (After), or go for good (Before).
      later(() => {
        if (!keepHidden) {
          remove(pushedOut)
          return
        }
        setToasts((list) =>
          refill(
            list.map((toast) =>
              toast.id === pushedOut && toast.status === 'leaving'
                ? { ...toast, status: 'hidden' as const, leavingFrom: undefined, exit: undefined }
                : toast,
            ),
            keepHidden,
          ),
        )
      }, exitMs.overflow)
    }
  }

  /** Drop every toast and pending timer, e.g. when the other demo takes over the corner. */
  function clear() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
    clocks.current.forEach((clock) => window.clearTimeout(clock.timer))
    clocks.current.clear()
    returnsScheduled.current.clear()
    held.current = false
    setToasts([])
  }

  return { toasts, phase, push, dismiss, pause, resume, clear }
}

/** Hover and keyboard focus anywhere on the stack hold every toast on screen. */
type HoldHandlers = { pause: () => void; resume: () => void }

function holdProps({ pause, resume }: HoldHandlers) {
  return {
    onPointerEnter: pause,
    onPointerLeave: resume,
    onFocus: pause,
    onBlur: resume,
  }
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="toast__close" onClick={onClick} aria-label="Dismiss">
      <X size={14} strokeWidth={2} />
    </button>
  )
}

/**
 * Before: a plain card in normal flow. It appears instantly; on exit it fades
 * out in place, then is removed and the others jump to close the gap.
 */
function StaticStack({
  toasts,
  onDismiss,
  hold,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
  hold: HoldHandlers
}) {
  return (
    <ol className="toast-stack toast-stack--static">
      {toasts.map((toast) => (
        <li
          key={toast.id}
          className={`toast toast--plain${toast.status === 'leaving' ? ' toast--fading' : ''}`}
          aria-hidden={toast.status === 'leaving' || undefined}
          {...holdProps(hold)}
        >
          <div className="toast__copy">
            <p className="toast__title">{toast.title}</p>
            <p className="toast__body">{toast.body}</p>
          </div>
          <CloseButton onClick={() => onDismiss(toast.id)} />
        </li>
      ))}
    </ol>
  )
}

/**
 * After: one stack whose position transitions, so a new toast pushes the others
 * up as a unit. Each toast offers Undo as its primary action. Toasts pushed out
 * by overflow are not rendered while hidden, and drop back in when a slot frees.
 */
function AnimatedStack({
  toasts,
  phase,
  onDismiss,
  onUndo,
  hold,
}: {
  toasts: Toast[]
  phase: 'enter' | 'exit'
  onDismiss: (id: number) => void
  onUndo: (id: number) => void
  hold: HoldHandlers
}) {
  const shown = toasts.filter(isShown)

  return (
    <ol className="toast-stack toast-stack--animated" data-phase={phase}>
      {toasts.map((toast) => {
        if (toast.status === 'hidden') return null

        const leaving = toast.status === 'leaving'
        // Slot 0 is the bottom. Newest sits at the bottom; older ones climb.
        const slot = toast.leavingFrom ?? shown.length - 1 - shown.indexOf(toast)
        const className = [
          'toast toast--rich toast--animated',
          leaving && `toast--leaving toast--exit-${toast.exit}`,
          toast.returning && 'toast--returning',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <li
            key={toast.id}
            className={className}
            style={{ '--slot': slot } as CSSProperties}
            aria-hidden={leaving || undefined}
            inert={leaving || undefined}
            {...holdProps(hold)}
          >
            <div className="toast__copy">
              <p className="toast__title">{toast.title}</p>
              <p className="toast__body">{toast.body}</p>
            </div>
            <button type="button" className="toast__undo" onClick={() => onUndo(toast.id)}>
              Undo
            </button>
            <CloseButton onClick={() => onDismiss(toast.id)} />
          </li>
        )
      })}
    </ol>
  )
}

/** One demo frame: the trigger, and a small verdict badge below it. */
function DemoFrame({
  onRender,
  verdict,
  caption,
}: {
  onRender: () => void
  verdict: 'better' | 'worse'
  caption: string
}) {
  return (
    <figure className="slot slot--half">
      <div className="slot__frame demo">
        <motion.button
          type="button"
          className="demo__button"
          onClick={onRender}
          whileTap={press}
          transition={pressSpring}
        >
          Render Toast
        </motion.button>
        <span
          className={`verdict verdict--${verdict}`}
          role="img"
          aria-label={verdict === 'better' ? 'Better' : 'Worse'}
        >
          {verdict === 'better' ? (
            <Check size={10} strokeWidth={3} />
          ) : (
            <X size={10} strokeWidth={2.5} />
          )}
        </span>
      </div>
      <figcaption className="type-caption slot__caption">{caption}</figcaption>
    </figure>
  )
}

/**
 * The before-and-after pair for the stacked toasts entry.
 * Toasts render in the page's own viewport, bottom right. The two versions
 * share that corner, so triggering one clears the other's toasts.
 */
export function ToastCompare() {
  const before = useToastQueue(BEFORE_EXIT_MS, false)
  const after = useToastQueue(AFTER_EXIT_MS, true)
  const [mode, setMode] = useState<'before' | 'after'>('after')
  const resumeBefore = before.resume
  const resumeAfter = after.resume

  // A toast removed from under the pointer never fires pointerleave, which would
  // leave the stack frozen. Any pointer movement off the toasts releases the hold,
  // unless keyboard focus is still inside the stack. Resuming is a no-op when
  // nothing is held, so both queues can be released.
  useEffect(() => {
    function onMove(event: PointerEvent) {
      const target = event.target as Element | null
      if (target?.closest('.toast:not(.toast--leaving, .toast--fading)')) return
      if (document.activeElement?.closest('.toast-viewport')) return
      resumeBefore()
      resumeAfter()
    }
    document.addEventListener('pointermove', onMove)
    return () => document.removeEventListener('pointermove', onMove)
  }, [resumeBefore, resumeAfter])

  function renderBefore() {
    if (mode !== 'before') after.clear()
    setMode('before')
    before.push()
  }

  function renderAfter() {
    if (mode !== 'after') before.clear()
    setMode('after')
    after.push()
  }

  /**
   * Undo reverses the action and the toast simply leaves. In a real product the
   * reversed action is visible on the page, so no confirmation toast is needed.
   */
  function undo(id: number) {
    after.dismiss(id)
  }

  return (
    <>
      <div className="compare">
        <DemoFrame
          onRender={renderBefore}
          verdict="worse"
          caption="Before — Stacked, but every toast jumps into place"
        />
        <DemoFrame
          onRender={renderAfter}
          verdict="better"
          caption="After — One stack, moving as a unit, with undo"
        />
      </div>

      {createPortal(
        <section className="toast-viewport" aria-label="Notifications" aria-live="polite">
          {mode === 'before' ? (
            <StaticStack toasts={before.toasts} onDismiss={before.dismiss} hold={before} />
          ) : (
            <AnimatedStack
              toasts={after.toasts}
              phase={after.phase}
              onDismiss={after.dismiss}
              onUndo={undo}
              hold={after}
            />
          )}
        </section>,
        document.body,
      )}
    </>
  )
}
