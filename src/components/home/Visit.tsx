import Link from 'next/link'
import type { ReactNode } from 'react'

import { LazyVideo } from '../motion/LazyVideo'

type Props = {
  eyebrow?: string | null
  heading: ReactNode
  text?: string | null
  media?: { src: string; poster?: string; video: boolean; alt: string }
  address?: string | null
  hours: { days: string; time: string }[]
  hoursTbd: string
  directionsHref: string
  directionsLabel: string
  ctaLabel: string
  ctaHref: string
  countdown?: ReactNode
  chapter: string
}

// Chapter 8. Where to find us, and the final green card.
export function Visit({ eyebrow, heading, text, media, address, hours, hoursTbd, directionsHref, directionsLabel, ctaLabel, ctaHref, countdown, chapter }: Props) {
  return (
    <section className="visit" id="visita" data-chapter={chapter}>
      <div className="visit__media" data-reveal="slice">
        {media ? (
          media.video ? (
            <LazyVideo src={media.src} poster={media.poster} className="visit__img" label={media.alt} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="visit__img" src={media.src} alt={media.alt} loading="lazy" />
          )
        ) : null}
      </div>
      <div className="visit__copy">
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
        {countdown}
        <div className="visit__info" data-reveal="rise">
          {address ? <p className="visit__address">{address}</p> : null}
          {hours.length ? (
            <dl className="visit__hours">
              {hours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="visit__tbd">{hoursTbd}</p>
          )}
          <a className="link-arrow" href={directionsHref} target="_blank" rel="noopener noreferrer">
            {directionsLabel} ↗
          </a>
        </div>
        <Link className="final-card" href={ctaHref} data-reveal="rise">
          <span className="final-card__face">
            <span className="final-card__brand">FOGO de CHÃO</span>
            <span className="final-card__label">{ctaLabel}</span>
          </span>
        </Link>
      </div>
    </section>
  )
}
