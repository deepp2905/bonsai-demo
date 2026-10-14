import { CheckboxDemo } from '../components/CheckboxDemo'
import { CopyButton } from '../components/CopyButton'
import { CopyPromptButton } from '../components/CopyPromptButton'
import { Entry } from '../components/Entry'
import { MediaSlot } from '../components/MediaSlot'
import { entries, misc } from '../entries'
import { prompts } from '../prompts'

function Gallery() {
  return (
    <main className="page page--wide">
      <header className="masthead">
        <h1 className="type-display">Interaction improvements for Bonsai</h1>
        <p className="type-body masthead__sub">
        The goal was to make the interface feel smoother and faster, and to use motion only where it is needed. Every animation here has a job: showing where a new toast came from, getting a menu out of the way once you are done with it, or getting a tooltip to you sooner.
        </p>
      </header>

      <div className="entries">
        {entries.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </div>

      <section className="section">
        <header className="entry__head">
          <div className="entry__title-row">
            <h2 className="type-heading entry__title">Miscellaneous</h2>
            <CopyPromptButton prompt={prompts.misc} />
          </div>
        </header>
        <p className="type-body entry__context">
          Smaller details that did not need a full entry: single-property changes where
          the fix is the whole story.
        </p>

        <ul className="misc">
          {misc.map((item) => (
            <li className="misc__item" key={item.label}>
              {item.demo ? (
                <figure className="slot">
                  <div className="slot__frame misc__frame">
                    {item.demo === 'copy' ? (
                      <CopyButton value="npm install bonsai" />
                    ) : (
                      <CheckboxDemo />
                    )}
                  </div>
                </figure>
              ) : (
                <MediaSlot label={item.label} ratio="4 / 3" />
              )}
              {item.note ? <p className="type-caption misc__note">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <header className="entry__head">
          <h2 className="type-heading entry__title">Final thoughts</h2>
        </header>
        <p className="type-body entry__context">
          If I had to pick what to do next, I'd spend time on:
        </p>
        <ul className="type-body next-list">
          <li>
            <strong>Boot-up loading screen:</strong> Use the screen space productively while Bonsai
            starts up
          </li>
          <li>
            <strong>Chat interface:</strong> Interaction where the user is asked
            for input and given choices to pick from
          </li>
          <li>
            <strong>Analytics page:</strong> Improve visual hierarchy and add motion to graphs and charts
          </li>
        </ul>
      </section>
    </main>
  )
}

export default Gallery