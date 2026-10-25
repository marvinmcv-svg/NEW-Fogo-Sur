'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import type { Locale } from '../../i18n/locales'
import { LanguageSwitcher } from './LanguageSwitcher'

type NavLink = { label: string; href: string }

type Props = {
  locale: Locale
  brand: ReactNode
  links: NavLink[]
  ui: { reserve: string; menu: string; close: string; language: string }
  whatsappHref: string
  address?: string | null
}

export function Header({ locale, brand, links, ui, whatsappHref, address }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      // Hide while reading downward, come back as soon as the user scrolls up.
      setHidden(y > 400 && y > last + 4)
      if (y < last - 4) setHidden(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) window.__lenis?.stop()
    else window.__lenis?.start()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`)

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
        <Link href={`/${locale}`} className="header__brand" aria-label="Fogo de Chão">
          {brand}
        </Link>
        <nav className="header__nav" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={`/${locale}${l.href}`} className={isActive(l.href) ? 'is-active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header__actions">
          <LanguageSwitcher locale={locale} label={ui.language} />
          <Link href={`/${locale}/reservar`} className="btn btn--yes btn--sm header__reserve">
            <span className="btn__dot" aria-hidden="true" />
            {ui.reserve}
          </Link>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? ui.close : ui.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="site-menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="menu__glow" aria-hidden="true" />
        <nav className="menu__nav" aria-label="Menú">
          <Link href={`/${locale}`} style={{ ['--i' as string]: 0 }}>
            Fogo
          </Link>
          {links.map((l, i) => (
            <Link key={l.href} href={`/${locale}${l.href}`} style={{ ['--i' as string]: i + 1 }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="menu__foot">
          {address ? <p className="menu__address">{address}</p> : null}
          <a className="btn btn--yes" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <span className="btn__dot" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}
