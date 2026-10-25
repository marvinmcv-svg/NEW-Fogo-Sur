import type { CutCardData } from '../components/ui/CutCard'
import type { WeekPromo } from '../components/ui/WeekStrip'
import type { Cut, Navigation, Promotion } from '../payload-types'
import { asMedia, isVideo, mediaUrl, posterUrl } from './media'

type UI = NonNullable<Navigation['ui']>

export const toCutCard = (c: Cut): CutCardData => {
  const img = asMedia(c.image)
  const vid = asMedia(c.video)
  return {
    slug: c.slug ?? '',
    name: c.name,
    portugueseName: c.portugueseName,
    tagline: c.tagline,
    tastingNotes: c.tastingNotes,
    doneness: c.doneness,
    origin: c.origin,
    pairing: c.pairing,
    image: mediaUrl(img, 'card') || posterUrl(vid),
    video: vid && isVideo(vid) ? mediaUrl(vid) : undefined,
    alt: img?.alt || vid?.alt,
  }
}

export const cutLabels = (ui: UI) => ({
  flip: ui.flip ?? 'Flip',
  tastingNotes: ui.tastingNotes ?? '',
  doneness: ui.doneness ?? '',
  origin: ui.origin ?? '',
  pairing: ui.pairing ?? '',
  seeAll: ui.seeAll ?? '',
})

export const countdownLabels = (ui: UI) => ({
  openingIn: ui.openingIn ?? '',
  days: ui.days ?? '',
  hours: ui.hours ?? '',
  minutes: ui.minutes ?? '',
  seconds: ui.seconds ?? '',
  nowOpen: ui.nowOpen ?? '',
})

export const promoTime = (p: Promotion) =>
  p.startTime && p.endTime ? `${p.startTime}–${p.endTime}` : p.startTime || p.endTime || null

export const toWeekPromos = (promos: Promotion[]): WeekPromo[] =>
  promos.map((p) => ({
    id: p.id,
    title: p.title,
    highlight: p.highlight,
    days: p.days ?? [],
    time: promoTime(p),
    description: p.description,
    conditions: p.conditions,
    image: mediaUrl(asMedia(p.image), 'card'),
  }))

export const directionsUrl = (query: string | null | undefined) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Mall Ventura Sur Santa Cruz de la Sierra')}`
