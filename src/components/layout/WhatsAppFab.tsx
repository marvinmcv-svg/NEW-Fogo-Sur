'use client'

import { useEffect, useState } from 'react'

export function WhatsAppFab({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <a
      className={`wa-fab ${visible ? 'is-visible' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      tabIndex={visible ? 0 : -1}
    >
      <WhatsAppIcon />
    </a>
  )
}

export function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.36-.5.05-.97.23-3.26-.68-2.75-1.09-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34l.51.01c.16.01.38-.06.6.46.24.55.8 1.88.86 2.02.07.13.11.29.02.47-.09.18-.13.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.69 1.14 1.48 1.84 1.02.91 1.88 1.19 2.15 1.33.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.25.09 1.57.74 1.84.88.27.13.45.2.51.31.07.11.07.65-.17 1.32Z"
      />
    </svg>
  )
}
