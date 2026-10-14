import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { DemoButton } from './DemoParts'
import { iconMotion, spring } from './iconSwap'

const HOLD_MS = 1600

/**
 * Copies a build prompt for a section and confirms in place: the icon swaps
 * to a tick and the label to "Copied", then both swap back.
 */
export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // Clipboard unavailable or denied: say nothing rather than claim a copy.
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), HOLD_MS)
  }

  return (
    // The demo trigger's press feedback, in a quieter pill.
    <DemoButton className="copy-prompt" onClick={handleCopy}>
      <span className="copy-prompt__icon" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'copied' : 'copy'}
            className="copy__icon"
            {...iconMotion}
            transition={spring}
          >
            {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {/* Both labels share one cell and only one is visible, so the pill keeps
          the width of the longer label and never resizes when it swaps. */}
      <span className="copy-prompt__label" aria-live="polite">
        <span aria-hidden={copied || undefined} data-hidden={copied || undefined}>
          Copy prompt
        </span>
        <span aria-hidden={!copied || undefined} data-hidden={!copied || undefined}>
          Copied
        </span>
      </span>
    </DemoButton>
  )
}
