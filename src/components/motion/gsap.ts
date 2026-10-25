'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Shared easing for every reveal on the site (see docs/PLAN.md §5).
export const EASE = 'expo.out'

export { gsap, ScrollTrigger }
