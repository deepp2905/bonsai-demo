import { CodeBlock } from './CodeBlock'
import { CompareSlot, MediaSlot } from './MediaSlot'
import { MenuCompare } from './MenuDemo'
import { ToastCompare } from './ToastDemo'
import type { Entry as EntryData } from '../entries'

/** The live demo an entry names. */
function Demo({ demo }: { demo: 'toasts' | 'menus' | 'tooltips' }) {
  if (demo === 'menus') return <MenuCompare />
  return <ToastCompare />
}

/** One gallery entry: number, title, context, optional code, then the demo. */
export function Entry({ entry }: { entry: EntryData }) {
  return (
    <article className="entry" id={entry.id}>
      <header className="entry__head">
        <p className="type-caption entry__index">{entry.index}</p>
        <h2 className="type-heading entry__title">{entry.title}</h2>
      </header>

      <p className="type-body entry__context">{entry.context}</p>

      {entry.code ? <CodeBlock code={entry.code} caption={entry.codeCaption} /> : null}

      {entry.media.kind === 'video' ? (
        <MediaSlot label={entry.media.label} />
      ) : entry.media.kind === 'demo' ? (
        <Demo demo={entry.media.demo} />
      ) : (
        <CompareSlot before={entry.media.before} after={entry.media.after} />
      )}
    </article>
  )
}