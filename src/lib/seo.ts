import type { Metadata } from 'next'

import { localeTags, locales, type Locale } from '../i18n/locales'
import type { Setting } from '../payload-types'
import { asMedia, mediaUrl, posterUrl } from './media'

export const siteUrl = () => (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

type Args = {
  locale: Locale
  path: string // without locale, '' for home
  title?: string | null
  description?: string | null
  settings: Setting
  image?: string
}

export const buildMetadata = ({ locale, path, title, description, settings, image }: Args): Metadata => {
  const base = siteUrl()
  const og = image || posterUrl(asMedia(settings.ogImage)) || mediaUrl(asMedia(settings.ogImage))
  const fullTitle = title ? `${title} · ${settings.restaurantName ?? 'Fogo de Chão'}` : settings.seoTitle || 'Fogo de Chão'
  const desc = description || settings.seoDescription || undefined
  return {
    metadataBase: new URL(base),
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [localeTags[l], `/${l}${path}`]),
        ['x-default', `/es${path}`],
      ]),
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: `/${locale}${path}`,
      siteName: settings.restaurantName ?? 'Fogo de Chão',
      locale: localeTags[locale].replace('-', '_'),
      type: 'website',
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: og ? [og] : undefined },
  }
}
