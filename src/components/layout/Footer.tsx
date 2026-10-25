import Link from 'next/link'

import { localeNames, locales, type Locale } from '../../i18n/locales'
import type { Navigation, Setting } from '../../payload-types'
import { EmberField } from '../motion/EmberField'
import { Brand } from './Brand'
import { WhatsAppIcon } from './WhatsAppFab'

// Line icons in the lucide style (stroke = currentColor) so they sit with the type.
const socialIcons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  TikTok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.9 2.3 4.7 5.5 5" />
    </svg>
  ),
}

type Props = { locale: Locale; settings: Setting; nav: Navigation; whatsappHref: string; extraLinks: { label: string; href: string }[] }

export function Footer({ locale, settings, nav, whatsappHref, extraLinks }: Props) {
  const year = new Date().getFullYear()
  const social = settings.social ?? {}
  const socials = [
    ['Instagram', social.instagram],
    ['Facebook', social.facebook],
    ['TikTok', social.tiktok],
  ].filter((s): s is [string, string] => Boolean(s[1]))

  return (
    <footer className="footer">
      <EmberField density={1.4} className="footer__embers" />
      <div className="footer__inner">
        <div className="footer__lead">
          <Brand settings={settings} className="footer__brand" />
          {nav.footer?.tagline ? <p className="footer__tagline">{nav.footer.tagline}</p> : null}
        </div>

        <div className="footer__cols">
          <div>
            <h2 className="footer__label">{settings.branchName}</h2>
            <p className="footer__address">{settings.address}</p>
            <a className="footer__wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> {settings.whatsapp}
            </a>
            {settings.phone ? (
              <a className="footer__link" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                {settings.phone}
              </a>
            ) : null}
            {settings.email ? (
              <a className="footer__link" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            ) : null}
          </div>
          <nav aria-label="Footer">
            <ul className="footer__list">
              {[...(nav.links ?? []), ...extraLinks].map((l) => (
                <li key={l.href}>
                  <Link href={`/${locale}${l.href}`}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href={`/${locale}/reservar`}>{nav.ui?.reserve}</Link>
              </li>
            </ul>
          </nav>
          <div>
            <ul className="footer__social" aria-label="Redes sociales">
              {socials.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    {socialIcons[label]}
                  </a>
                </li>
              ))}
              <li>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                  <WhatsAppIcon size={20} />
                </a>
              </li>
            </ul>
            <ul className="footer__langs" aria-label={nav.ui?.language ?? 'Idioma'}>
              {locales.map((code) => (
                <li key={code}>
                  <a href={`/${code}`} hrefLang={code} lang={code} aria-current={code === locale ? 'true' : undefined}>
                    {localeNames[code]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__legal">
          <p>
            © {year} {settings.restaurantName}. {nav.ui?.allRights}
          </p>
          {nav.footer?.legal ? <p>{nav.footer.legal}</p> : null}
        </div>
      </div>
    </footer>
  )
}
