import type { Media } from '../payload-types'

export type MediaRef = number | Media | null | undefined

export const asMedia = (ref: MediaRef): Media | null => (ref && typeof ref === 'object' ? ref : null)

export const isVideo = (m: Media | null) => !!m?.mimeType?.startsWith('video/')

// Files are served with a one-year cache, so a replaced file under the same
// name would keep showing the old copy. The document's updatedAt versions the URL.
const versioned = (url: string, m: Media) => {
  const v = Date.parse(m.updatedAt)
  return Number.isNaN(v) ? url : `${url}${url.includes('?') ? '&' : '?'}v=${v.toString(36)}`
}

export const mediaUrl = (m: Media | null, size?: 'thumb' | 'card' | 'full') => {
  if (!m) return undefined
  const sized = size ? m.sizes?.[size]?.url : undefined
  const url = sized || m.url
  return url ? versioned(url, m) : undefined
}

export const posterUrl = (m: Media | null) => {
  if (!m) return undefined
  if (!isVideo(m)) return mediaUrl(m, 'full')
  return mediaUrl(asMedia(m.poster as MediaRef), 'full')
}
