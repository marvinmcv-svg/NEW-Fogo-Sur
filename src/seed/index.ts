/* Seeds the CMS with the graded media (seed/media) and the 6-language copy
   (src/seed/content.ts). Run with:  npm run seed
   Refuses to touch a database that already has content unless SEED_FORCE=1. */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload, type CollectionSlug, type GlobalSlug, type Payload } from 'payload'

import config from '../payload.config'
import { locales, type Locale } from '../i18n/locales'
import { content } from './content'
import type { L } from './types'

type ManifestEntry = {
  key: string
  type: 'video' | 'photo'
  file: string
  poster?: string
  altEs: string
  altEn: string
}

const root = path.resolve(process.cwd(), 'seed/media')
const manifest: ManifestEntry[] = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))

const isL = (v: unknown): v is L =>
  !!v && typeof v === 'object' && !Array.isArray(v) && locales.every((l) => typeof (v as Record<string, unknown>)[l] === 'string')

/** Resolve every L in `value` to one locale. Array rows keep the ids Payload
 *  assigned on the first (Spanish) write, so other locales update the same rows. */
const localize = (value: unknown, locale: Locale, existing?: unknown): unknown => {
  if (isL(value)) return value[locale]
  if (Array.isArray(value)) {
    const prev = Array.isArray(existing) ? existing : []
    return value.map((item, i) => {
      const out = localize(item, locale, prev[i])
      const id = (prev[i] as { id?: string } | undefined)?.id
      return id && out && typeof out === 'object' && !Array.isArray(out) ? { ...out, id } : out
    })
  }
  if (value && typeof value === 'object') {
    const prev = (existing && typeof existing === 'object' ? existing : {}) as Record<string, unknown>
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, locale, prev[k])]))
  }
  return value
}

const others = locales.filter((l) => l !== 'es')

async function createLocalized(payload: Payload, collection: CollectionSlug, data: Record<string, unknown>) {
  const doc = await payload.create({ collection, locale: 'es', data: localize(data, 'es') as never, depth: 0 })
  for (const locale of others) {
    await payload.update({ collection, id: doc.id, locale, data: localize(data, locale, doc) as never, depth: 0 })
  }
  return doc
}

async function updateGlobalLocalized(payload: Payload, slug: GlobalSlug, data: Record<string, unknown>) {
  const doc = await payload.updateGlobal({ slug, locale: 'es', data: localize(data, 'es') as never, depth: 0 })
  for (const locale of others) {
    await payload.updateGlobal({ slug, locale, data: localize(data, locale, doc) as never, depth: 0 })
  }
}

async function uploadMedia(payload: Payload) {
  const ids = new Map<string, number>()
  const alt = (e: ManifestEntry): L => ({ es: e.altEs, en: e.altEn, pt: e.altEn, fr: e.altEn, de: e.altEn, zh: e.altEn })

  for (const entry of manifest) {
    let posterId: number | undefined
    if (entry.type === 'video' && entry.poster) {
      const poster = await createLocalizedUpload(payload, path.join(root, entry.poster), alt(entry))
      posterId = poster
    }
    const id = await createLocalizedUpload(payload, path.join(root, entry.file), alt(entry), posterId)
    ids.set(entry.key, id)
    process.stdout.write('.')
  }
  process.stdout.write('\n')
  return ids
}

async function createLocalizedUpload(payload: Payload, filePath: string, alt: L, poster?: number) {
  const doc = await payload.create({
    collection: 'media',
    locale: 'es',
    data: { alt: alt.es, ...(poster ? { poster } : {}) },
    filePath,
    depth: 0,
  })
  for (const locale of others) {
    await payload.update({ collection: 'media', id: doc.id, locale, data: { alt: alt[locale] }, depth: 0 })
  }
  return doc.id as number
}

async function wipe(payload: Payload) {
  const collections: CollectionSlug[] = ['pages', 'promotions', 'event-packages', 'menu-items', 'menu-categories', 'cuts', 'inquiries', 'media']
  for (const collection of collections) {
    await payload.delete({ collection, where: { id: { exists: true } }, depth: 0 })
  }
}

