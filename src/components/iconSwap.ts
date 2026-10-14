/** Contextual icon swap, at the values the course fixes for it. */
export const iconMotion = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
}

// The course fixes 0.3 for this swap; 0.2 keeps it snappy, with no bounce.
export const spring = { type: 'spring', duration: 0.2, bounce: 0 } as const
