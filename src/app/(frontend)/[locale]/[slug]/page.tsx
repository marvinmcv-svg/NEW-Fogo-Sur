import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Blocks } from '../../../../components/ui/Blocks'
import { isLocale } from '../../../../i18n/locales'
import { getGlobal, getPage } from '../../../../lib/payload'
import { buildMetadata } from '../../../../lib/seo'
import { whatsappLink } from '../../../../lib/whatsapp'

type Params = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const [page, settings] = await Promise.all([getPage(slug, locale), getGlobal('settings', locale, 1)])
  if (!page) return {}
  return buildMetadata({ locale, path: `/${slug}`, title: page.title, description: page.metaDescription, settings })
}

export default async function CustomPage({ params }: Params) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const { isEnabled: draft } = await draftMode()
  const [page, settings] = await Promise.all([getPage(slug, locale, draft), getGlobal('settings', locale, 1)])
  if (!page) notFound()
  return (
    <Blocks blocks={page.layout ?? []} locale={locale} whatsappHref={whatsappLink(settings.whatsapp, settings.whatsappGreeting)} />
  )
}
