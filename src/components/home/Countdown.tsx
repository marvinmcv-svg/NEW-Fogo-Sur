'use client'

import { useEffect, useState } from 'react'

type Labels = { openingIn: string; days: string; hours: string; minutes: string; seconds: string; nowOpen: string }

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export function Countdown({ target, labels }: { target: string; labels: Labels }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const end = new Date(target).getTime()
  if (Number.isNaN(end)) return null
  // Render nothing until mounted so server and client markup match.
  if (now === null) return <div className="countdown" aria-hidden="true" />
  if (now >= end) return <p className="countdown countdown--open">{labels.nowOpen}</p>

  const t = parts(end - now)
  const cells: [number, string][] = [
    [t.d, labels.days],
    [t.h, labels.hours],
    [t.m, labels.minutes],
    [t.s, labels.seconds],
  ]
  return (
    <div className="countdown" role="timer" aria-live="off">
      <p className="countdown__label">{labels.openingIn}</p>
      <ol className="countdown__cells">
        {cells.map(([value, label]) => (
          <li key={label}>
            <span className="countdown__num">{String(value).padStart(2, '0')}</span>
            <span className="countdown__unit">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
