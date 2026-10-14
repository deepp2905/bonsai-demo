import { Bold, Image, Italic, Link2, Smile } from 'lucide-react'
import { Verdict } from './DemoParts'
import { Tooltip, TooltipGroup } from './Tooltip'

const TOOLS = [
  { label: 'Bold', icon: Bold },
  { label: 'Italic', icon: Italic },
  { label: 'Link', icon: Link2 },
  { label: 'Image', icon: Image },
  { label: 'Emoji', icon: Smile },
]

/** Before: every icon has its own tooltip, which waits and scales in on every hover. */
function BeforeToolbar() {
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting, before">
      {TOOLS.map(({ label, icon: Icon }) => (
        <Tooltip key={label} label={label} variant="scale">
          <button type="button" className="toolbar__button" aria-label={label}>
            <Icon size={16} strokeWidth={2} />
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

/**
 * After: the same tooltips, wrapped in a TooltipGroup, so they share one
 * tooltip that glides from icon to icon instead of each opening its own.
 */
function AfterToolbar() {
  return (
    <TooltipGroup className="toolbar" role="toolbar" aria-label="Formatting, after">
      {TOOLS.map(({ label, icon: Icon }) => (
        <Tooltip key={label} label={label}>
          <button type="button" className="toolbar__button" aria-label={label}>
            <Icon size={16} strokeWidth={2} />
          </button>
        </Tooltip>
      ))}
    </TooltipGroup>
  )
}

/** The before-and-after pair for the toolbar tooltips entry. */
export function TooltipCompare() {
  return (
    <figure className="slot">
      <div className="slot__frame demo">
        <div className="demo__trigger">
          <BeforeToolbar />
          <Verdict verdict="worse" />
        </div>
        <div className="demo__trigger">
          <AfterToolbar />
          <Verdict verdict="better" />
        </div>
      </div>
      <figcaption className="type-caption slot__caption">
        Try sweeping across the icons to see each tooltip
      </figcaption>
    </figure>
  )
}
