import type { MetadataRoute } from 'next'

import { localeTags, locales } from '../i18n/locales'
import { payload } from '../lib/payload'
import { siteUrl } from '../lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const p = await payload()
  const [cuts, pages] = await Promise.all([
    p.find({ collection: 'cuts', limit: 200, depth: 0 }),
    p.find({ collection: 'pages', limit: 200, depth: 0, where: { _status: { equals: 'published' } } }),
  ])
  const paths = [
    '',
    '/menu',
    '/cortes',
    '/semana-fogo',
    '/eventos',
    '/ubicacion',
    '/reservar',
    ...cuts.docs.map((c) => `/cortes/${c.slug}`),
    ...pages.docs.map((pg) => `/${pg.slug}`),
  ]
  return paths.map((path) => ({
    url: `${base}/es${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
    alternates: { languages: Object.fromEntries(locales.map((l) => [localeTags[l], `${base}/${l}${path}`])) },
  }))
}
