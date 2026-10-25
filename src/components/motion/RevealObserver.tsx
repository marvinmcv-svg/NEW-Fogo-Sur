'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// One observer for the whole site: any element with [data-reveal] gets
// .is-in when it enters the viewport. The CSS decides what the reveal looks
// like (fade, rise, slice). Cheap, and works without GSAP.
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const timers: number[] = []
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target
            el.classList.add('is-in')
            io.unobserve(el)
            // Slices drop their mask once the wipe has finished (see styles.css).
            if (el.getAttribute('data-reveal') === 'slice') timers.push(window.setTimeout(() => el.classList.add('is-settled'), 1900))
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    const observeAll = () =>
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    observeAll()
    // Content can stream in after hydration (and the live preview re-renders).
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      timers.forEach(clearTimeout)
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
