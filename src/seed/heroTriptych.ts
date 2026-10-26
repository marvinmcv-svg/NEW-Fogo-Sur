/* Brings an already-seeded site up to the triptych hero: uploads the three
   hero reels, points the home at them, shortens the old eyebrow and fills in
   the shared social accounts. Runs from the hero_triptych migration (so the
   live site updates on deploy) and never overwrites anything the team edited. */
import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

import { locales, type Locale } from '../i18n/locales'
import { brandSocial } from '../lib/social'

const REELS = ['hero-fire', 'hero-skewer', 'hero-table']

// The first seed's eyebrow led with the brand name the header already shows.
const OLD_EYEBROW = /^Fogo de Chão · (?=Ventura Sur · )/
const shortEyebrow = (value: string) => value.replace(OLD_EYEBROW, '')

type Entry = { key: string; file: string; poster?: string; altEs: string; altEn: string }

export async function applyHeroTriptych(payload: Payload, req?: Partial<PayloadRequest>) {
  // A fresh database gets all of this from `npm run seed` instead.
  if ((await payload.count({ collection: 'cuts', req })).totalDocs === 0) return

  const root = path.resolve(process.cwd(), 'seed/media')
  const manifest: Entry[] = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))
  const others = locales.filter((l) => l !== 'es')
  const altFor = (e: Entry, l: Locale) => (l === 'es' ? e.altEs : e.altEn)

  const upload = async (file: string, e: Entry, poster?: number) => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: e.altEs, ...(poster ? { poster } : {}) },
      filePath: path.join(root, file),
      locale: 'es',
      req,
    })
    for (const locale of others) {
      await payload.update({ collection: 'media', id: doc.id, data: { alt: altFor(e, locale) }, locale, req })
    }
    return doc.id as number
  }

  const home = await payload.findGlobal({ slug: 'home', depth: 0, locale: 'es', req })
  if (!home.hero?.reels?.length) {
    const reels: number[] = []
    for (const key of REELS) {
      const e = manifest.find((m) => m.key === key)
      if (!e) throw new Error(`seed/media/manifest.json has no "${key}"`)
      const poster = e.poster ? await upload(e.poster, e) : undefined
      reels.push(await upload(e.file, e, poster))
    }
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
