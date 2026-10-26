import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { fr } from '@payloadcms/translations/languages/fr'
import { pt } from '@payloadcms/translations/languages/pt'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Cuts } from './collections/Cuts'
import { EventPackages } from './collections/EventPackages'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { MenuCategories } from './collections/MenuCategories'
import { MenuItems } from './collections/MenuItems'
import { Pages } from './collections/Pages'
import { Promotions } from './collections/Promotions'
import { ReservationRequests } from './collections/ReservationRequests'
import { Users } from './collections/Users'
import { Home } from './globals/Home'
import { Navigation } from './globals/Navigation'
import { CutsPage, EventsPage, MenuPage, ReservePage, VisitPage, WeekPage } from './globals/PageGlobals'
import { Settings } from './globals/Settings'
import { defaultLocale, localeNames, locales } from './i18n/locales'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// The restaurant team edits content; the raw "API" tab is developer noise.
const withoutApiTab = <T extends { admin?: object }>(config: T): T => ({ ...config, admin: { ...config.admin, hideAPIURL: true } })

const databaseUri = process.env.DATABASE_URI || 'file:./fogo.db'

// Local development and the seed run on SQLite; production uses Postgres
// (Supabase/Neon) because serverless hosts have no persistent disk.
const db = databaseUri.startsWith('postgres')
  ? postgresAdapter({
      pool: {
        connectionString: databaseUri,
        max: 5,
        // Managed Postgres (Supabase pooler) encrypts traffic with its own CA.
        ssl: /localhost|127\.0\.0\.1/.test(databaseUri) ? undefined : { rejectUnauthorized: false },
      },
      // Supabase: the CMS gets its own schema and login role (see README).
      schemaName: process.env.DATABASE_SCHEMA || undefined,
      migrationDir: path.resolve(dirname, 'migrations'),
      push: false,
    })
  : sqliteAdapter({ client: { url: databaseUri } })

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Fogo de Chão Admin' },
    avatar: 'default',
    // The brand is fire on charcoal: the panel stays dark (see custom.scss).
    theme: 'dark',
    components: {
      views: {
        dashboard: { Component: '/components/admin/Dashboard' },
      },
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Móvil', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Escritorio', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es, en, pt, fr, de, zh },
  },
  localization: {
    locales: locales.map((code) => ({ code, label: localeNames[code] })),
    defaultLocale,
    fallback: true,
  },
  collections: [Pages, Cuts, MenuCategories, MenuItems, Promotions, EventPackages, Media, ReservationRequests, Inquiries, Users].map(
    withoutApiTab,
  ),
  globals: [Home, MenuPage, CutsPage, WeekPage, EventsPage, VisitPage, ReservePage, Settings, Navigation].map(withoutApiTab),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
  upload: { limits: { fileSize: 40_000_000 } },
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
