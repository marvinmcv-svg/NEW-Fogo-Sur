import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, isLocale, locales } from './i18n/locales'

const pickLocale = (header: string | null) => {
  if (!header) return defaultLocale
  const wanted = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return wanted.find((w) => isLocale(w.lang))?.lang ?? defaultLocale
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const first = pathname.split('/')[1]
  if (isLocale(first)) return NextResponse.next()

  const saved = req.cookies.get('locale')?.value
  const locale = isLocale(saved) ? saved : pickLocale(req.headers.get('accept-language'))
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Skip the admin, API, Next internals and anything with a file extension.
  matcher: ['/((?!admin|api|preview|_next|.*\\..*).*)'],
}

export { locales }
