import { localeTags, type Locale } from '../i18n/locales'

export const formatPrice = (value: number | null | undefined, locale: Locale) => {
  if (value === null || value === undefined) return null
  const n = new Intl.NumberFormat(localeTags[locale], { maximumFractionDigits: 2 }).format(value)
  return `Bs ${n}`
}

// Titles use "/" in the CMS to mark deliberate line breaks.
export const splitLines = (value: string | null | undefined) =>
  (value || '').split('/').map((s) => s.trim()).filter(Boolean)
