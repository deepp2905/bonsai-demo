/**
 * An empty frame standing in for a demo that has not been produced yet.
 * It reserves the real footprint so the page reads as finished structure.
 */
export function MediaSlot({ label, ratio = '16 / 9' }: { label: string; ratio?: string }) {
  return (
    <figure className="slot">
      <div className="slot__frame" style={{ aspectRatio: ratio }}>
        <span className="type-caption slot__label">{label}</span>
      </div>
    </figure>
  )
}
