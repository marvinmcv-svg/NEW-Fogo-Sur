import type { Setting } from '../../payload-types'
import { asMedia, mediaUrl } from '../../lib/media'

// Logo from the CMS when uploaded; otherwise a typographic wordmark in the
// display face (FOGO de CHÃO, with the small "de" like the original mark).
export function Brand({ settings, className }: { settings: Setting; className?: string }) {
  const logo = asMedia(settings.logo)
  const url = mediaUrl(logo)
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={`brand brand--img ${className ?? ''}`} src={url} alt={settings.restaurantName || 'Fogo de Chão'} />
  }
  return (
    <span className={`brand ${className ?? ''}`} aria-label={settings.restaurantName || 'Fogo de Chão'}>
      <span aria-hidden="true">
        FOGO<small> de </small>CHÃO
      </span>
    </span>
  )
}
