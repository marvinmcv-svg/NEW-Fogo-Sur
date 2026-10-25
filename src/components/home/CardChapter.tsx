'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { LazyVideo } from '../motion/LazyVideo'
import { prefersReducedMotion } from '../motion/useReducedMotion'

type Props = {
  eyebrow?: string | null
  heading: ReactNode
  text?: string | null
  yes: { label: string; sub?: string | null; text?: string | null }
  no: { label: string; sub?: string | null; text?: string | null }
  video?: { src: string; poster?: string }
  flipLabel: string
  chapter: string
}

// Chapter 5. The service card itself: green "sí, por favor" keeps the
// gauchos coming, red "no, gracias" pauses them. Tilt it, flip it.
export function CardChapter({ eyebrow, heading, text, yes, no, video, flipLabel, chapter }: Props) {
  const [side, setSide] = useState<'yes' | 'no'>('yes')
  const cardRef = useRef<HTMLButtonElement>(null)
  const hinted = useRef(false)

  // One hint flip the first time the card scrolls into view.
  useEffect(() => {
    const el = cardRef.current
    if (!el || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !hinted.current) {
          hinted.current = true
          window.setTimeout(() => setSide('no'), 900)
          window.setTimeout(() => setSide('yes'), 2300)
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
  }
  const resetTilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  const current = side === 'yes' ? yes : no

  return (
    <section className="card-chapter" id="tarjeta" data-chapter={chapter}>
      {video ? (
        <div className="card-chapter__bg" aria-hidden="true">
          <LazyVideo src={video.src} poster={video.poster} className="card-chapter__video" />
        </div>
      ) : null}
      <div className="card-chapter__inner">
        <div className="card-chapter__copy">
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

        <div className="card-chapter__stage">
          <button
            ref={cardRef}
            type="button"
            className={`service-card ${side === 'no' ? 'is-no' : ''}`}
            onClick={() => setSide((s) => (s === 'yes' ? 'no' : 'yes'))}
            onPointerMove={tilt}
            onPointerLeave={resetTilt}
            aria-label={`${flipLabel}: ${current.label}`}
            aria-pressed={side === 'no'}
          >
            <span className="service-card__flipper">
              <span className="service-card__face service-card__face--yes">
                <span className="service-card__brand">FOGO de CHÃO</span>
                <span className="service-card__label">{yes.label}</span>
                {yes.sub ? <span className="service-card__sub">{yes.sub}</span> : null}
                <span className="service-card__ring" aria-hidden="true" />
              </span>
              <span className="service-card__face service-card__face--no">
                <span className="service-card__brand">FOGO de CHÃO</span>
                <span className="service-card__label">{no.label}</span>
                {no.sub ? <span className="service-card__sub">{no.sub}</span> : null}
                <span className="service-card__ring" aria-hidden="true" />
              </span>
            </span>
          </button>
          <p className="card-chapter__explain" aria-live="polite">
            <span className={`card-chapter__dot ${side === 'no' ? 'is-no' : ''}`} aria-hidden="true" />
            {current.text}
          </p>
        </div>
      </div>
    </section>
  )
}
