import { notFound } from 'next/navigation'

import { PageHeader } from '../../../../components/ui/PageHeader'
import { isLocale } from '../../../../i18n/locales'
import { formatPrice } from '../../../../lib/format'
import { asMedia, mediaUrl } from '../../../../lib/media'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getGlobal, getMenu } from '../../../../lib/payload'

export const revalidate = 3600
export const generateMetadata = pageMetadata('menu-page', '/menu')

const tagClass = (t: string) => `tag ${t === 'signature' ? 'tag--signature' : ''}`

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, nav, { categories, items }] = await Promise.all([
    getGlobal('menu-page', locale, 1),
    getGlobal('navigation', locale, 0),
    getMenu(locale),
  ])
  const ui = nav.ui ?? {}
  const tagLabels: Record<string, string> = {
    signature: '★',
    vegetarian: 'V',
    'gluten-free': 'GF',
    new: 'NEW',
    sharing: '⇄',
  }

  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        <nav className="menu-tabs" aria-label={page.title}>
          {categories.map((c) => (
            <a key={c.id} href={`#${c.slug}`}>
              {c.title}
            </a>
          ))}
        </nav>
        {categories.map((c) => {
          const list = items.filter((i) => (typeof i.category === 'object' ? i.category?.id : i.category) === c.id)
          if (!list.length) return null
          const img = asMedia(c.image)
          return (
            <section key={c.id} id={c.slug ?? undefined} className="menu-section">
              <div className="menu-section__aside">
                <h2 className="menu-section__title" data-reveal="rise">
                  {c.title}
                </h2>
                {c.intro ? (
                  <p className="lede" data-reveal="rise">
                    {c.intro}
                  </p>
                ) : null}
                {img ? (
                  <div data-reveal="slice">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="menu-section__img" src={mediaUrl(img, 'card')} alt={img.alt} loading="lazy" />
                  </div>
                ) : null}
              </div>
              <ul className="menu-list">
                {list.map((item, i) => {
                  const price = formatPrice(item.price, locale)
                  return (
                    <li key={item.id} className="menu-item" data-reveal="rise" style={{ ['--i' as string]: i % 6 }}>
                      <h3 className="menu-item__name">{item.name}</h3>
                      <p className="menu-item__price">
                        {price ?? (item.priceNote ? null : ui.consult)}
                        {item.priceNote ? <small>{item.priceNote}</small> : null}
                      </p>
                      {item.description ? <p className="menu-item__desc">{item.description}</p> : null}
                      {item.tags?.length ? (
                        <p className="menu-item__tags">
                          {item.tags.map((t) => (
                            <span key={t} className={tagClass(t)}>
                              {tagLabels[t] ?? t}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        {page.pricesNote ? <p className="prices-note">{page.pricesNote}</p> : null}
      </div>
    </>
  )
}
