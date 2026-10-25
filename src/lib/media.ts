import type { Media } from '../payload-types'

export type MediaRef = number | Media | null | undefined

export const asMedia = (ref: MediaRef): Media | null => (ref && typeof ref === 'object' ? ref : null)

export const isVideo = (m: Media | null) => !!m?.mimeType?.startsWith('video/')

export const mediaUrl = (m: Media | null, size?: 'thumb' | 'card' | 'full') => {
  if (!m) return undefined
  const sized = size ? m.sizes?.[size]?.url : undefined
  return sized || m.url || undefined
}

export const posterUrl = (m: Media | null) => {
  if (!m) return undefined
  if (!isVideo(m)) return mediaUrl(m, 'full')
  return mediaUrl(asMedia(m.poster as MediaRef), 'full')
}
