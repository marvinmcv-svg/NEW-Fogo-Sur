import { notFound } from 'next/navigation'

import { InquiryForm } from '../../../../components/ui/InquiryForm'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { isLocale } from '../../../../i18n/locales'
import { formatPrice } from '../../../../lib/format'
import { asMedia, mediaUrl } from '../../../../lib/media'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getEventPackages, getGlobal } from '../../../../lib/payload'

export const revalidate = 3600
export const generateMetadata = pageMetadata('events-page', '/eventos')

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, nav, packages] = await Promise.all([getGlobal('events-page', locale, 1), getGlobal('navigation', locale, 0), getEventPackages(locale)])
  const ui = nav.ui ?? {}

  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        <div className="packages">
          {packages.map((p, i) => {
            const img = asMedia(p.image)
            const from = formatPrice(p.priceFrom, locale)
            return (
              <article key={p.id} className="package" data-reveal="rise" style={{ ['--i' as string]: i }}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(img, 'card')} alt={img.alt} loading="lazy" />
                ) : (
                  <div />
                )}
                <div className="package__body">
                  <h2 className="package__title">{p.title}</h2>
                  <p className="package__meta">
                    {[p.capacity, from ? `${from} ${ui.perPerson ?? ''}` : null].filter(Boolean).join(' · ')}
                  </p>
                  {p.description ? <p style={{ color: 'var(--bone-dim)', margin: 0 }}>{p.description}</p> : null}
                  {p.features?.length ? (
                    <ul>
                      {p.features.map((f) => (
                        <li key={f.id}>{f.text}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <div className="form-wrap" id="consulta">
          <div>
            {page.formTitle ? <h2 className="display" style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.2rem)' }}>{page.formTitle}</h2> : null}
            {page.formIntro ? <p className="lede">{page.formIntro}</p> : null}
          </div>
          <InquiryForm
            labels={page.formLabels ?? {}}
            success={page.formSuccess ?? '✓'}
            locale={locale}
            types={packages.map((p) => p.title)}
          />
        </div>
      </div>
    </>
  )
}
