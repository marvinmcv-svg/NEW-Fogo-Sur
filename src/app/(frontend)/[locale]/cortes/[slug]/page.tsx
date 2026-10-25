import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LazyVideo } from '../../../../../components/motion/LazyVideo'
import { SplitText } from '../../../../../components/motion/SplitText'
import { isLocale } from '../../../../../i18n/locales'
import { asMedia, isVideo, mediaUrl, posterUrl } from '../../../../../lib/media'
import { getCut, getCuts, getGlobal } from '../../../../../lib/payload'
import { buildMetadata } from '../../../../../lib/seo'

type Params = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 3600

export const generateStaticParams = () => []

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const [cut, settings] = await Promise.all([getCut(slug, locale), getGlobal('settings', locale, 1)])
  if (!cut) return {}
  return buildMetadata({
    locale,
    path: `/cortes/${slug}`,
    title: cut.portugueseName && cut.portugueseName !== cut.name ? `${cut.portugueseName} · ${cut.name}` : cut.name,
    description: cut.description || cut.tagline,
    settings,
    image: mediaUrl(asMedia(cut.image), 'full'),
  })
}

export default async function CutPage({ params }: Params) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const [cut, all, nav] = await Promise.all([getCut(slug, locale), getCuts(locale), getGlobal('navigation', locale, 0)])
  if (!cut) notFound()
  const ui = nav.ui ?? {}
  const img = asMedia(cut.image)
  const vid = asMedia(cut.video)
  const idx = all.findIndex((c) => c.id === cut.id)
  const prev = all[(idx - 1 + all.length) % all.length]
  const next = all[(idx + 1) % all.length]
  const title = cut.portugueseName || cut.name
  const facts: [string | null | undefined, string | null | undefined][] = [
    [ui.tastingNotes, cut.tastingNotes],
    [ui.doneness, cut.doneness],
    [ui.origin, cut.origin],
    [ui.pairing, cut.pairing],
  ]

  return (
    <article className="cut-detail">
      <div className="cut-detail__media" data-reveal="slice">
        {vid && isVideo(vid) ? (
          <LazyVideo src={mediaUrl(vid)!} poster={mediaUrl(img, 'full') || posterUrl(vid)} label={vid.alt} eager />
        ) : img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(img, 'full')} alt={img.alt} />
        ) : null}
      </div>
      <div>
        <p className="eyebrow" data-reveal="fade">
          {String(idx + 1).padStart(2, '0')} / {String(all.length).padStart(2, '0')}
        </p>
        <SplitText as="h1" className="display" text={title} />
        {cut.portugueseName && cut.portugueseName !== cut.name ? <p className="cut-detail__alt">{cut.name}</p> : null}
        {cut.tagline ? (
          <p className="lede" data-reveal="rise">
            {cut.tagline}
          </p>
        ) : null}
        {cut.description ? (
          <p data-reveal="rise" style={{ color: 'var(--bone-dim)', maxWidth: '56ch' }}>
            {cut.description}
          </p>
        ) : null}
        <dl className="cut-detail__facts" data-reveal="rise">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        <div className="cut-detail__nav">
          {prev && prev.id !== cut.id ? (
            <Link className="link-arrow" href={`/${locale}/cortes/${prev.slug}`}>
              ← {prev.portugueseName || prev.name}
            </Link>
          ) : null}
          <Link className="btn btn--yes" href={`/${locale}/reservar`}>
            <span className="btn__dot" aria-hidden="true" />
            {ui.reserve}
          </Link>
          {next && next.id !== cut.id ? (
            <Link className="link-arrow" href={`/${locale}/cortes/${next.slug}`}>
              {next.portugueseName || next.name} →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
