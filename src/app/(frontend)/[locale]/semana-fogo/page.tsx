import { notFound } from 'next/navigation'

import { LazyVideo } from '../../../../components/motion/LazyVideo'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { WeekStrip } from '../../../../components/ui/WeekStrip'
import { isLocale, localeTags } from '../../../../i18n/locales'
import { asMedia, isVideo, mediaUrl, posterUrl } from '../../../../lib/media'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getGlobal, getPromotions } from '../../../../lib/payload'
import { promoTime, toWeekPromos } from '../../../../lib/view'

export const revalidate = 3600
export const generateMetadata = pageMetadata('week-page', '/semana-fogo')

const dayIndex: Record<string, number> = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 }

export default async function WeekPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, nav, promos] = await Promise.all([getGlobal('week-page', locale, 1), getGlobal('navigation', locale, 0), getPromotions(locale)])
  const ui = nav.ui ?? {}
  const dayFmt = new Intl.DateTimeFormat(localeTags[locale], { weekday: 'long', timeZone: 'UTC' })
  const dayName = (d: string) => (d === 'daily' ? null : dayFmt.format(new Date(Date.UTC(2024, 0, 1 + (dayIndex[d] ?? 0)))))

  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        <WeekStrip promos={toWeekPromos(promos)} locale={locale} todayLabel={ui.today ?? ''} />
        <div className="promo-list">
          {promos.map((p, i) => {
            const vid = asMedia(p.video)
            const img = asMedia(p.image)
            const days = (p.days ?? []).map(dayName).filter(Boolean).join(' · ')
            return (
              <article key={p.id} className="promo" data-reveal="rise" style={{ ['--i' as string]: i % 2 }}>
                <div className="promo__media">
                  {vid && isVideo(vid) ? (
                    <LazyVideo src={mediaUrl(vid)!} poster={mediaUrl(img, 'card') || posterUrl(vid)} label={vid.alt} />
                  ) : img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(img, 'card')} alt={img.alt} loading="lazy" />
                  ) : null}
                  {p.highlight ? <span className="promo__highlight">{p.highlight}</span> : null}
                </div>
                <div className="promo__body">
                  <p className="promo__meta">{[days, promoTime(p)].filter(Boolean).join(' · ')}</p>
                  <h2 className="promo__title">{p.title}</h2>
                  {p.description ? <p className="promo__desc">{p.description}</p> : null}
                  {p.conditions ? <p className="promo__cond">{p.conditions}</p> : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </>
  )
}
