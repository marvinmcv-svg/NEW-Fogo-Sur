'use client'

import { useEffect, useRef } from 'react'

type Props = {
  src: string
  poster?: string
  className?: string
  loop?: boolean
  label?: string
  onEnded?: () => void
  eager?: boolean
  active?: boolean // false = keep it paused even while on screen (e.g. a covered layer)
}

// Muted inline video that only plays while on screen. It plays under reduced
// motion too: these are short silent loops of the food and the room, and many
// desktops (e.g. Windows with animation effects off) report reduced motion,
// which left every section video frozen on its first frame there.
export function LazyVideo({ src, poster, className, loop = true, label, onEnded, eager, active = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const activeRef = useRef(active)
  const visibleRef = useRef(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          if (!video.src) video.src = src
          if (activeRef.current) void video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.2 },
    )
    // Observe the wrapper: the video itself may sit under a reveal mask.
    io.observe(video.parentElement ?? video)
    return () => io.disconnect()
  }, [src])

  useEffect(() => {
    activeRef.current = active
    const video = ref.current
    if (!video || !visibleRef.current) return
    if (active) void video.play().catch(() => {})
    else video.pause()
  }, [active])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      src={eager ? src : undefined}
      muted
      playsInline
      loop={loop}
      preload={eager ? 'auto' : 'none'}
      autoPlay={eager}
      onEnded={onEnded}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      disablePictureInPicture
    />
  )
}
