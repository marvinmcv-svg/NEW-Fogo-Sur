import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Bar } from '../../../components/home/Bar'
import { CardChapter } from '../../../components/home/CardChapter'
import { Countdown } from '../../../components/home/Countdown'
import { CutsConveyor } from '../../../components/home/CutsConveyor'
import { Hero } from '../../../components/home/Hero'
import { Market } from '../../../components/home/Market'
import { Ritual } from '../../../components/home/Ritual'
import { Visit } from '../../../components/home/Visit'
import { SplitText } from '../../../components/motion/SplitText'
import { CutCard } from '../../../components/ui/CutCard'
import { WeekStrip } from '../../../components/ui/WeekStrip'
import { isLocale } from '../../../i18n/locales'
import { formatPrice, splitLines } from '../../../lib/format'
import { asMedia, isVideo, mediaUrl, posterUrl, type MediaRef } from '../../../lib/media'
import { getCuts, getGlobal, getPromotions } from '../../../lib/payload'
import { buildMetadata } from '../../../lib/seo'
import { toCutCard, cutLabels, toWeekPromos, directionsUrl, countdownLabels } from '../../../lib/view'
import type { Cut, MenuItem } from '../../../payload-types'

type Params = { params: Promise<{ locale: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const settings = await getGlobal('settings', locale, 1)
  return buildMetadata({ locale, path: '', settings })
}

const video = (ref: MediaRef) => {
  const m = asMedia(ref)
  return m && isVideo(m) ? { src: mediaUrl(m)!, poster: posterUrl(m) } : null
}

export default async function HomePage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [home, settings, nav, allCuts, promos] = await Promise.all([
    getGlobal('home', locale, 2),
    getGlobal('settings', locale, 1),
    getGlobal('navigation', locale, 0),
    getCuts(locale),
    getPromotions(locale),
  ])
  const ui = nav.ui ?? {}
  const base = `/${locale}`
  const { hero, ritual, cuts, market, card, bar, week, visit } = home

  const countdown =
    settings.status === 'coming-soon' && settings.openingDate ? (
      <Countdown target={settings.openingDate} labels={countdownLabels(ui)} />
    ) : null

  const chosenCuts = (cuts?.cuts?.length ? cuts.cuts : allCuts.filter((c) => c.featured)).filter(
    (c): c is Cut => typeof c === 'object' && c !== null,
  )

  const heading = (text: string | null | undefined, delay = 0) =>
    text ? <SplitText as="h2" className="display" text={text} lines={splitLines(text)} delay={delay} /> : null

  const heroTitle = hero?.title ?? ''

  return (
    <>
      <Hero
        eyebrow={hero?.eyebrow}
        title={<SplitText as="span" className="hero__split" text={heroTitle} lines={splitLines(heroTitle)} reveal={false} />}
        subtitle={hero?.subtitle}
        intro={video(hero?.introVideo)}
        loop={video(hero?.loopVideo)}
        ctaLabel={hero?.ctaLabel || ui.reserve}
        ctaHref={`${base}/reservar`}
        secondaryLabel={hero?.secondaryLabel}
        secondaryHref={`${base}/menu`}
        countdown={countdown}
        scrollLabel={ui.scroll}
      />

      {ritual?.enabled !== false && ritual?.beats?.length ? (
        <Ritual
          heading={ritual.heading}
          chapter={ritual.heading || 'Ritual'}
          beats={ritual.beats.map((b) => {
            const v = video(b.video)
            return { kicker: b.kicker, title: b.title, text: b.text, src: v?.src, poster: v?.poster }
          })}
        />
      ) : null}

      {cuts?.enabled !== false && chosenCuts.length ? (
        <section className="cuts" id="cortes" data-chapter={cuts?.eyebrow || 'Cortes'}>
          <div className="cuts__head">
            {cuts?.eyebrow ? (
              <p className="eyebrow" data-reveal="fade">
                {cuts.eyebrow}
              </p>
            ) : null}
            {heading(cuts?.heading)}
            {cuts?.intro ? (
              <p className="lede" data-reveal="rise">
                {cuts.intro}
              </p>
            ) : null}
          </div>
          <CutsConveyor hint={cuts?.hint}>
            {chosenCuts.map((c, i) => (
              <CutCard key={c.id} cut={toCutCard(c)} href={`${base}/cortes/${c.slug}`} labels={cutLabels(ui)} index={i} />
            ))}
          </CutsConveyor>
          {cuts?.linkLabel ? (
            <div className="section-link">
              <Link className="link-arrow" href={`${base}/cortes`}>
                {cuts.linkLabel} →
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {market?.enabled !== false ? (
        <Market
          chapter={market?.eyebrow || 'Mercado'}
          eyebrow={market?.eyebrow}
          heading={heading(market?.heading)}
          text={market?.text}
          heroImage={mediaUrl(asMedia(market?.heroImage), 'full')}
          heroAlt={asMedia(market?.heroImage)?.alt}
          tiles={[
            ...(market?.gallery ?? []).flatMap((g) => {
              const m = asMedia(g.image)
              return m ? [{ src: mediaUrl(m, 'card')!, alt: m.alt, caption: g.caption }] : []
            }),
            ...(video(market?.video)
              ? [{ src: video(market?.video)!.src, poster: video(market?.video)!.poster, video: true, alt: asMedia(market?.video)?.alt ?? '' }]
              : []),
          ]}
          link={
            market?.linkLabel ? (
              <Link className="link-arrow" href={`${base}/menu`}>
                {market.linkLabel} →
              </Link>
            ) : null
          }
        />
      ) : null}

      {card?.enabled !== false ? (
        <CardChapter
          chapter={card?.eyebrow || 'Card'}
          eyebrow={card?.eyebrow}
          heading={heading(card?.heading)}
          text={card?.text}
          yes={{ label: card?.yesLabel || 'Sí, por favor', sub: card?.yesSub, text: card?.yesText }}
          no={{ label: card?.noLabel || 'No, gracias', sub: card?.noSub, text: card?.noText }}
          video={video(card?.video) ?? undefined}
          flipLabel={ui.flip ?? 'Flip'}
        />
      ) : null}

      {bar?.enabled !== false ? (
        <Bar
          chapter={bar?.eyebrow || 'Bar'}
          eyebrow={bar?.eyebrow}
          heading={heading(bar?.heading)}
          text={bar?.text}
          clips={(bar?.clips ?? []).flatMap((c) => {
            const m = asMedia(c.media)
            if (!m) return []
            return [{ src: mediaUrl(m, isVideo(m) ? undefined : 'card')!, poster: posterUrl(m), video: isVideo(m), caption: c.caption, alt: m.alt }]
          })}
          drinks={(bar?.highlights ?? [])
            .filter((d): d is MenuItem => typeof d === 'object' && d !== null)
            .map((d) => ({
              name: d.name,
              description: d.description,
              price: d.priceNote || formatPrice(d.price, locale) || ui.consult,
            }))}
        />
      ) : null}

      {week?.enabled !== false && promos.length ? (
        <section className="week-chapter" id="semana" data-chapter={week?.eyebrow || 'Semana'}>
          <div className="week-chapter__head">
            {week?.eyebrow ? (
              <p className="eyebrow" data-reveal="fade">
                {week.eyebrow}
              </p>
            ) : null}
            {heading(week?.heading)}
            {week?.intro ? (
              <p className="lede" data-reveal="rise">
                {week.intro}
              </p>
            ) : null}
          </div>
          <WeekStrip promos={toWeekPromos(promos)} locale={locale} todayLabel={ui.today ?? 'Hoy'} />
          <div className="section-link">
            <Link className="link-arrow" href={`${base}/semana-fogo`}>
              {ui.seeAll} →
            </Link>
          </div>
        </section>
      ) : null}

      {visit?.enabled !== false ? (
        <Visit
          chapter={visit?.eyebrow || 'Visita'}
          eyebrow={visit?.eyebrow}
          heading={heading(visit?.heading)}
          text={visit?.text}
          media={(() => {
            const m = asMedia(visit?.media)
            return m ? { src: mediaUrl(m, isVideo(m) ? undefined : 'full')!, poster: posterUrl(m), video: isVideo(m), alt: m.alt } : undefined
          })()}
          address={settings.address}
          hours={(settings.hours ?? []).map((h) => ({ days: h.days, time: h.time }))}
          hoursTbd={ui.hoursTbd ?? ''}
          directionsHref={directionsUrl(settings.mapQuery)}
          directionsLabel={ui.directions ?? ''}
          ctaLabel={visit?.ctaLabel || ui.reserve || 'Reservar'}
          ctaHref={`${base}/reservar`}
          countdown={countdown}
        />
      ) : null}
    </>
  )
}
