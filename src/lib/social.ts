import type { Setting } from '../payload-types'

export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok'

// Ventura Sur shares the accounts of the first restaurant (Boulevard · Ventura
// Mall). Used as the admin defaults and by the seed; the admin can change them.
export const brandSocial: Partial<Record<SocialNetwork, string>> = {
  instagram: 'https://www.instagram.com/fogodechao.bo/',
  facebook: 'https://www.facebook.com/FogoBolivia/',
}

const networks: { key: SocialNetwork; label: string; host: string; profile: (handle: string) => string }[] = [
  { key: 'instagram', label: 'Instagram', host: 'instagram.com', profile: (h) => `https://www.instagram.com/${h}/` },
  { key: 'facebook', label: 'Facebook', host: 'facebook.com', profile: (h) => `https://www.facebook.com/${h}` },
  { key: 'tiktok', label: 'TikTok', host: 'tiktok.com', profile: (h) => `https://www.tiktok.com/@${h}` },
]

// The admin may paste a full URL, a URL without https://, or just a handle
// ("@fogodechao.bo"); every form becomes a working profile link.
export const socialUrl = (network: SocialNetwork, value?: string | null): string | null => {
  const v = (value ?? '').trim()
  if (!v) return null
  const n = networks.find((x) => x.key === network)!
  if (/^https?:\/\//i.test(v)) return v
  if (v.toLowerCase().includes(n.host)) return `https://${v.replace(/^\/+/, '')}`
  const handle = v.replace(/^@/, '').replace(/^\/+|\/+$/g, '')
  return handle ? n.profile(handle) : null
}

export type SocialLink = { key: SocialNetwork; label: string; href: string }

export const socialLinks = (settings: Pick<Setting, 'social'>): SocialLink[] =>
  networks.flatMap((n) => {
    const href = socialUrl(n.key, settings.social?.[n.key])
    return href ? [{ key: n.key, label: n.label, href }] : []
  })
