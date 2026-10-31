'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Chapter = { id: string; label: string }

// A skewer on the right edge: each chapter is a "cut" that browns as you pass
// it. Reads the chapters from [data-chapter] sections on the page, so it works
// for whichever chapters the CMS has enabled.
export function SkewerProgress() {
  const pathname = usePathname()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [active, setActive] = useState(-1)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    setChapters(sections.map((s) => ({ id: s.id, label: s.dataset.chapter || '' })))
    if (!sections.length) return

    // Measured once per frame at most, and the fill is written to the DOM
    // directly so scrolling never re-renders the nav (only a chapter change does).
    let raf = 0
    const measure = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (fill.current) fill.current.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`
      const mid = window.innerHeight * 0.5
      let current = -1
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top < mid) current = i
      })
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    onScroll() // next frame, once the skewer itself has rendered
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  if (chapters.length < 2) return null

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="skewer" aria-label="Capítulos">
      <span className="skewer__handle" aria-hidden="true" />
      <span className="skewer__rod" aria-hidden="true">
        <span ref={fill} className="skewer__fill" style={{ transform: 'scaleY(0)' }} />
      </span>
      <ol className="skewer__cuts">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className={`skewer__cut ${i <= active ? 'is-done' : ''} ${i === active ? 'is-active' : ''}`}
              onClick={() => go(c.id)}
              aria-current={i === active ? 'step' : undefined}
            >
              <span className="skewer__meat" aria-hidden="true" />
              <span className="skewer__label">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <span className="skewer__tip" aria-hidden="true" />
    </nav>
  )
}
