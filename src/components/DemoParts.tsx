import type { ComponentProps } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Tooltip } from './Tooltip'

/** Press feedback for a demo trigger: a quick spring down to 0.97, no overshoot. */
const press = { scale: 0.97 }
const pressSpring = { type: 'spring', duration: 0.2, bounce: 0 } as const

/** The fully rounded trigger every demo uses. */
export function DemoButton(props: ComponentProps<typeof motion.button>) {
  return (
    <motion.button
      type="button"
      className="demo__button"
      whileTap={press}
      transition={pressSpring}
      {...props}
    />
  )
}

/** A small badge under each version: a cue for which one is better, not a headline. */
export function Verdict({ verdict }: { verdict: 'better' | 'worse' }) {
  const label = verdict === 'better' ? 'Better' : 'Worse'
  return (
    <Tooltip label={label}>
      <span className={`verdict verdict--${verdict}`} role="img" aria-label={label}>
        {verdict === 'better' ? (
          <Check size={10} strokeWidth={3} />
        ) : (
          <X size={10} strokeWidth={2.5} />
        )}
      </span>
    </Tooltip>
  )
}
