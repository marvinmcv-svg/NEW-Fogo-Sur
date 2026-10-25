import { notFound } from 'next/navigation'

import { CutCard } from '../../../../components/ui/CutCard'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { isLocale } from '../../../../i18n/locales'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getCuts, getGlobal } from '../../../../lib/payload'
import { cutLabels, toCutCard } from '../../../../lib/view'

export const revalidate = 3600
export const generateMetadata = pageMetadata('cuts-page', '/cortes')

export default async function CutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, nav, cuts] = await Promise.all([getGlobal('cuts-page', locale, 1), getGlobal('navigation', locale, 0), getCuts(locale)])
  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        <div className="cuts-grid">
          {cuts.map((c, i) => (
            <div key={c.id} data-reveal="rise" style={{ ['--i' as string]: i % 4 }}>
              <CutCard cut={toCutCard(c)} href={`/${locale}/cortes/${c.slug}`} labels={cutLabels(nav.ui ?? {})} index={i} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
