import { MenuCompare } from './MenuDemo'
import { ToastCompare } from './ToastDemo'
import { TooltipCompare } from './TooltipDemo'
import type { Entry as EntryData } from '../entries'
import { prompts } from '../prompts'
import { CopyPromptButton } from './CopyPromptButton'

/** The live demo an entry names. */
function Demo({ demo }: { demo: 'toasts' | 'menus' | 'tooltips' }) {
  if (demo === 'menus') return <MenuCompare />
  if (demo === 'tooltips') return <TooltipCompare />
  return <ToastCompare />
}

/** One gallery entry: number, title, context, then the demo. */
export function Entry({ entry }: { entry: EntryData }) {
  return (
    <article className="entry" id={entry.id}>
      <header className="entry__head">
        <p className="type-caption entry__index">{entry.index}</p>
        <div className="entry__title-row">
          <h2 className="type-heading entry__title">{entry.title}</h2>
          <CopyPromptButton prompt={prompts[entry.media.demo]} />
        </div>
      </header>

      <p className="type-body entry__context">{entry.context}</p>

      <Demo demo={entry.media.demo} />
    </article>
  )
}