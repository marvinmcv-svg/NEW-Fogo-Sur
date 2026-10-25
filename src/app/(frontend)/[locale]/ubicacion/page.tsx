import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Countdown } from '../../../../components/home/Countdown'
import { WhatsAppIcon } from '../../../../components/layout/WhatsAppFab'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { isLocale } from '../../../../i18n/locales'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getGlobal } from '../../../../lib/payload'
import { countdownLabels, directionsUrl } from '../../../../lib/view'
import { whatsappLink } from '../../../../lib/whatsapp'

export const revalidate = 3600
export const generateMetadata = pageMetadata('visit-page', '/ubicacion')

export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, settings, nav] = await Promise.all([getGlobal('visit-page', locale, 1), getGlobal('settings', locale, 1), getGlobal('navigation', locale, 0)])
  const ui = nav.ui ?? {}
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(settings.mapQuery || '')}&z=15&output=embed`

  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        {settings.status === 'coming-soon' && settings.openingDate ? (
          <div style={{ marginBottom: '3rem' }}>
            <Countdown target={settings.openingDate} labels={countdownLabels(ui)} />
          </div>
        ) : null}
        <div className="visit-grid">
          <div data-reveal="rise">
            <h2>{settings.branchName}</h2>
            <p className="visit__address">{settings.address}</p>
            <p style={{ marginTop: '1.2rem' }}>
              <a className="link-arrow" href={directionsUrl(settings.mapQuery)} target="_blank" rel="noopener noreferrer">
                {ui.directions} ↗
              </a>
            </p>
          </div>
          <div data-reveal="rise" style={{ ['--i' as string]: 1 }}>
            <h2>{ui.hours}</h2>
            {settings.hours?.length ? (
              <dl className="visit__hours">
                {settings.hours.map((h) => (
                  <div key={h.id}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="visit__tbd">{ui.hoursTbd}</p>
            )}
            {settings.parkingNote ? <p className="visit__tbd" style={{ marginTop: '1rem' }}>{settings.parkingNote}</p> : null}
          </div>
          <div data-reveal="rise" style={{ ['--i' as string]: 2 }}>
            <h2>WhatsApp</h2>
            <a className="footer__wa" href={whatsappLink(settings.whatsapp, settings.whatsappGreeting)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> {settings.whatsapp}
            </a>
            <p style={{ marginTop: '1.4rem' }}>
              <Link className="btn btn--yes" href={`/${locale}/reservar`}>
                <span className="btn__dot" aria-hidden="true" />
                {ui.reserve}
              </Link>
            </p>
          </div>
        </div>
        <div className="map" data-reveal="fade">
          <iframe src={mapSrc} title={settings.branchName ?? 'Map'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </>
  )
}
