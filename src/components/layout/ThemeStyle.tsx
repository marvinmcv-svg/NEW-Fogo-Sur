import type { Setting } from '../../payload-types'

const safe = (value: string | null | undefined, fallback: string) =>
  value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback

const family = (value: string | null | undefined, fallback: string) =>
  (value || fallback).replace(/[^a-zA-Z0-9 ]/g, '')

// Brand tokens come from the CMS (Ajustes generales → Marca) so the official
// palette and typefaces can be swapped without touching code.
export function ThemeStyle({ settings, locale }: { settings: Setting; locale: string }) {
  const c = settings.colors ?? {}
  const display = family(settings.fonts?.display, 'Cormorant Garamond')
  const body = family(settings.fonts?.body, 'Manrope')
  const zhDisplay = locale === 'zh' ? ", 'Noto Serif SC'" : ''
  const zhBody = locale === 'zh' ? ", 'Noto Sans SC'" : ''
  const css = `:root{
--charcoal:${safe(c.charcoal, '#0E0B09')};
--ember:${safe(c.ember, '#E2571E')};
--gold:${safe(c.gold, '#C9A24A')};
--bone:${safe(c.bone, '#EFE6D8')};
--paper:${safe(c.paper, '#F4EDE2')};
--ink:${safe(c.ink, '#1B1512')};
--card-yes:${safe(c.cardYes, '#3E9B57')};
--card-no:${safe(c.cardNo, '#C8433B')};
--font-display:'${display}'${zhDisplay}, 'Times New Roman', serif;
--font-body:'${body}'${zhBody}, system-ui, -apple-system, 'Segoe UI', sans-serif;
}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

export const googleFontsHref = (settings: Setting, locale: string) => {
  const display = family(settings.fonts?.display, 'Cormorant Garamond')
  const body = family(settings.fonts?.body, 'Manrope')
  const families = [
    `family=${display.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;1,400`,
    `family=${body.replace(/ /g, '+')}:wght@300;400;500;600;700`,
  ]
  if (locale === 'zh') families.push('family=Noto+Serif+SC:wght@500;700', 'family=Noto+Sans+SC:wght@400;500')
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}
