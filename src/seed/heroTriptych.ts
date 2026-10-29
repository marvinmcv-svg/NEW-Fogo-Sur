/* Brings an already-seeded site up to the triptych hero: uploads the three
   hero reels, points the home at them, shortens the old eyebrow and fills in
   the shared social accounts. Runs from the hero_triptych migration (so the
   live site updates on deploy) and never overwrites anything the team edited.
   `replaceHeroReels` swaps the live hero onto the current reels (hero_reels_v2). */
import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

import { locales, type Locale } from '../i18n/locales'
import { brandSocial } from '../lib/social'

// The hero's reels, in order (keys in seed/media/manifest.json).
export const HERO_REELS = ['hero-experiencia', 'hero-esencia', 'hero-rodizio']

// The first seed's eyebrow led with the brand name the header already shows.
const OLD_EYEBROW = /^Fogo de Chão · (?=Ventura Sur · )/
const shortEyebrow = (value: string) => value.replace(OLD_EYEBROW, '')

type Entry = { key: string; file: string; poster?: string; altEs: string; altEn: string }

const seededSite = async (payload: Payload, req?: Partial<PayloadRequest>) =>
  (await payload.count({ collection: 'cuts', req })).totalDocs > 0

// Uploads one seed media entry (a photo, or a video with its poster) with its
// alt text in every locale and returns its id. Every create/update runs on its
// own request: the cloud-storage plugin remembers the first file of a request
// and re-uploads it on later changes made on that request, so sharing one
// request (e.g. a migration's) stored the first file under every later name.
async function uploadSeedMedia(payload: Payload, key: string) {
  const root = path.resolve(process.cwd(), 'seed/media')
  const manifest: Entry[] = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))
  const e = manifest.find((m) => m.key === key)
  if (!e) throw new Error(`seed/media/manifest.json has no "${key}"`)
  const others = locales.filter((l) => l !== 'es')
  const altFor = (l: Locale) => (l === 'es' ? e.altEs : e.altEn)

  const upload = async (file: string, poster?: number) => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: e.altEs, ...(poster ? { poster } : {}) },
      filePath: path.join(root, file),
      locale: 'es',
    })
    for (const locale of others) {
      await payload.update({ collection: 'media', id: doc.id, data: { alt: altFor(locale) }, locale })
    }
    return doc.id as number
  }

  const poster = e.poster ? await upload(e.poster) : undefined
  return upload(e.file, poster)
}

// The hero reels, in order, uploading each one only if the library lacks it.
async function heroReelIds(payload: Payload) {
  const ids: number[] = []
  for (const key of HERO_REELS) {
    const found = await payload.find({
      collection: 'media',
      where: { and: [{ filename: { like: key } }, { mimeType: { like: 'video' } }] },
      sort: '-createdAt',
      limit: 1,
      depth: 0,
    })
    ids.push((found.docs[0]?.id as number | undefined) ?? (await uploadSeedMedia(payload, key)))
  }
  return ids
}

const uploadHeroReels = async (payload: Payload) => {
  const ids: number[] = []
  for (const key of HERO_REELS) ids.push(await uploadSeedMedia(payload, key))
  return ids
}

export async function replaceHeroReels(payload: Payload, req?: Partial<PayloadRequest>) {
  if (!(await seededSite(payload, req))) return
  const home = await payload.findGlobal({ slug: 'home', depth: 1, locale: 'es', req })
  // Already on these reels (e.g. a database that ran every migration from scratch).
  const current = (home.hero?.reels ?? []).map((r) => (typeof r === 'object' && r ? r.filename ?? '' : ''))
  if (current.length === HERO_REELS.length && current.every((f, i) => f.startsWith(HERO_REELS[i]))) return
  const reels = await uploadHeroReels(payload)
  await payload.updateGlobal({ slug: 'home', data: { hero: { ...home.hero, reels } }, locale: 'es', req })
}

// Every reel file ever uploaded for the hero (the first triptych and the current one).
const HERO_FILES = ['hero-fire', 'hero-skewer', 'hero-table', ...HERO_REELS]

// Live repair: the earlier migrations uploaded on a shared request, so every
// hero "video" in Blob storage holds the same poster image. Delete those media
// (and their blobs), upload the reels again one request each, point the hero at them.
export async function repairHeroReels(payload: Payload) {
  if (!(await seededSite(payload))) return
  const broken = await payload.find({
    collection: 'media',
    where: { or: HERO_FILES.map((key) => ({ filename: { like: key } })) },
    limit: 100,
    depth: 0,
    pagination: false,
  })
  for (const doc of broken.docs) await payload.delete({ collection: 'media', id: doc.id })
  const reels = await uploadHeroReels(payload)
  const home = await payload.findGlobal({ slug: 'home', depth: 0, locale: 'es' })
  await payload.updateGlobal({ slug: 'home', data: { hero: { ...home.hero, reels } }, locale: 'es' })
}

// Hero gets the "experiencia" reel first (desktop left panel, the only one on a
// phone); the Market Table gets its new overhead photo (hero_reels_v4).
export async function applyHeroExperience(payload: Payload) {
  if (!(await seededSite(payload))) return
  const reels = await heroReelIds(payload)
  const marketImage = await uploadSeedMedia(payload, 'market-table')
  const home = await payload.findGlobal({ slug: 'home', depth: 0, locale: 'es' })
  await payload.updateGlobal({
    slug: 'home',
    data: { hero: { ...home.hero, reels }, market: { ...home.market, heroImage: marketImage } },
    locale: 'es',
  })
}

export async function applyHeroTriptych(payload: Payload, req?: Partial<PayloadRequest>) {
  // A fresh database gets all of this from `npm run seed` instead.
  if (!(await seededSite(payload, req))) return

  const home = await payload.findGlobal({ slug: 'home', depth: 0, locale: 'es', req })
  if (!home.hero?.reels?.length) {
    const reels = await uploadHeroReels(payload)
    await payload.updateGlobal({ slug: 'home', data: { hero: { ...home.hero, reels } }, locale: 'es', req })
  }

  for (const locale of locales) {
    const doc = await payload.findGlobal({ slug: 'home', depth: 0, locale, fallbackLocale: false, req })
    const eyebrow = doc.hero?.eyebrow
    if (eyebrow && OLD_EYEBROW.test(eyebrow)) {
      await payload.updateGlobal({ slug: 'home', data: { hero: { ...doc.hero, eyebrow: shortEyebrow(eyebrow) } }, locale, req })
    }
  }

  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, req })
  const social = { ...settings.social }
  let changed = false
  for (const [key, url] of Object.entries(brandSocial) as [keyof typeof social, string][]) {
    if (!social[key]) {
      social[key] = url
      changed = true
    }
  }
  if (changed) await payload.updateGlobal({ slug: 'settings', data: { social }, req })
}
