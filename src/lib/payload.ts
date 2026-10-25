import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '../i18n/locales'
import type {
  Cut,
  CutsPage,
  EventPackage,
  EventsPage,
  Home,
  MenuCategory,
  MenuItem,
  MenuPage,
  Navigation,
  Page,
  Promotion,
  ReservePage,
  Setting,
  VisitPage,
  WeekPage,
} from '../payload-types'

export const payload = cache(() => getPayload({ config }))

type GlobalMap = {
  home: Home
  settings: Setting
  navigation: Navigation
  'menu-page': MenuPage
  'cuts-page': CutsPage
  'week-page': WeekPage
  'events-page': EventsPage
  'visit-page': VisitPage
  'reserve-page': ReservePage
}

export const getGlobal = cache(async <K extends keyof GlobalMap>(slug: K, locale: Locale, depth = 2) => {
  const p = await payload()
  return (await p.findGlobal({ slug, locale, depth, fallbackLocale: 'es' })) as GlobalMap[K]
})

export const getCuts = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({ collection: 'cuts', locale, depth: 1, limit: 100, sort: 'order' })
  return res.docs as Cut[]
})

export const getCut = cache(async (slug: string, locale: Locale) => {
  const p = await payload()
  const res = await p.find({ collection: 'cuts', locale, depth: 1, limit: 1, where: { slug: { equals: slug } } })
  return (res.docs[0] as Cut | undefined) ?? null
})

export const getMenu = cache(async (locale: Locale) => {
  const p = await payload()
  const [categories, items] = await Promise.all([
    p.find({ collection: 'menu-categories', locale, depth: 1, limit: 100, sort: 'order' }),
    p.find({
      collection: 'menu-items',
      locale,
      depth: 1,
      limit: 500,
      sort: 'order',
      where: { available: { equals: true } },
    }),
  ])
  return { categories: categories.docs as MenuCategory[], items: items.docs as MenuItem[] }
})

export const getPromotions = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({
    collection: 'promotions',
    locale,
    depth: 1,
    limit: 50,
    sort: 'order',
    where: { active: { equals: true } },
  })
  return res.docs as Promotion[]
})

export const getEventPackages = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({ collection: 'event-packages', locale, depth: 1, limit: 50, sort: 'order' })
  return res.docs as EventPackage[]
})

export const getPage = cache(async (slug: string, locale: Locale, draft = false) => {
  const p = await payload()
  const res = await p.find({
    collection: 'pages',
    locale,
    depth: 2,
    limit: 1,
    draft,
    where: { slug: { equals: slug } },
  })
  return (res.docs[0] as Page | undefined) ?? null
})

export const getNavPages = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({
    collection: 'pages',
    locale,
    depth: 0,
    limit: 20,
    where: { showInNav: { equals: true }, _status: { equals: 'published' } },
  })
  return res.docs as Page[]
})
