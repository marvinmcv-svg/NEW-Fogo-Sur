export const locales = ['es', 'en', 'pt', 'fr', 'de', 'zh'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
}

// BCP 47 tags for <html lang>, Intl formatting and hreflang
export const localeTags: Record<Locale, string> = {
  es: 'es-BO',
  en: 'en',
  pt: 'pt-BR',
  fr: 'fr',
  de: 'de',
  zh: 'zh-Hans',
}

export const isLocale = (value: string | undefined): value is Locale =>
  !!value && (locales as readonly string[]).includes(value)

export const timeZone = 'America/La_Paz'
