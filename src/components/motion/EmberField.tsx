'use client'

import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from './useReducedMotion'

type Props = {
  density?: number // particles per 100k px²
  className?: string
}

type Ember = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; band: number }

const BANDS = 4
const SPRITE = 64

// A soft spark drawn once per hue (18°–40°, ember orange to gold).
const makeSprites = () =>
  Array.from({ length: BANDS }, (_, b) => {
    const hue = 18 + (b / (BANDS - 1)) * 22
    const c = document.createElement('canvas')
    c.width = c.height = SPRITE
    const g = c.getContext('2d')!
    const r = SPRITE / 2
    const grad = g.createRadialGradient(r, r, 0, r, r, r)
    grad.addColorStop(0, `hsla(${hue + 20}, 100%, 75%, 1)`)
    grad.addColorStop(0.35, `hsla(${hue}, 100%, 55%, 0.6)`)
    grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0)`)
    g.fillStyle = grad
    g.fillRect(0, 0, SPRITE, SPRITE)
    return c
  })

// Sparks rising off the grill: the site's "heartbeat". Plain 2D canvas (no
// WebGL) so it runs everywhere; it pauses off-screen and speeds up with scroll.
export function EmberField({ density = 3.2, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nav = navigator as Navigator & { deviceMemory?: number }
    const lowEnd = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2
    const dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5)

    const sprites = makeSprites()
    let w = 0
    let h = 0
    let embers: Ember[] = []
    let running = false
    let raf = 0
    let boost = 0
    let lastScroll = window.scrollY

    const spawn = (atBottom = true): Ember => {
      const max = 4 + Math.random() * 6
      return {
        x: Math.random() * w,
        y: atBottom ? h + Math.random() * 40 : Math.random() * h,
        vx: (Math.random() - 0.5) * 12,
        vy: -(18 + Math.random() * 46),
        r: 0.6 + Math.random() * 1.8,
        life: atBottom ? 0 : Math.random() * max,
        max,
        band: Math.floor(Math.random() * BANDS),
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(((w * h) / 100_000) * density * (lowEnd ? 0.5 : 1))
      embers = Array.from({ length: Math.min(count, 220) }, () => spawn(false))
    }

    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const sy = window.scrollY
      boost = Math.min(boost * 0.92 + Math.abs(sy - lastScroll) * 0.02, 4)
      lastScroll = sy
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.life += dt
        if (e.life > e.max || e.y < -20) {
          embers[i] = spawn(true)
          continue
        }
        const speed = 1 + boost
        e.x += (e.vx + Math.sin((e.life + i) * 1.7) * 8) * dt * speed
        e.y += e.vy * dt * speed
        const t = e.life / e.max
        const alpha = Math.sin(Math.PI * Math.min(t, 1)) * 0.85
        if (alpha <= 0.01) continue
        // One pre-rendered glow per hue band, stamped at the ember's size:
        // building a gradient per ember per frame was the costly part.
        const glow = e.r * 4
        ctx.globalAlpha = alpha
        ctx.drawImage(sprites[e.band], e.x - glow, e.y - glow, glow * 2, glow * 2)
      }
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(canvas)
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density])

  return <canvas ref={ref} className={`ember-field ${className ?? ''}`} aria-hidden="true" />
}
