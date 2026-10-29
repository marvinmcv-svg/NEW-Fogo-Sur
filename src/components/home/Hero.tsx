'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { WhatsAppIcon } from '../layout/WhatsAppFab'
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
  whatsappHref: string
  whatsappLabel: string
  countdown?: ReactNode
}

const DESKTOP = '(min-width: 900px)'

// Chapter 1. Desktop: every reel side by side, full screen, always playing.
// Phone: only the first reel, full screen, with the title and one button
// that opens WhatsApp to book. The other reels are never downloaded there.
export function Hero({ eyebrow, title, reels, ctaLabel, ctaHref, whatsappHref, whatsappLabel, countdown }: Props) {
  const root = useRef<HTMLElement>(null)
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-loaded')
    const mq = window.matchMedia(DESKTOP)
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Autoplay is only a request: browsers can refuse it (battery saver, data
  // saver, a tab opened in the background). Ask again whenever the hero comes
  // into view, the tab comes back, or the visitor first touches or scrolls.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const videos = () => [...el.querySelectorAll<HTMLVideoElement>('video')].filter((v) => v.getAttribute('src'))
    const playAll = () => {
      for (const v of videos()) {
        v.muted = true
        if (v.paused) void v.play().catch(() => {})
      }
    }
    playAll()
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) playAll()
    })
    io.observe(el)
    const onVisible = () => document.visibilityState === 'visible' && playAll()
    const events = ['pointerdown', 'touchstart', 'scroll', 'keydown'] as const
    document.addEventListener('visibilitychange', onVisible)
    for (const e of events) window.addEventListener(e, playAll, { passive: true, once: true })
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
      for (const e of events) window.removeEventListener(e, playAll)
    }
  }, [reels, desktop])

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add(DESKTOP, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
      // Outer panels slide away faster than the centre one as you scroll on.
      const panels = el.querySelectorAll<HTMLElement>('.hero__panel')
      panels.forEach((p, i) => {
        const side = i - (panels.length - 1) / 2
        tl.to(p, { yPercent: side === 0 ? -6 : -16, ease: 'none' }, 0)
      })
      tl.to(el.querySelector('.hero__copy'), { yPercent: -30, opacity: 0, ease: 'none' }, 0)
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className="hero" id="fuego" data-chapter={eyebrow || 'Fogo'}>
      <div className="hero__stage">
        <div className="hero__reels" style={{ ['--n' as string]: Math.max(reels.length, 1) }}>
          {reels.map((r, i) => (
            <div key={r.src} className="hero__panel" style={{ ['--i' as string]: i }}>
              <video
                className="hero__video"
                // Only the first reel exists on a phone; the rest load on desktop.
                src={i === 0 || desktop ? r.src : undefined}
                poster={i === 0 || desktop ? r.poster : undefined}
                muted
                autoPlay
                loop
                playsInline
                preload={i === 0 || desktop ? 'auto' : 'none'}
                disablePictureInPicture
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
          <Link href={ctaHref} className="btn btn--yes hero__cta hero__cta--desk">
            <span className="btn__dot" aria-hidden="true" />
            {ctaLabel}
          </Link>
          <a href={whatsappHref} className="btn btn--yes hero__cta hero__cta--wa" target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} />
            {whatsappLabel}
          </a>
        </div>

        {countdown ? <div className="hero__countdown">{countdown}</div> : null}
      </div>
    </section>
  )
}
