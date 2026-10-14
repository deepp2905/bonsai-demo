import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { DemoButton, Verdict } from './DemoParts'

type Version = 'before' | 'after'

type Item = {
  label: string
  /** Opens a submenu, another pop-up beside this one. */
  items?: Item[]
  danger?: boolean
  separatorBefore?: boolean
}

const ITEMS: Item[] = [
  { label: 'Rename' },
  { label: 'Duplicate' },
  {
    label: 'Move to',
    items: [{ label: 'Inbox' }, { label: 'Projects' }, { label: 'Archive' }],
  },
  {
    label: 'Share',
    items: [{ label: 'Copy link' }, { label: 'Invite people' }, { label: 'Publish to web' }],
  },
  { label: 'Delete', danger: true, separatorBefore: true },
]

/** Both: how long the menu stays open after the pointer leaves it, so it can cross the gap from the trigger. */
const MENU_CLOSE_MS = 150

/**
 * After only: how long an open submenu holds while the pointer crosses a
 * sibling on its way into it. Only then: otherwise siblings switch at once.
 */
const SUBMENU_GRACE_MS = 150

type Point = { x: number; y: number }

/** Whether p lies inside the triangle a, b, c. */
function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const side = (u: Point, v: Point, w: Point) => (u.x - w.x) * (v.y - w.y) - (v.x - w.x) * (u.y - w.y)
  const d1 = side(p, a, b)
  const d2 = side(p, b, c)
  const d3 = side(p, c, a)
  const negative = d1 < 0 || d2 < 0 || d3 < 0
  const positive = d1 > 0 || d2 > 0 || d3 > 0
  return !(negative && positive)
}

/** A strong ease-out: quick to respond, gentle to settle. */
const easeOut = [0.23, 1, 0.32, 1] as const

/**
 * Before: the current treatment. Fades in; fades and scales down on the way
 * out; 300ms both ways, for the menu and every submenu.
 *
 * After: 150ms in, scaling up a touch; 100ms out, shrinking back a touch, so
 * it gets out of the way. A submenu that replaces a sibling (`instant`) swaps
 * with no animation at all.
 *
 * Both versions scale from where each pop-up opens: the menu from its trigger,
 * a submenu from the item that opened it.
 */
const MOTION: Record<Version, Variants> = {
  before: {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    gone: { opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: 'easeInOut' } },
  },
  after: {
    hidden: { opacity: 0, scale: 0.97 },
    shown: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: easeOut } },
    gone: (instant: boolean) => ({
      opacity: 0,
      scale: 0.97,
      transition: { duration: instant ? 0 : 0.1, ease: 'easeOut' },
    }),
  },
}

