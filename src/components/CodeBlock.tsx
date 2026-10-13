/** A short code snippet shown as supporting detail for an entry. */
export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure className="code">
      <pre className="code__pre">
        <code>{code}</code>
      </pre>
      {caption ? <figcaption className="type-caption code__caption">{caption}</figcaption> : null}
    </figure>
  )
}