/** A live, working demo rendered by its own component. */
export type Media = { kind: 'demo'; demo: 'toasts' | 'menus' | 'tooltips' }

export type Entry = {
  id: string
  index: string
  title: string
  /** One to three lines. */
  context: string
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
      'Currently the menu and its submenus fade in and out slowly, so moving between submenus feels slow and the fades overlap. In my version the menu opens and closes faster, and submenus switch instantly as you hover.',
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

export type MiscItem = {
  label: string
  note?: string
  /** A live demo in the frame; without one, the frame is a labelled placeholder. */
  demo?: 'copy' | 'check'
}

export const misc: MiscItem[] = [
  { label: 'Copy button', note: 'Icon swaps with a quick blur', demo: 'copy' },
  { label: 'Checkbox', note: 'Tick draws itself in as you check it', demo: 'check' },
  { label: '?' , note:'Coming soon'},
]