function MenuList({
  items,
  version,
  sub = false,
  instant = false,
  autoFocus,
  onSelect,
  onBack,
}: {
  items: Item[]
  version: Version
  sub?: boolean
  /** After: replaced a sibling submenu, so it appears without an entry animation. */
  instant?: boolean
  /** Opened from the keyboard: focus the first item. */
  autoFocus: boolean
  /** A leaf was chosen: close the whole menu. */
  onSelect: () => void
  /** Leave this list from the keyboard: Escape, or ArrowLeft in a submenu. */
  onBack: () => void
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  /** After: the last change swapped one submenu for another, so neither animates. */
  const [swapped, setSwapped] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const grace = useRef<number | undefined>(undefined)
  /** After: the sibling waiting on the grace timer, if any. */
  const pending = useRef<number | null | undefined>(undefined)
  /** The last few pointer positions over this list, oldest first. */
  const trail = useRef<Point[]>([])
  /** The open submenu was opened from the keyboard, so focus moves into it. */
  const [focusChild, setFocusChild] = useState(false)

  useEffect(() => () => window.clearTimeout(grace.current), [])

  useEffect(() => {
    if (autoFocus) listRef.current?.querySelector<HTMLButtonElement>(':scope > li > button')?.focus()
  }, [autoFocus])

  /**
   * Where it sits, written straight to the element (data-place) because it is
   * measured, not state. right: the default. left: no room on the right.
   * overlap (submenus only): no room either side, as on a phone, so it
   * cascades down and right over its parent instead. CSS sets the matching
   * transform origin for each.
   */
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    // Measure from the default spot, even if an earlier run already moved it.
    list.dataset.place = 'right'
    const frame = list.closest('.slot__frame')?.getBoundingClientRect()
    const minX = (frame?.left ?? 0) + 4
    const maxX = (frame?.right ?? window.innerWidth) - 4
    // offsetWidth, not the rect: the rect is still scaled by the entry animation.
    const width = list.offsetWidth
    const left = list.getBoundingClientRect().left
    let place = 'right'
    if (left + width > maxX) {
      place = 'left'
      if (sub) {
        // Flipped, it sits the same gap to the left of its parent list.
        const parent = list.parentElement?.closest('.menu')?.getBoundingClientRect()
        const gap = parent ? left - parent.right : 0
        const flippedLeft = (parent?.left ?? left) - gap - width
        if (flippedLeft < minX) place = 'overlap'
      }
    }
    list.dataset.place = place
  }, [sub])

  function show(index: number | null) {
    cancelPending()
    setSwapped(version === 'after' && openIndex !== null && index !== null)
    setOpenIndex(index)
  }

  function cancelPending() {
    window.clearTimeout(grace.current)
    pending.current = undefined
  }

  /** The submenu currently open from this list. */
  function openSub() {
    return listRef.current?.querySelector<HTMLElement>(
      ':scope > li:has(> .menu__item[data-open]) > .menu--sub',
    )
  }

  /**
   * After: is the pointer heading into the open submenu? True while it is
   * inside the triangle from where it was a moment ago to the submenu's near
   * edge, the path a diagonal move toward it takes.
   */
  function aimingAtSub(at: Point) {
    const sub = openSub()
    const from = trail.current[0]
    if (!sub || !from || sub.dataset.place === 'overlap') return false
    const rect = sub.getBoundingClientRect()
    const edge = sub.dataset.place === 'left' ? rect.right : rect.left
    return inTriangle(at, from, { x: edge, y: rect.top }, { x: edge, y: rect.bottom })
  }

  function onHover(index: number, at: Point) {
    setFocusChild(false)
    const target = items[index].items ? index : null
    if (target === openIndex) {
      cancelPending()
      return
    }
    // After: switch at once, unless the pointer is only crossing this item on
    // its way into the open submenu. Then hold it for a moment.
    if (version === 'after' && openIndex !== null && aimingAtSub(at)) {
      cancelPending()
      pending.current = target
      grace.current = window.setTimeout(() => show(target), SUBMENU_GRACE_MS)
      return
    }
    show(target)
  }

  function onPointerMove(event: ReactPointerEvent) {
    if (event.pointerType !== 'mouse') return
    const at = { x: event.clientX, y: event.clientY }
    trail.current = [...trail.current.slice(-3), at]
    if (pending.current === undefined) return
    // Made it into the submenu: keep it. Stopped heading there: switch now.
    if (openSub()?.contains(event.target as Node)) cancelPending()
    else if (!aimingAtSub(at)) show(pending.current)
  }

  function onClick(event: MouseEvent, index: number) {
    if (!items[index].items) {
      onSelect()
      return
    }
    // Enter or Space opens and moves focus in; a pointer click toggles.
    if (event.detail === 0) {
      setFocusChild(true)
      show(index)
    } else {
      show(openIndex === index ? null : index)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>(':scope > li > button') ?? [])]
    const at = buttons.indexOf(event.currentTarget)
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        buttons[(at + step + buttons.length) % buttons.length]?.focus()
        break
      }
      case 'ArrowRight':
        if (items[index].items) {
          event.preventDefault()
          setFocusChild(true)
          show(index)
        }
        break
      case 'ArrowLeft':
        if (sub) {
          event.preventDefault()
          onBack()
        }
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        onBack()
        break
    }
  }

  return (
    <motion.ul
      ref={listRef}
      role="menu"
      className={`menu${sub ? ' menu--sub' : ''}`}
      variants={MOTION[version]}
      custom={instant}
      initial={instant ? false : 'hidden'}
      animate="shown"
      exit="gone"
      onPointerMove={onPointerMove}
    >
      {items.map((item, index) => (
        <li key={item.label} className="menu__entry">
          {item.separatorBefore ? <div role="separator" className="menu__separator" /> : null}
          <button
            type="button"
            role="menuitem"
            className={`menu__item${item.danger ? ' menu__item--danger' : ''}`}
            aria-haspopup={item.items ? 'menu' : undefined}
            aria-expanded={item.items ? openIndex === index : undefined}
            data-open={openIndex === index || undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') onHover(index, { x: event.clientX, y: event.clientY })
            }}
            onClick={(event) => onClick(event, index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span>{item.label}</span>
            {item.items ? <ChevronRight size={14} strokeWidth={2} aria-hidden="true" /> : null}
          </button>

          {item.items ? (
            <AnimatePresence custom={swapped}>
              {openIndex === index ? (
                <MenuList
                  key="sub"
                  sub
                  items={item.items}
                  version={version}
                  instant={swapped}
                  autoFocus={focusChild}
                  onSelect={onSelect}
                  onBack={() => {
                    show(null)
                    listRef.current
                      ?.querySelectorAll<HTMLButtonElement>(':scope > li > button')
                      [index]?.focus()
                  }}
                />
              ) : null}
            </AnimatePresence>
          ) : null}
        </li>
      ))}
    </motion.ul>
  )
}

