'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { localeNames, locales, type Locale } from '../../i18n/locales'

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const hrefFor = (next: Locale) => {
    const parts = pathname.split('/')
    parts[1] = next
    return parts.join('/') || `/${next}`
  }

  const remember = (next: Locale) => {
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <div className={`lang ${open ? 'is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="lang__toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${localeNames[locale]}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang__code">{locale.toUpperCase()}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <ul className="lang__list" role="listbox" aria-label={label}>
        {locales.map((code) => (
          <li key={code} role="option" aria-selected={code === locale}>
            {/* Full navigation (not client-side) so <html lang> and fonts update. */}
            <a href={hrefFor(code)} hrefLang={code} lang={code} onClick={() => remember(code)}>
              <span>{localeNames[code]}</span>
              <span className="lang__abbr">{code.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
