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
  reels: Video[]
  ctaLabel?: string | null
  ctaHref: string
  countdown?: ReactNode
}

const DESKTOP = '(min-width: 900px)'

// Chapter 1. A triptych of vertical reels (the sources are 9:16): fire →
// skewer → table, the whole evening at a glance. On desktop the three panels
// stand side by side and drift apart as you scroll; on a phone they play one
// after another, full screen.
export function Hero({ eyebrow, title, reels, ctaLabel, ctaHref, countdown }: Props) {
  const root = useRef<HTMLElement>(null)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-loaded')
    const mq = window.matchMedia(DESKTOP)
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Desktop: every panel loops. Phone: only the active one plays.
  useEffect(() => {
    if (prefersReducedMotion()) return
    videos.current.forEach((v, i) => {
      if (!v) return
      if (desktop || i === active) void v.play().catch(() => {})
      else v.pause()
    })
  }, [active, desktop])

  const onEnded = (i: number) => {
    const v = videos.current[i]
    if (!v) return
    if (desktop || reels.length < 2) {
      v.currentTime = 0
      void v.play().catch(() => {})
    } else {
      const next = (i + 1) % reels.length
      const n = videos.current[next]
      if (n) n.currentTime = 0
      setActive(next)
    }
  }

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add(DESKTOP, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
      // Outer panels slide away faster than the centre one: the fire opens up.
      const panels = el.querySelectorAll<HTMLElement>('.hero__panel')
      panels.forEach((p, i) => {
        const side = i - (panels.length - 1) / 2
        tl.to(p, { yPercent: side === 0 ? -6 : -18, xPercent: side * 10, ease: 'none' }, 0)
      })
      tl.to(el.querySelector('.hero__copy'), { yPercent: -30, opacity: 0, ease: 'none' }, 0)
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
        <div className={`hero__reels hero__reels--${Math.max(reels.length, 1)}`}>
          {reels.map((r, i) => (
            <div key={r.src} className={`hero__panel ${i === active ? 'is-on' : ''}`} style={{ ['--i' as string]: i }}>
              <video
                ref={(node) => {
                  videos.current[i] = node
                }}
                className="hero__video"
                src={r.src}
                poster={r.poster}
                muted
                playsInline
                autoPlay={desktop || i === 0}
                preload={desktop || i === 0 ? 'auto' : 'metadata'}
                onEnded={() => onEnded(i)}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
        <div className="hero__vignette" aria-hidden="true" />
        <EmberField density={3} className="hero__embers" />

        <div className="hero__copy">
          {eyebrow ? <p className="eyebrow hero__eyebrow">{eyebrow}</p> : null}
          <h1 className="hero__title">{title}</h1>
          <Link href={ctaHref} className="btn btn--yes hero__cta">
            <span className="btn__dot" aria-hidden="true" />
            {ctaLabel}
          </Link>
        </div>

        {reels.length > 1 ? (
          <ol className="hero__dots" aria-hidden="true">
            {reels.map((r, i) => (
              <li key={r.src} className={i === active ? 'is-on' : ''} />
            ))}
          </ol>
        ) : null}
        {countdown ? <div className="hero__countdown">{countdown}</div> : null}
      </div>
    </section>
  )
}
