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
      'Currently the menu and its submenus to fade in and out, so moving between submenus feels slow and the fades overlap. In my version the menu opens and closes faster, and submenus switch instantly as you hover.',
    media: { kind: 'demo', demo: 'menus' },
  },
  {
    id: 'tooltips',
    index: '03',
    title: 'Toolbar tooltips',
    context:
      'Currently every tooltip has a delay and then scales in, each time a new icon is hovered, so moving along the toolbar feels slow. In my version only the first tooltip has a delay, to avoid opening by accident. After that, it stays open and slides to each icon you hover.',
    media: { kind: 'demo', demo: 'tooltips' },
  },
]

export type MiscItem = { label: string; note: string }

export const misc: MiscItem[] = [
  { label: 'Button press', note: 'scale(0.96) on press' },
  { label: 'Toggle', note: 'spring, no overshoot' },
  { label: 'Tooltip', note: 'open delay, no flicker' },
  { label: 'Checkbox', note: 'path draw on tick' },
]