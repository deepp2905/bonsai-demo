/**
 * An empty frame standing in for a demo that has not been produced yet.
 * It reserves the real footprint so the page reads as finished structure.
 */
export function MediaSlot({
  label,
  ratio = '16 / 9',
  size = 'full',
}: {
  label: string
  ratio?: string
  size?: 'full' | 'half'
}) {
  return (
    <figure className={`slot slot--${size}`}>
      <div className="slot__frame" style={{ aspectRatio: ratio }}>
        <span className="type-caption slot__label">{label}</span>
      </div>
    </figure>
  )
}

/** A before-and-after pair: two frames side by side, each labelled. */
export function CompareSlot({ before, after }: { before: string; after: string }) {
  return (
    <div className="compare">
      <MediaSlot label={`Before — ${before}`} ratio="4 / 3" size="half" />
      <MediaSlot label={`After — ${after}`} ratio="4 / 3" size="half" />
    </div>
  )
}