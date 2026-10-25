'use client'

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './useReducedMotion'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.__lenis = undefined
    }
  }, [])

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true })
    // Layout changed: let ScrollTrigger re-measure once the new page painted.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
