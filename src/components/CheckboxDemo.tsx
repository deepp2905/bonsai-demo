import { useState } from 'react'
import { motion } from 'motion/react'

/**
 * A checkbox whose tick draws itself in. Checking draws the path over 200ms,
 * ease-out; unchecking fades it out in 100ms, then resets the path out of sight.
 */
export function CheckboxDemo() {
  const [checked, setChecked] = useState(false)

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="check"
      onClick={() => setChecked((value) => !value)}
    >
      <span className="check__box">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <motion.path
            d="M2.5 6.25 5 8.75l4.5-5.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={checked ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={
              checked
                ? { pathLength: { duration: 0.2, ease: 'easeOut' }, opacity: { duration: 0 } }
                : { opacity: { duration: 0.1, ease: 'easeOut' }, pathLength: { duration: 0, delay: 0.1 } }
            }
          />
        </svg>
      </span>
      Mark as done
    </button>
  )
}
