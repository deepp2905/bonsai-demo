export type Media =
  | { kind: 'video'; label: string }
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
      'Toasts used to arrive one at a time, each taking the same spot, so a second message replaced the first before it could be read. They now share a single stack: a new toast enters at the bottom and pushes the others up, and each one leaves on its own clock.',
    code: `.toast {
  /* Position animates, so the stack moves as a unit */
  transition:
    translate 260ms cubic-bezier(0.2, 0, 0, 1),
    opacity 200ms ease-out;
}`,
    codeCaption: 'Transitions rather than keyframes, so a mid-flight toast retargets instead of restarting.',
    media: {
      kind: 'compare',
      before: 'Each toast replaces the last',
      after: 'One stack, moving as a unit',
    },
  },
  {
    id: 'menus',
    index: '02',
    title: 'Origin-aware menus',
    context:
      'The context menu opened from the centre of the element, which made it feel like a separate panel that happened to appear nearby. It now scales out of the point you clicked, so the menu reads as coming from the thing you pressed.',
    code: `.menu {
  /* Origin follows the pointer, not the element */
  transform-origin: var(--origin-x) var(--origin-y);
  transition:
    scale 160ms cubic-bezier(0.2, 0, 0, 1),
    opacity 120ms ease-out;
}`,
    codeCaption: 'Radix exposes the pointer coordinates as transform-origin variables.',
    media: {
      kind: 'compare',
      before: 'Opens from the element centre',
      after: 'Opens from the click point',
    },
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