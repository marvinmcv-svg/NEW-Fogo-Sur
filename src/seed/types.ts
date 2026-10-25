import type { Locale } from '../i18n/locales'

// A string written once per site language. Spanish is the source; the other
// five are translations.
export type L = Record<Locale, string>

// Media are referenced by the keys in seed/media/manifest.json
// (e.g. 'hero-carve' for a video, 'fire-skewers' for a photo).
export type MediaKey = string

export type SeedCut = {
  portugueseName: string
  name: L
  tagline: L
  description: L
  tastingNotes: L
  doneness: L
  origin: L
  pairing: L
  image: MediaKey
  video?: MediaKey
  order: number
  featured: boolean
}

export type SeedMenuCategory = { key: string; title: L; intro: L; order: number; image?: MediaKey }

export type SeedMenuItem = {
  category: string // SeedMenuCategory.key
  name: L
  description?: L
  price?: number // Bs. Leave undefined unless confirmed.
  priceNote?: L
  tags?: ('signature' | 'vegetarian' | 'gluten-free' | 'new' | 'sharing')[]
  image?: MediaKey
  order: number
}

export type SeedPromotion = {
  title: L
  highlight: L
  days: ('daily' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[]
  startTime?: string
  endTime?: string
  service: 'lunch' | 'dinner' | 'both' | 'bar'
  description: L
  conditions: L
  image?: MediaKey
  video?: MediaKey
  order: number
}

export type SeedEventPackage = {
  title: L
  description: L
  capacity: L
  features: L[]
  image?: MediaKey
  order: number
}

export type SeedPageHeader = { eyebrow: L; title: L; intro: L; metaDescription: L; media?: MediaKey }

export type SeedContent = {
  settings: {
    branchName: L
    address: L
    whatsappGreeting: L
    parkingNote: L
    seoTitle: L
    seoDescription: L
  }
  navigation: {
    links: { label: L; href: string }[]
    ui: Record<
      | 'reserve'
      | 'reserveWhatsapp'
      | 'menu'
      | 'close'
      | 'language'
      | 'scroll'
      | 'consult'
      | 'perPerson'
      | 'today'
      | 'directions'
      | 'hoursTbd'
      | 'openingIn'
      | 'days'
      | 'hours'
      | 'minutes'
      | 'seconds'
      | 'nowOpen'
      | 'seeAll'
      | 'back'
      | 'flip'
      | 'tastingNotes'
      | 'doneness'
      | 'origin'
      | 'pairing'
      | 'soundOff'
      | 'skip'
      | 'allRights',
      L
    >
    footer: { tagline: L; legal: L }
  }
  home: {
    hero: { eyebrow: L; title: L; subtitle: L; ctaLabel: L; secondaryLabel: L }
    ritual: { heading: L; beats: { kicker: L; title: L; text: L; video: MediaKey }[] }
    cuts: { eyebrow: L; heading: L; intro: L; hint: L; linkLabel: L }
    market: { eyebrow: L; heading: L; text: L; gallery: { image: MediaKey; caption: L }[]; linkLabel: L }
    card: {
      eyebrow: L
      heading: L
      text: L
      yesLabel: L
      yesSub: L
      yesText: L
      noLabel: L
      noSub: L
      noText: L
    }
    bar: { eyebrow: L; heading: L; text: L; clips: { media: MediaKey; caption: L }[] }
    week: { eyebrow: L; heading: L; intro: L }
    visit: { eyebrow: L; heading: L; text: L; ctaLabel: L }
  }
  pages: {
    menu: SeedPageHeader & { pricesNote: L }
    cuts: SeedPageHeader
    week: SeedPageHeader
    events: SeedPageHeader & {
      formTitle: L
      formIntro: L
      formSuccess: L
      formLabels: Record<'name' | 'phone' | 'email' | 'date' | 'guests' | 'eventType' | 'message' | 'submit' | 'error', L>
    }
    visit: SeedPageHeader
    reserve: SeedPageHeader & {
      labels: Record<'name' | 'date' | 'time' | 'guests' | 'occasion' | 'notes' | 'submit' | 'note', L>
      occasions: L[]
      messageTemplate: L
    }
  }
  cuts: SeedCut[]
  menuCategories: SeedMenuCategory[]
  menuItems: SeedMenuItem[]
  promotions: SeedPromotion[]
  eventPackages: SeedEventPackage[]
}
