const neutralSteps = [
  { step: 50, value: 'oklch(0.985 0.004 65)' },
  { step: 100, value: 'oklch(0.966 0.007 65)' },
  { step: 200, value: 'oklch(0.935 0.011 65)' },
  { step: 300, value: 'oklch(0.888 0.014 65)' },
  { step: 400, value: 'oklch(0.828 0.017 65)' },
  { step: 500, value: 'oklch(0.752 0.019 65)' },
  { step: 600, value: 'oklch(0.640 0.019 65)' },
  { step: 700, value: 'oklch(0.545 0.018 65)' },
  { step: 800, value: 'oklch(0.455 0.016 65)' },
  { step: 900, value: 'oklch(0.330 0.014 65)' },
  { step: 950, value: 'oklch(0.215 0.012 65)' },
]

const specimens = [
  {
    name: 'Display',
    spec: 'Satoshi Bold · 40 / 1.1 · -0.025em',
    className: 'type-display',
    sample: 'The Magic of Clip Path',
  },
  {
    name: 'Heading',
    spec: 'Satoshi Bold · 24 / 1.2 · -0.02em',
    className: 'type-heading',
    sample: 'The Basics',
  },
  {
    name: 'Subheading',
    spec: 'Satoshi Medium · 18 / 1.35 · -0.01em',
    className: 'type-subheading',
    sample: 'Turning a rectangle into a circle',
  },
  {
    name: 'Body',
    spec: 'Inter Regular · 16 / 1.6 · 0',
    className: 'type-body',
    sample:
      'The clip-path property clips an element into a specific shape. Content outside that region is hidden; content inside stays visible. That is enough to turn a rectangle into a circle.',
  },
  {
    name: 'Caption',
    spec: 'Inter Regular · 13 / 1.45 · +0.01em',
    className: 'type-caption',
    sample: 'Updated 12 October 2026 · 4 min read',
  },
]

function App() {
  return (
    <main className="page">
      <header className="masthead">
        <h1 className="type-display">Type &amp; Color</h1>
        <p className="type-body masthead__sub">
          Satoshi for headings, Inter for text, on an eleven-step warm neutral
          ramp.
        </p>
      </header>

      <section className="section">
        <h2 className="type-heading">Typography</h2>
        <p className="type-body section__note">
          Five styles. Each sample is set in the style named above it.
        </p>

        <div className="specimens">
          {specimens.map((specimen) => (
            <div className="specimen" key={specimen.name}>
              <p className="type-caption specimen__spec">
                {specimen.name} — {specimen.spec}
              </p>
              <p className={specimen.className}>{specimen.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="type-heading">Neutral palette</h2>
        <p className="type-body section__note">
          Eleven warm steps, authored in OKLCH at hue 65.
        </p>

        <ul className="palette">
          {neutralSteps.map(({ step, value }) => (
            <li className="swatch" key={step}>
              <div
                className="swatch__chip"
                style={{ background: `var(--neutral-${step})` }}
              />
              <p className="type-caption swatch__step">{step}</p>
              <p className="swatch__value">{value}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="type-heading">Example</h2>
        <p className="type-body section__note">
          The styles composed on real content, with the darkest step as the
          shape fill.
        </p>

        <div className="demo-card">
          <div className="demo-circle" />
        </div>
        <p className="type-caption demo-caption">
          Figure 1 — A rectangle clipped to a circle with circle(50%).
        </p>
      </section>
    </main>
  )
}

export default App