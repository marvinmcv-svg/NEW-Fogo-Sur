'use client'

import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '../motion/useReducedMotion'

// The rodízio as an endless, slow conveyor: it drifts on its own while in
// view, and can be dragged (mouse), swiped (touch) or scrolled (keyboard,
// trackpad). It is a native scroller underneath, so it stays accessible.
export function CutsConveyor({ children, hint }: { children: React.ReactNode; hint?: string | null }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = prefersReducedMotion()

    let visible = false
    let paused = false
    let raf = 0
    let resumeAt = 0
    let carry = 0

    const drift = () => {
      if (visible && !paused && !reduced && performance.now() > resumeAt) {
        carry += 0.35
        const step = Math.floor(carry)
        carry -= step
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) el.scrollLeft = 0
        else el.scrollLeft += step
      }
      raf = requestAnimationFrame(drift)
    }
    raf = requestAnimationFrame(drift)

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 })
    io.observe(el)

    // Mouse drag with inertia (touch and trackpads already scroll natively).
    let dragging = false
    let moved = 0
    let startX = 0
    let startLeft = 0
    let lastX = 0
    let velocity = 0
    let lastT = 0

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = 0
      startX = lastX = e.clientX
      startLeft = el.scrollLeft
      lastT = performance.now()
      velocity = 0
      el.classList.add('is-dragging')
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      moved = Math.max(moved, Math.abs(e.clientX - startX))
      el.scrollLeft = startLeft - (e.clientX - startX)
      velocity = (lastX - e.clientX) / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      el.classList.remove('is-dragging')
      resumeAt = performance.now() + 2500
      let v = velocity * 16
      const glide = () => {
        if (Math.abs(v) < 0.5) return
        el.scrollLeft += v
        v *= 0.94
        requestAnimationFrame(glide)
      }
      if (!reduced) glide()
    }
    // A drag should not count as a click on the card underneath.
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const pause = () => (paused = true)
    const resume = () => {
      paused = false
      resumeAt = performance.now() + 1200
    }
    const touch = () => (resumeAt = performance.now() + 4000)

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('click', click, true)
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('focusin', pause)
    el.addEventListener('focusout', resume)
    el.addEventListener('touchstart', touch, { passive: true })
    el.addEventListener('wheel', touch, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('click', click, true)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('focusin', pause)
      el.removeEventListener('focusout', resume)
      el.removeEventListener('touchstart', touch)
      el.removeEventListener('wheel', touch)
    }
  }, [])

  return (
    <div className="conveyor">
      <div ref={ref} className="conveyor__track" tabIndex={0} role="region" aria-label={hint ?? undefined}>
        {children}
      </div>
      {hint ? (
        <p className="conveyor__hint" aria-hidden="true">
          <span className="conveyor__arrow">←</span> {hint} <span className="conveyor__arrow">→</span>
        </p>
      ) : null}
    </div>
  )
}
