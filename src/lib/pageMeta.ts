import type { Metadata } from 'next'

import { isLocale } from '../i18n/locales'
import { getGlobal } from './payload'
import { asMedia, posterUrl } from './media'
import { buildMetadata } from './seo'

type PageGlobal = 'menu-page' | 'cuts-page' | 'week-page' | 'events-page' | 'visit-page' | 'reserve-page'

export const pageMetadata =
  (slug: PageGlobal, path: string) =>
  async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params
    if (!isLocale(locale)) return {}
    const [page, settings] = await Promise.all([getGlobal(slug, locale, 1), getGlobal('settings', locale, 1)])
    return buildMetadata({
      locale,
      path,
      title: page.title?.replace(/\//g, ' '),
      description: page.metaDescription,
      settings,
      image: posterUrl(asMedia(page.media)),
    })
  }