/** One trigger, its pop-up menu, and the verdict badge below. */
function MenuDemo({ version }: { version: Version }) {
  const [open, setOpen] = useState(false)
  const [keyboard, setKeyboard] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const lastPointer = useRef<string>('mouse')

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  /** A mouse opens it by hovering the trigger; no press needed. */
  function onPointerEnter(event: ReactPointerEvent) {
    if (event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    setKeyboard(false)
    setOpen(true)
  }

  /**
   * Leaving the trigger and every open list closes it, after a moment, so the
   * pointer can cross the gap between the trigger and the menu.
   */
  function onPointerLeave(event: ReactPointerEvent) {
    if (event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), MENU_CLOSE_MS)
  }

  return (
    <div className="demo__trigger">
      <div
        className="menu-root"
        ref={rootRef}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
        onPointerLeave={onPointerLeave}
      >
        <DemoButton
          ref={triggerRef}
          aria-haspopup="menu"
          aria-expanded={open}
          // It opens on hover, so a press does nothing for a mouse: no press feedback.
          whileTap={undefined}
          onPointerEnter={onPointerEnter}
          onPointerDown={(event) => {
            lastPointer.current = event.pointerType
          }}
          onClick={(event) => {
            // Keyboard and touch have no hover, so they still open it by pressing.
            const keyboardPress = event.detail === 0
            if (!keyboardPress && lastPointer.current === 'mouse') return
            setKeyboard(keyboardPress)
            setOpen((value) => !value)
          }}
        >
          Open menu
        </DemoButton>

        <AnimatePresence>
          {open ? (
            <MenuList
              key="menu"
              items={ITEMS}
              version={version}
              autoFocus={keyboard}
              onSelect={() => setOpen(false)}
              onBack={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <Verdict verdict={version === 'after' ? 'better' : 'worse'} />
    </div>
  )
}

/** The before-and-after pair for the pop-up menu entry. */
export function MenuCompare() {
  return (
    <figure className="slot">
      <div className="slot__frame demo">
        <MenuDemo version="before" />
        <MenuDemo version="after" />
      </div>
      <figcaption className="type-caption slot__caption">
        Quicker in, quicker out, and submenus that swap without fading
      </figcaption>
    </figure>
  )
}
