import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { Tooltip } from './Tooltip'

/** Contextual icon swap, at the values the course fixes for it. */
const iconMotion = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
}

// The course fixes 0.3 for this swap; 0.2 keeps it snappy, with no bounce.
const spring = { type: 'spring', duration: 0.2, bounce: 0 } as const

const HOLD_MS = 1600

/** Copies its value to the clipboard and confirms by swapping the icon. */
export function CopyButton({ value, label = 'Copy code' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  // Once the button has been used, it stays revealed for good: through the
  // swap and afterwards, wherever the pointer goes.
  const [used, setUsed] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard permission denied or unavailable: leave the icon alone
      // rather than claiming a copy that did not happen.
      return
    }

    setCopied(true)
    setUsed(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), HOLD_MS)
  }

  return (
    <Tooltip label={copied ? 'Copied' : label}>
      <button
        type="button"
        className="copy"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : label}
        data-used={used || undefined}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'copied' : 'copy'}
            className="copy__icon"
            {...iconMotion}
            transition={spring}
          >
            {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={2} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  )
}