import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { iconMotion, spring } from './iconSwap'
import { Tooltip } from './Tooltip'

const HOLD_MS = 1600

/** Copies its value to the clipboard and confirms by swapping the icon. */
export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
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