import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Brand } from '../../../components/layout/Brand'
import { Footer } from '../../../components/layout/Footer'
import { Header } from '../../../components/layout/Header'
import { LivePreviewListener } from '../../../components/layout/LivePreviewListener'
import { SkewerProgress } from '../../../components/layout/SkewerProgress'
import { googleFontsHref, ThemeStyle } from '../../../components/layout/ThemeStyle'
import { WhatsAppFab } from '../../../components/layout/WhatsAppFab'
import { RevealObserver } from '../../../components/motion/RevealObserver'
import { SmoothScroll } from '../../../components/motion/SmoothScroll'
import { isLocale, localeTags, locales } from '../../../i18n/locales'
import { asMedia, mediaUrl } from '../../../lib/media'
import { getGlobal, getNavPages } from '../../../lib/payload'
import { siteUrl } from '../../../lib/seo'
import { whatsappLink } from '../../../lib/whatsapp'
import '../styles.css'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [settings, nav, navPages] = await Promise.all([
    getGlobal('settings', locale, 1),
    getGlobal('navigation', locale, 0),
    getNavPages(locale),
  ])

  const whatsappHref = whatsappLink(settings.whatsapp, settings.whatsappGreeting)
  const links = (nav.links ?? []).map((l) => ({ label: l.label, href: l.href }))
  const extraLinks = navPages.map((p) => ({ label: p.title, href: `/${p.slug}` }))
  const favicon = mediaUrl(asMedia(settings.favicon))
  const ui = nav.ui ?? {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: `${settings.restaurantName ?? 'Fogo de Chão'} ${settings.branchName ?? ''}`.trim(),
    servesCuisine: ['Brazilian', 'Steakhouse', 'Churrasco'],
    url: `${siteUrl()}/${locale}`,
    telephone: settings.phone || settings.whatsapp,
    acceptsReservations: 'True',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: (settings.address ?? '').split('\n')[0],
      addressLocality: 'Santa Cruz de la Sierra',
      addressCountry: 'BO',
    },
    openingHours: (settings.hours ?? []).map((h) => `${h.days} ${h.time}`),
  }

  return (
    <html lang={localeTags[locale]} data-locale={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsHref(settings, locale)} />
        {favicon ? <link rel="icon" href={favicon} /> : null}
        <meta name="theme-color" content={settings.colors?.charcoal || '#0E0B09'} />
        <ThemeStyle settings={settings} locale={locale} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {ui.skip}
        </a>
        <SmoothScroll />
        <RevealObserver />
        <LivePreviewListener />
        <Header
          locale={locale}
          brand={<Brand settings={settings} />}
          links={[...links, ...extraLinks]}
          ui={{
            reserve: ui.reserve ?? 'Reservar',
            menu: ui.menu ?? 'Menú',
            close: ui.close ?? 'Cerrar',
            language: ui.language ?? 'Idioma',
          }}
          whatsappHref={whatsappHref}
          address={settings.address}
        />
        <SkewerProgress />
        <main id="main" className="main">
          {children}
        </main>
        <Footer locale={locale} settings={settings} nav={nav} whatsappHref={whatsappHref} extraLinks={extraLinks} />
        <WhatsAppFab href={whatsappHref} label={ui.reserveWhatsapp ?? 'WhatsApp'} />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  )
}
