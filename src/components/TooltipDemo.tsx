import { Bold, Image, Italic, Link2, Smile } from 'lucide-react'
import { Verdict } from './DemoParts'
import { Tooltip } from './Tooltip'

const TOOLS = [
  { label: 'Bold', icon: Bold },
  { label: 'Italic', icon: Italic },
  { label: 'Link', icon: Link2 },
  { label: 'Image', icon: Image },
  { label: 'Emoji', icon: Smile },
]

/** A fully rounded row of icon buttons, each named by a tooltip. */
function Toolbar({ version }: { version: 'before' | 'after' }) {
  return (
    <div className="demo__trigger">
      <div className="toolbar" role="toolbar" aria-label={`Formatting, ${version}`}>
        {TOOLS.map(({ label, icon: Icon }) => (
          <Tooltip key={label} label={label} variant={version === 'before' ? 'scale' : 'default'}>
            <button type="button" className="toolbar__button" aria-label={label}>
              <Icon size={16} strokeWidth={2} />
            </button>
          </Tooltip>
        ))}
      </div>
      <Verdict verdict={version === 'after' ? 'better' : 'worse'} />
    </div>
  )
}

/** The before-and-after pair for the toolbar tooltips entry. */
export function TooltipCompare() {
  return (
    <figure className="slot">
      <div className="slot__frame demo">
        <Toolbar version="before" />
        <Toolbar version="after" />
      </div>
      <figcaption className="type-caption slot__caption">
        Only the first tooltip waits; the rest open instantly
      </figcaption>
    </figure>
  )
}
