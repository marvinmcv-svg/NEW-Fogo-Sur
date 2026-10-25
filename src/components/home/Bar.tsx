import type { ReactNode } from 'react'

import { LazyVideo } from '../motion/LazyVideo'

export type BarClip = { src: string; poster?: string; video: boolean; caption?: string | null; alt: string }
export type BarDrink = { name: string; description?: string | null; price?: string | null }

// Chapter 6. Amber instead of fire: a row of tall clips that lean in on hover,
// and the house drinks.
export function Bar({
  eyebrow,
  heading,
  text,
  clips,
  drinks,
  chapter,
}: {
  eyebrow?: string | null
  heading: ReactNode
  text?: string | null
  clips: BarClip[]
  drinks: BarDrink[]
  chapter: string
}) {
  return (
    <section className="bar" id="bar" data-chapter={chapter}>
      <div className="bar__glow" aria-hidden="true" />
      <div className="bar__head">
        {eyebrow ? (
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
        ) : null}
        {heading}
        {text ? (
          <p className="lede" data-reveal="rise">
            {text}
          </p>
        ) : null}
      </div>
      <div className="bar__clips">
        {clips.map((c, i) => (
          <figure key={i} className="bar__clip" data-reveal="rise" style={{ ['--i' as string]: i }}>
            {c.video ? (
              <LazyVideo src={c.src} poster={c.poster} className="bar__media" label={c.alt} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="bar__media" src={c.src} alt={c.alt} loading="lazy" />
            )}
            {c.caption ? <figcaption>{c.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {drinks.length ? (
        <ul className="bar__drinks">
          {drinks.map((d, i) => (
            <li key={i} data-reveal="rise" style={{ ['--i' as string]: i }}>
              <span className="bar__drink">{d.name}</span>
              <span className="leader" aria-hidden="true" />
              {d.price ? <span className="bar__price">{d.price}</span> : null}
              {d.description ? <span className="bar__desc">{d.description}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
