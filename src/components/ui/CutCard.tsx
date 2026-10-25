'use client'

import Link from 'next/link'
import { useState } from 'react'

import { LazyVideo } from '../motion/LazyVideo'

export type CutCardData = {
  slug: string
  name: string
  portugueseName?: string | null
  tagline?: string | null
  tastingNotes?: string | null
  doneness?: string | null
  origin?: string | null
  pairing?: string | null
  image?: string
  video?: string
  alt?: string
}

type Labels = { flip: string; tastingNotes: string; doneness: string; origin: string; pairing: string; seeAll: string }

// Front: the cut, on its green "sí, por favor" side. Flip it (click / Enter)
// to the red side for tasting notes, like turning the card at the table.
export function CutCard({ cut, href, labels, index = 0 }: { cut: CutCardData; href: string; labels: Labels; index?: number }) {
  const [flipped, setFlipped] = useState(false)
  const rows: [string, string | null | undefined][] = [
    [labels.tastingNotes, cut.tastingNotes],
    [labels.doneness, cut.doneness],
    [labels.origin, cut.origin],
    [labels.pairing, cut.pairing],
  ]

  return (
    <article className={`cut ${flipped ? 'is-flipped' : ''}`} style={{ ['--i' as string]: index }}>
      <div className="cut__inner">
        <div className="cut__face cut__front" aria-hidden={flipped}>
          <div className="cut__media">
            {cut.video ? (
              <LazyVideo src={cut.video} poster={cut.image} className="cut__img" label={cut.alt} />
            ) : cut.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="cut__img" src={cut.image} alt={cut.alt || cut.name} loading="lazy" draggable={false} />
            ) : null}
          </div>
          <div className="cut__label">
            <span className="cut__num">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="cut__name">{cut.portugueseName || cut.name}</h3>
            {cut.portugueseName && cut.portugueseName !== cut.name ? <p className="cut__alt">{cut.name}</p> : null}
            {cut.tagline ? <p className="cut__tagline">{cut.tagline}</p> : null}
          </div>
        </div>
        <div className="cut__face cut__back" aria-hidden={!flipped}>
          <h3 className="cut__name">{cut.portugueseName || cut.name}</h3>
          <dl className="cut__facts">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          <Link className="cut__more" href={href} tabIndex={flipped ? 0 : -1}>
            {labels.seeAll} →
          </Link>
        </div>
      </div>
      <button
        type="button"
        className="cut__flip"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={`${labels.flip}: ${cut.portugueseName || cut.name}`}
      >
        <span className="cut__chip cut__chip--yes" aria-hidden="true" />
        <span className="cut__chip cut__chip--no" aria-hidden="true" />
      </button>
    </article>
  )
}
