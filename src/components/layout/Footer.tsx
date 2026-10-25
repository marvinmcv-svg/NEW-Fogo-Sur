import Link from 'next/link'

import { localeNames, locales, type Locale } from '../../i18n/locales'
import type { Navigation, Setting } from '../../payload-types'
import { EmberField } from '../motion/EmberField'
import { Brand } from './Brand'
import { WhatsAppIcon } from './WhatsAppFab'

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
            {socials.length ? (
              <ul className="footer__list">
                {socials.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
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
