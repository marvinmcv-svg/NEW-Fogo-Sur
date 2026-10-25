'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { gsap, ScrollTrigger } from '../motion/gsap'
import { EmberField } from '../motion/EmberField'
import { prefersReducedMotion } from '../motion/useReducedMotion'

type Video = { src: string; poster?: string }

type Props = {
  eyebrow?: string | null
  title: ReactNode
  subtitle?: string | null
  intro?: Video | null
  loop?: Video | null
  ctaLabel?: string | null
  ctaHref: string
  secondaryLabel?: string | null
  secondaryHref: string
  countdown?: ReactNode
  scrollLabel?: string | null
}

// Chapter 1. A vertical "flame column" (the source reels are 9:16) that
// opens up to full screen as you scroll, like walking up to the grill.
export function Hero({ eyebrow, title, subtitle, intro, loop, ctaLabel, ctaHref, secondaryLabel, secondaryHref, countdown, scrollLabel }: Props) {
  const root = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<'intro' | 'loop'>(intro ? 'intro' : 'loop')
  const loopRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('is-loaded')
  }, [])

  // Start the loop when the intro ends (or straight away if there is none).
  useEffect(() => {
    if (phase === 'loop' && loopRef.current && !prefersReducedMotion()) {
      void loopRef.current.play().catch(() => {})
    }
  }, [phase])

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
      tl.to(el.querySelector('.hero__column'), { width: '100vw', height: '100vh', borderRadius: 0, ease: 'none' }, 0)
        .to(el.querySelector('.hero__copy'), { yPercent: -40, opacity: 0, ease: 'none' }, 0)
        .to(el.querySelector('.hero__vignette'), { opacity: 0.25, ease: 'none' }, 0)
    })
    mm.add('(max-width: 899px)', () => {
      gsap.to(el.querySelector('.hero__copy'), {
        yPercent: -25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className="hero" id="fuego" data-chapter={eyebrow || 'Fogo'}>
      <div className="hero__stage">
        <EmberField density={4.5} className="hero__embers" />
        <div className="hero__column">
          {intro ? (
            <video
              className={`hero__video ${phase === 'intro' ? 'is-on' : ''}`}
              src={intro.src}
              poster={intro.poster}
              muted
              playsInline
              autoPlay
              preload="auto"
              onEnded={() => setPhase('loop')}
              onError={() => setPhase('loop')}
              aria-hidden="true"
            />
          ) : null}
          {loop ? (
            <video
              ref={loopRef}
              className={`hero__video ${phase === 'loop' ? 'is-on' : ''}`}
              src={loop.src}
              poster={loop.poster}
              muted
              playsInline
              loop
              preload="auto"
              aria-hidden="true"
            />
          ) : null}
          <div className="hero__vignette" aria-hidden="true" />
        </div>

        <div className="hero__copy">
          {eyebrow ? <p className="eyebrow hero__eyebrow">{eyebrow}</p> : null}
          <h1 className="hero__title">{title}</h1>
          {subtitle ? <p className="hero__subtitle">{subtitle}</p> : null}
          <div className="hero__ctas">
            <Link href={ctaHref} className="btn btn--yes">
              <span className="btn__dot" aria-hidden="true" />
              {ctaLabel}
            </Link>
            {secondaryLabel ? (
              <Link href={secondaryHref} className="btn btn--ghost">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {countdown ? <div className="hero__countdown">{countdown}</div> : null}
        <div className="hero__scroll" aria-hidden="true">
          <span>{scrollLabel}</span>
          <i />
        </div>
      </div>
    </section>
  )
}
