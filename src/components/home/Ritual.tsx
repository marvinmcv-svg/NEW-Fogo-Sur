'use client'

import { useEffect, useRef, useState } from 'react'

import { splitLines } from '../../lib/format'
import { LazyVideo } from '../motion/LazyVideo'
import { ScrollTrigger } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/useReducedMotion'

export type RitualBeat = { kicker?: string | null; title: string; text?: string | null; src?: string; poster?: string }

// Chapter 2. A sticky stage that is ~100vh of scroll per beat. The active
// beat's video is carved in like a slice off the espeto: the window slides
// over while the pane inside counter-moves, so the picture stays put.
// Transforms only; a diagonal clip-path (or a skewed clip) over playing
// video halved the frame rate.
export function Ritual({ heading, beats, chapter }: { heading?: string | null; beats: RitualBeat[]; chapter: string }) {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      // The bar is written straight to the DOM: re-rendering the chapter on
      // every scroll frame made the pinned videos stutter.
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
        setActive(Math.min(beats.length - 1, Math.floor(self.progress * beats.length * 0.999)))
      },
    })
    return () => st.kill()
  }, [beats.length])

  return (
    <section
      ref={root}
      className="ritual"
      id="ritual"
      data-chapter={chapter}
      style={{ ['--beats' as string]: beats.length }}
    >
      <div className="ritual__sticky">
        <div className="ritual__media">
          {beats.map((b, i) => (
            <div key={i} className={`ritual__frame ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}>
              {/* Frames are stacked: only the one on top (and the one it is
                  wiping over) needs to be decoding. */}
              <div className="ritual__pane">
                {b.src ? (
                  <LazyVideo src={b.src} poster={b.poster} className="ritual__video" active={i === active || i === active - 1} />
                ) : null}
              </div>
            </div>
          ))}
          <div className="ritual__shade" aria-hidden="true" />
        </div>

        <div className="ritual__copy">
          {heading ? <p className="eyebrow">{heading}</p> : null}
          <ol className="ritual__beats">
            {beats.map((b, i) => (
              <li key={i} className={`ritual__beat ${i === active ? 'is-active' : ''}`} aria-current={i === active ? 'step' : undefined}>
                <span className="ritual__kicker">{b.kicker || String(i + 1).padStart(2, '0')}</span>
                <h3 className="ritual__title">
                  {splitLines(b.title).map((line) => (
                    <span key={line} className="ritual__line">
                      {line}
                    </span>
                  ))}
                </h3>
                {b.text ? <p className="ritual__text">{b.text}</p> : null}
              </li>
            ))}
          </ol>
          <div className="ritual__progress" aria-hidden="true">
            <span ref={bar} style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
