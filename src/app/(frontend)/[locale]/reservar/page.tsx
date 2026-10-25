import { notFound } from 'next/navigation'

import { PageHeader } from '../../../../components/ui/PageHeader'
import { ReserveForm } from '../../../../components/ui/ReserveForm'
import { isLocale } from '../../../../i18n/locales'
import { pageMetadata } from '../../../../lib/pageMeta'
import { getGlobal } from '../../../../lib/payload'

export const revalidate = 3600
export const generateMetadata = pageMetadata('reserve-page', '/reservar')

export default async function ReservePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [page, settings] = await Promise.all([getGlobal('reserve-page', locale, 1), getGlobal('settings', locale, 1)])
  const times = (page.times || '').split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} intro={page.intro} media={page.media} />
      <div className="page-body">
        <ReserveForm
          labels={page.labels ?? {}}
          occasions={(page.occasions ?? []).map((o) => o.label)}
          times={times}
          template={page.messageTemplate || '{name} · {date} · {time} · {guests}'}
          whatsapp={settings.whatsapp}
          locale={locale}
          branch={settings.branchName ?? 'Fogo de Chão'}
        />
      </div>
    </>
  )
}
