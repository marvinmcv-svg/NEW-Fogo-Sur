/* Seeds the CMS with the graded media (seed/media) and the 6-language copy
   (src/seed/content.ts).

   Local database:   npm run seed
   Deployed site:    SEED_REMOTE_URL=https://… SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run seed

   Refuses to touch a database that already has content unless SEED_FORCE=1. */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type { CollectionSlug, GlobalSlug } from 'payload'

import { locales, type Locale } from '../i18n/locales'
import { brandSocial } from '../lib/social'
import { localClient, remoteClient, type SeedClient } from './clients'
import { HERO_REELS } from './heroTriptych'
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

async function seed(client: SeedClient) {
  const createLocalized = async (collection: CollectionSlug, data: Record<string, unknown>) => {
    const doc = await client.create(collection, localize(data, 'es') as Record<string, unknown>, 'es')
    for (const locale of others) {
      await client.update(collection, doc.id, localize(data, locale, doc) as Record<string, unknown>, locale)
    }
    return doc
  }

  const updateGlobalLocalized = async (slug: GlobalSlug, data: Record<string, unknown>) => {
    const doc = await client.updateGlobal(slug, localize(data, 'es') as Record<string, unknown>, 'es')
    for (const locale of others) {
      await client.updateGlobal(slug, localize(data, locale, doc) as Record<string, unknown>, locale)
    }
  }

  const uploadLocalized = async (filePath: string, alt: L, poster?: number | string) => {
    const doc = await client.upload(filePath, { alt: alt.es, ...(poster ? { poster } : {}) }, 'es')
    for (const locale of others) await client.update('media', doc.id, { alt: alt[locale] }, locale)
    return doc.id
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@fogodechao-venturasur.com'
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
  const admin = await client.ensureAdmin(email, password)
  if (admin === 'created') client.log(`Admin user created → ${email} / ${password}  (change it after the first login)`)

  if ((await client.count('cuts')) > 0) {
    if (process.env.SEED_FORCE !== '1') throw new Error('The database already has content. Re-run with SEED_FORCE=1 to wipe it and seed again.')
    client.log('SEED_FORCE=1: wiping existing content…')
    for (const c of ['pages', 'promotions', 'event-packages', 'menu-items', 'menu-categories', 'cuts', 'inquiries', 'media'] as CollectionSlug[]) {
      await client.wipe(c)
    }
  }

  client.log(`Uploading ${manifest.length} media files…`)
  const media = new Map<string, number | string>()
  // pt/fr/de/zh visitors get the English alt text rather than Spanish.
  const alt = (e: ManifestEntry): L => ({ es: e.altEs, en: e.altEn, pt: e.altEn, fr: e.altEn, de: e.altEn, zh: e.altEn })
  for (const entry of manifest) {
    const poster = entry.type === 'video' && entry.poster ? await uploadLocalized(path.join(root, entry.poster), alt(entry)) : undefined
    media.set(entry.key, await uploadLocalized(path.join(root, entry.file), alt(entry), poster))
    process.stdout.write('.')
  }
  process.stdout.write('\n')
  const m = (key?: string) => {
    if (!key) return undefined
    const id = media.get(key)
    if (!id) throw new Error(`Seed references unknown media key "${key}"`)
    return id
  }

  client.log('Cuts…')
  for (const cut of content.cuts) {
    await createLocalized('cuts', { ...cut, image: m(cut.image), video: m(cut.video) })
  }

  client.log('Menu…')
  const categoryIds = new Map<string, number | string>()
  for (const cat of content.menuCategories) {
    const doc = await createLocalized('menu-categories', { ...cat, image: m(cat.image) })
    categoryIds.set(cat.key, doc.id)
  }
  const itemIdsByCategory = new Map<string, (number | string)[]>()
  for (const item of content.menuItems) {
    const category = categoryIds.get(item.category)
    if (!category) throw new Error(`Menu item references unknown category "${item.category}"`)
    const doc = await createLocalized('menu-items', { ...item, category, image: m(item.image) })
    itemIdsByCategory.set(item.category, [...(itemIdsByCategory.get(item.category) ?? []), doc.id])
  }

  client.log('Promotions & events…')
  for (const promo of content.promotions) {
    await createLocalized('promotions', { ...promo, image: m(promo.image), video: m(promo.video) })
  }
  for (const pkg of content.eventPackages) {
    await createLocalized('event-packages', { ...pkg, image: m(pkg.image), features: pkg.features.map((text) => ({ text })) })
  }

  client.log('Globals…')
  const s = content.settings
  await updateGlobalLocalized('settings', {
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
    // Both branches share the accounts of the first restaurant (Boulevard · Ventura Mall).
    social: brandSocial,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    ogImage: m('fire-skewers'),
  })

  await updateGlobalLocalized('navigation', content.navigation as unknown as Record<string, unknown>)

  const h = content.home
  const barDrinks = [...(itemIdsByCategory.get('bar') ?? []).slice(0, 3), ...(itemIdsByCategory.get('happy') ?? []).slice(0, 1)]
  await updateGlobalLocalized('home', {
    hero: { ...h.hero, reels: HERO_REELS.map((key) => m(key)) },
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
  await updateGlobalLocalized('menu-page', header(pg.menu))
  await updateGlobalLocalized('cuts-page', header(pg.cuts))
  await updateGlobalLocalized('week-page', header(pg.week))
  await updateGlobalLocalized('events-page', header(pg.events))
  await updateGlobalLocalized('visit-page', header(pg.visit))
  await updateGlobalLocalized('reserve-page', { ...header(pg.reserve), occasions: pg.reserve.occasions.map((label) => ({ label })) })

  client.log('Seed complete.')
}

async function main() {
  const remote = process.env.SEED_REMOTE_URL
  let client: SeedClient
  if (remote) {
    client = remoteClient(remote)
  } else {
    const { getPayload } = await import('payload')
    const { default: config } = await import('../payload.config')
    client = localClient(await getPayload({ config }))
  }
  await seed(client)
  process.exit(0)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
