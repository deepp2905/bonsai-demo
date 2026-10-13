import { CopyButton } from './CopyButton'

/** A short code snippet shown as supporting detail for an entry. */
export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure className="code">
      <div className="code__frame">
        <div className="code__head">
          <CopyButton value={code} />
        </div>
        <pre className="code__pre">
          <code>{code}</code>
        </pre>
      </div>
      {caption ? <figcaption className="type-caption code__caption">{caption}</figcaption> : null}
    </figure>
  )
}