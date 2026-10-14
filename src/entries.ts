export type Media =
  | { kind: 'video'; label: string }
  /** A live, working demo rendered by its own component. */
  | { kind: 'demo'; demo: 'toasts' | 'menus' | 'tooltips' }
  | { kind: 'compare'; before: string; after: string }

export type Entry = {
  id: string
  index: string
  title: string
  /** One to three lines. */
  context: string
  code?: string
  codeCaption?: string
  media: Media
}

export const entries: Entry[] = [
  {
    id: 'toasts',
    index: '01',
    title: 'Stacked toasts',
    context:
      'Currently if a new toast is rendered, the others jump instantly up to make room, so it is hard to tell which one is new. In my version they share a single stack that moves as a unit. A new toast enters at the bottom and pushes the others up.',
    media: { kind: 'demo', demo: 'toasts' },
  },
  {
    id: 'menus',
    index: '02',
    title: 'Pop-up menus',
    context:
      'Currently the menu and every submenu fade in, then fade and shrink on the way out, all over 300ms, so moving between submenus leaves a trail of overlapping fades. In my version the menu opens in 150ms, closes with a quick 100ms fade, and submenus swap instantly.',
    media: { kind: 'demo', demo: 'menus' },
  },
  {
    id: 'hold-to-delete',
    index: '03',
    title: 'Hold to delete',
    context:
      'A destructive action sat behind a single click, one slip away from losing the item. It now needs a hold: the control fills over 800ms with a ring that tracks progress, and releasing early cancels without a trace.',
    media: {
      kind: 'video',
      label: 'Hold to delete — 800ms fill, early release cancels',
    },
  },
]

export type MiscItem = { label: string; note: string }

export const misc: MiscItem[] = [
  { label: 'Button press', note: 'scale(0.96) on press' },
  { label: 'Toggle', note: 'spring, no overshoot' },
  { label: 'Tooltip', note: 'open delay, no flicker' },
  { label: 'Checkbox', note: 'path draw on tick' },
]