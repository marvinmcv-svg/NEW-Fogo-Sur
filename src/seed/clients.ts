import fs from 'fs'
import path from 'path'
import type { CollectionSlug, GlobalSlug, Payload } from 'payload'

import type { Locale } from '../i18n/locales'

type Doc = { id: number | string; [key: string]: unknown }

// The seed writes through this interface so the same content logic can run
// against a local database (Payload local API) or a deployed site (REST).
export type SeedClient = {
  create: (collection: CollectionSlug, data: Record<string, unknown>, locale: Locale) => Promise<Doc>
  update: (collection: CollectionSlug, id: Doc['id'], data: Record<string, unknown>, locale: Locale) => Promise<Doc>
  updateGlobal: (slug: GlobalSlug, data: Record<string, unknown>, locale: Locale) => Promise<Doc>
  upload: (filePath: string, data: Record<string, unknown>, locale: Locale) => Promise<Doc>
  count: (collection: CollectionSlug) => Promise<number>
  wipe: (collection: CollectionSlug) => Promise<void>
  ensureAdmin: (email: string, password: string) => Promise<'created' | 'existing'>
  log: (msg: string) => void
}

export const localClient = (payload: Payload): SeedClient => ({
  create: async (collection, data, locale) => (await payload.create({ collection, locale, data: data as never, depth: 0 })) as unknown as Doc,
  update: async (collection, id, data, locale) =>
    (await payload.update({ collection, id, locale, data: data as never, depth: 0 })) as unknown as Doc,
  updateGlobal: async (slug, data, locale) => (await payload.updateGlobal({ slug, locale, data: data as never, depth: 0 })) as unknown as Doc,
  upload: async (filePath, data, locale) =>
    (await payload.create({ collection: 'media', locale, data: data as never, filePath, depth: 0 })) as unknown as Doc,
  count: async (collection) => (await payload.count({ collection })).totalDocs,
  wipe: async (collection) => {
    await payload.delete({ collection, where: { id: { exists: true } }, depth: 0 })
  },
  ensureAdmin: async (email, password) => {
    if ((await payload.count({ collection: 'users' })).totalDocs > 0) return 'existing'
    await payload.create({ collection: 'users', data: { email, password, name: 'Administrador', role: 'admin' } })
    return 'created'
  },
  log: (msg) => payload.logger.info(msg),
})

const mime: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm' }

export const remoteClient = (baseUrl: string): SeedClient => {
  const base = baseUrl.replace(/\/$/, '')
  let token = ''

  const call = async (method: string, url: string, body?: BodyInit, json = true): Promise<Record<string, unknown>> => {
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(`${base}${url}`, {
        method,
        headers: {
          ...(json && body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `JWT ${token}` } : {}),
        },
        body,
      })
      const text = await res.text()
      if (res.ok) return text ? JSON.parse(text) : {}
      // Cold starts and brief DB pool exhaustion are transient: retry a few times.
      if (attempt < 4 && (res.status >= 500 || res.status === 429)) {
        await new Promise((r) => setTimeout(r, 1500 * attempt))
        continue
      }
      throw new Error(`${method} ${url} → ${res.status}: ${text.slice(0, 400)}`)
    }
  }
  const q = (locale: Locale) => `?locale=${locale}&depth=0`

  return {
    create: async (collection, data, locale) =>
      (await call('POST', `/api/${collection}${q(locale)}`, JSON.stringify(data))).doc as Doc,
    update: async (collection, id, data, locale) =>
      (await call('PATCH', `/api/${collection}/${id}${q(locale)}`, JSON.stringify(data))).doc as Doc,
    updateGlobal: async (slug, data, locale) =>
      (await call('POST', `/api/globals/${slug}${q(locale)}`, JSON.stringify(data))).result as Doc,
    upload: async (filePath, data, locale) => {
      const form = new FormData()
      const type = mime[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      form.append('file', new Blob([fs.readFileSync(filePath)], { type }), path.basename(filePath))
      form.append('_payload', JSON.stringify(data))
      return (await call('POST', `/api/media${q(locale)}`, form, false)).doc as Doc
    },
    count: async (collection) => Number((await call('GET', `/api/${collection}/count`)).totalDocs ?? 0),
    wipe: async (collection) => {
      await call('DELETE', `/api/${collection}?where[id][exists]=true&limit=1000`)
    },
    ensureAdmin: async (email, password) => {
      let created: 'created' | 'existing' = 'existing'
      try {
        const res = await call('POST', '/api/users/first-register', JSON.stringify({ email, password, name: 'Administrador', role: 'admin' }))
        token = String(res.token ?? '')
        created = 'created'
      } catch {
        // Users already exist: log in with the supplied credentials instead.
      }
      if (!token) token = String((await call('POST', '/api/users/login', JSON.stringify({ email, password }))).token ?? '')
      if (!token) throw new Error('Could not authenticate against the remote admin.')
      return created
    },
    log: (msg) => console.log(`[seed] ${msg}`),
  }
}