async function run() {
  const payload = await getPayload({ config })

  const existing = await payload.count({ collection: 'cuts' })
  if (existing.totalDocs > 0 && process.env.SEED_FORCE !== '1') {
    payload.logger.error('The database already has content. Re-run with SEED_FORCE=1 to wipe it and seed again.')
    process.exit(1)
  }
  if (existing.totalDocs > 0) {
    payload.logger.warn('SEED_FORCE=1: wiping existing content…')
    await wipe(payload)
  }

  payload.logger.info(`Uploading ${manifest.length} media files…`)
  const media = await uploadMedia(payload)
  const m = (key?: string) => {
    if (!key) return undefined
    const id = media.get(key)
    if (!id) throw new Error(`Seed references unknown media key "${key}"`)
    return id
  }

  payload.logger.info('Cuts…')
  for (const cut of content.cuts) {
    await createLocalized(payload, 'cuts', { ...cut, image: m(cut.image), video: m(cut.video) })
  }

  payload.logger.info('Menu…')
  const categoryIds = new Map<string, number>()
  for (const cat of content.menuCategories) {
    const doc = await createLocalized(payload, 'menu-categories', { ...cat, image: m(cat.image) })
    categoryIds.set(cat.key, doc.id as number)
  }
  const itemIdsByCategory = new Map<string, number[]>()
  for (const item of content.menuItems) {
    const category = categoryIds.get(item.category)
    if (!category) throw new Error(`Menu item references unknown category "${item.category}"`)
    const doc = await createLocalized(payload, 'menu-items', { ...item, category, image: m(item.image) })
    itemIdsByCategory.set(item.category, [...(itemIdsByCategory.get(item.category) ?? []), doc.id as number])
  }

  payload.logger.info('Promotions & events…')
  for (const promo of content.promotions) {
    await createLocalized(payload, 'promotions', { ...promo, image: m(promo.image), video: m(promo.video) })
  }
  for (const pkg of content.eventPackages) {
    await createLocalized(payload, 'event-packages', {
      ...pkg,
      image: m(pkg.image),
      features: pkg.features.map((text) => ({ text })),
    })
  }

  payload.logger.info('Globals…')
  const s = content.settings
  await updateGlobalLocalized(payload, 'settings', {
    restaurantName: 'Fogo de Chão',
    branchName: s.branchName,
    status: 'coming-soon',
    // Placeholder: the mall opens at the end of October 2026. Confirm the
    // restaurant's real opening date/time in the admin.
    openingDate: '2026-10-31T19:00:00-04:00',
    address: s.address,
    mapQuery: 'Mall Ventura Sur, Doble Vía a La Guardia, Santa Cruz de la Sierra, Bolivia',
    parkingNote: s.parkingNote,
    whatsapp: '+59177165787',
    whatsappGreeting: s.whatsappGreeting,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    ogImage: m('fire-skewers'),
  })

  await updateGlobalLocalized(payload, 'navigation', content.navigation as unknown as Record<string, unknown>)

  const h = content.home
  const barDrinks = [...(itemIdsByCategory.get('bar') ?? []).slice(0, 3), ...(itemIdsByCategory.get('happy') ?? []).slice(0, 1)]
  await updateGlobalLocalized(payload, 'home', {
    hero: { ...h.hero, introVideo: m('hero-flame'), loopVideo: m('hero-carve') },
    ritual: { enabled: true, heading: h.ritual.heading, beats: h.ritual.beats.map((b) => ({ ...b, video: m(b.video) })) },
    cuts: { enabled: true, ...h.cuts },
    market: {
      enabled: true,
      ...h.market,
      heroImage: m('market-chandeliers'),
      video: m('market-overhead'),
      gallery: h.market.gallery.map((g) => ({ image: m(g.image), caption: g.caption })),
    },
    card: { enabled: true, ...h.card, video: m('service-table') },
    bar: { enabled: true, ...h.bar, clips: h.bar.clips.map((c) => ({ media: m(c.media), caption: c.caption })), highlights: barDrinks },
    week: { enabled: true, ...h.week },
    visit: { enabled: true, ...h.visit, media: m('exterior-night') },
  })

  const pg = content.pages
  const header = (p: { media?: string }) => ({ ...p, media: m(p.media) })
  await updateGlobalLocalized(payload, 'menu-page', header(pg.menu))
  await updateGlobalLocalized(payload, 'cuts-page', header(pg.cuts))
  await updateGlobalLocalized(payload, 'week-page', header(pg.week))
  await updateGlobalLocalized(payload, 'events-page', header(pg.events))
  await updateGlobalLocalized(payload, 'visit-page', header(pg.visit))
  await updateGlobalLocalized(payload, 'reserve-page', {
    ...header(pg.reserve),
    occasions: pg.reserve.occasions.map((label) => ({ label })),
  })

  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@fogodechao-venturasur.com'
    const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
    await payload.create({ collection: 'users', data: { email, password, name: 'Administrador', role: 'admin' } })
    payload.logger.info(`Admin user created → ${email} / ${password}  (change it after the first login)`)
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
