import { Entry } from '../components/Entry'
import { MediaSlot } from '../components/MediaSlot'
import { entries, misc } from '../entries'

function Gallery() {
  return (
    <main className="page page--wide">
      <header className="masthead">
        <h1 className="type-display">Interaction improvements</h1>
        <p className="type-body masthead__sub">
          Three interaction details from Bonsai, rebuilt. Each entry pairs the problem
          with the version that shipped, the reasoning behind it, and the demo. Product feel smooth with 100s of small improvements like this over a few fancy animations.
        </p>
      </header>

      <div className="entries">
        {entries.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </div>

      <section className="section">
        <header className="entry__head">
          <p className="type-caption entry__index">04</p>
          <h2 className="type-heading entry__title">Miscellaneous</h2>
        </header>
        <p className="type-body entry__context">
          Smaller details that did not need a full entry: single-property changes where
          the fix is the whole story.
        </p>

        <ul className="misc">
          {misc.map((item) => (
            <li className="misc__item" key={item.label}>
              <MediaSlot label={item.label} ratio="4 / 3" />
              <p className="type-caption misc__note">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <header className="entry__head">
          <p className="type-caption entry__index">05</p>
          <h2 className="type-heading entry__title">Final thoughts</h2>
        </header>
        <p className="type-body entry__context">
          The goal was to make the interface feel smoother and faster, and to use motion only
          where it is needed. Every animation here has a job: showing where a new toast came
          from, getting a menu out of the way once you are done with it, or getting a tooltip
          to you sooner.
        </p>
        <p className="type-body entry__context">
          Motion should not be there to look fancy or to make something feel interactive. It
          should add to the experience and make it better for the person using it, and when it
          does not, the right amount of motion is none.
        </p>
      </section>
    </main>
  )
}

export default Gallery