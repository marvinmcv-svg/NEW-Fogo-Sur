'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { gsap } from '../motion/gsap'
import { LazyVideo } from '../motion/LazyVideo'
import { prefersReducedMotion } from '../motion/useReducedMotion'

export type MarketTile = { src: string; alt: string; caption?: string | null; video?: boolean; poster?: string }

// Chapter 4. Light "paper" chapter: the camera descends into the Market Table
// from the chandeliers, then the details drift past at different depths like
// a grazing table.
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
        { scale: 1.35, yPercent: -8 },
        {
          scale: 1,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: '.market__hero', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      gsap.utils.toArray<HTMLElement>('.market__tile').forEach((tile) => {
        const speed = Number(tile.dataset.speed || 0)
        gsap.fromTo(
          tile,
          { yPercent: speed * 20 },
          {
            yPercent: speed * -20,
            ease: 'none',
            scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const speeds = [0.6, -0.3, 0.9, 0.2, -0.5, 0.7, 0.1]

  return (
    <section ref={root} className="market" id="mercado" data-chapter={chapter}>
      <div className="market__head">
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
      {heroImage ? (
        <figure className="market__hero" data-reveal="slice">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={heroAlt || ''} loading="lazy" />
        </figure>
      ) : null}
      <div className="market__grid">
        {tiles.map((t, i) => (
          <figure key={i} className={`market__tile market__tile--${i % 6}`} data-speed={speeds[i % speeds.length]} data-reveal="rise">
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
      {link ? <div className="market__link">{link}</div> : null}
    </section>
  )
}
