'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { gsap } from '../motion/gsap'
import { LazyVideo } from '../motion/LazyVideo'
import { prefersReducedMotion } from '../motion/useReducedMotion'

export type MarketTile = { src: string; alt: string; caption?: string | null; video?: boolean; poster?: string }

// Chapter 4. Light "paper" chapter. The table from above beside the story,
// then its details as a mosaic (desktop) or a swipeable row (phone).
export function Market({
  eyebrow,
  heading,
  text,
  heroImage,
  heroAlt,
  tiles,
  link,
  chapter,
}: {
  eyebrow?: string | null
  heading: ReactNode
  text?: string | null
  heroImage?: string
  heroAlt?: string
  tiles: MarketTile[]
  link?: ReactNode
  chapter: string
}) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.market__hero img',
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.market__hero', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  // The video is tall (9:16): it takes the mosaic's tall slot, third in line.
  const photos = tiles.filter((t) => !t.video)
  const videos = tiles.filter((t) => t.video)
  const ordered = videos.length ? [...photos.slice(0, 2), ...videos, ...photos.slice(2)] : photos
  const captions = photos.map((t) => t.caption).filter((c): c is string => Boolean(c))

  return (
    <section ref={root} className="market" id="mercado" data-chapter={chapter}>
      <div className="market__intro">
        <div className="market__copy">
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
          {captions.length ? (
            <ul className="market__chips" data-reveal="rise">
              {captions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : null}
          {link ? <div className="market__link">{link}</div> : null}
        </div>
        {heroImage ? (
          <figure className="market__hero" data-reveal="rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={heroAlt || ''} loading="lazy" />
          </figure>
        ) : null}
      </div>

      {ordered.length ? (
        <div className={`market__bento ${ordered.length === 7 ? 'market__bento--7' : ''}`} data-reveal="rise">
          {ordered.map((t, i) => (
            <figure key={i} className={`market__tile ${t.video ? 'market__tile--video' : ''}`}>
              {t.video ? (
                <LazyVideo src={t.src} poster={t.poster} className="market__img" label={t.alt} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="market__img" src={t.src} alt={t.alt} loading="lazy" />
              )}
              {t.caption ? <figcaption>{t.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  )
}
