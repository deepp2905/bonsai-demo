import { CodeBlock } from './CodeBlock'
import { CompareSlot, MediaSlot } from './MediaSlot'
import type { Entry as EntryData } from '../entries'

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
      ) : (
        <CompareSlot before={entry.media.before} after={entry.media.after} />
      )}
    </article>
  )
}