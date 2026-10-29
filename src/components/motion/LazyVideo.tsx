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
}

// Muted inline video that only plays while on screen. It plays under reduced
// motion too: these are short silent loops of the food and the room, and many
// desktops (e.g. Windows with animation effects off) report reduced motion,
// which left every section video frozen on its first frame there.
export function LazyVideo({ src, poster, className, loop = true, label, onEnded, eager }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src
          void video.play().catch(() => {})
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
