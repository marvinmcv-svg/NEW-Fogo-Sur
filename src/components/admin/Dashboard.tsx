import type { Payload } from 'payload'

import { timeZone } from '../../i18n/locales'
import type { Inquiry, Promotion, ReservationRequest, Setting } from '../../payload-types'
import { RestaurantBento, type RestaurantBentoData } from './RestaurantBento'

// The admin home: what the restaurant team needs at a glance before service.
// Everything is computed from the CMS (WhatsApp reservation log, event
// inquiries, menu, promotions, settings) in Bolivia time.

type Props = { payload: Payload; user?: { name?: string | null } | null }

const DAY = 86_400_000
const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

// YYYY-MM-DD in Bolivia for a given instant.
const isoDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone }).format(d)
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * DAY).toISOString().slice(0, 10)
const weekdayOf = (iso: string) => weekdayKeys[new Date(`${iso}T12:00:00Z`).getUTCDay()]
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-BO', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace('.', '')
const shortDate = (value: string) => new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', timeZone }).format(new Date(value)).replace('.', '')
const isLunch = (time?: string | null) => Number((time || '').split(':')[0]) < 17
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

const statusLabels: Record<NonNullable<Inquiry['status']>, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  confirmed: 'Confirmada',
  closed: 'Descartada',
}

export default async function Dashboard({ payload, user }: Props) {
  const admin = payload.config.routes.admin
  const link = (path: string) => `${admin}${path}`
  const now = new Date()
  const today = isoDay(now)
  const from = addDays(today, -180)
  const to = addDays(today, 13)

  const [settings, byDate, recentRes, inquiries, promos, items, itemsOff, itemsNoPrice] = await Promise.all([
    payload.findGlobal({ slug: 'settings', depth: 0 }) as Promise<Setting>,
    payload.find({
      collection: 'reservation-requests',
      where: { and: [{ date: { greater_than_equal: from } }, { date: { less_than_equal: to } }] },
      limit: 20000,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'reservation-requests',
      where: { createdAt: { greater_than_equal: new Date(now.getTime() - 42 * DAY).toISOString() } },
      limit: 20000,
      depth: 0,
      pagination: false,
    }),
    payload.find({ collection: 'inquiries', sort: '-createdAt', limit: 1000, depth: 0, pagination: false }),
    payload.find({ collection: 'promotions', where: { active: { equals: true } }, limit: 100, depth: 0, pagination: false }),
    payload.count({ collection: 'menu-items' }),
    payload.count({ collection: 'menu-items', where: { available: { equals: false } } }),
    payload.count({ collection: 'menu-items', where: { price: { exists: false } } }),
  ])

  const booked = byDate.docs as ReservationRequest[]
  const recent = recentRes.docs as ReservationRequest[]
  const inq = inquiries.docs as Inquiry[]
  const liveEvents = inq.filter((i) => i.date && (i.status === 'confirmed' || i.status === 'contacted'))

  // Covers per day by service; events count on their date once contacted/confirmed.
  const days: RestaurantBentoData['days'] = []
  const index = new Map<string, RestaurantBentoData['days'][number]>()
  for (let iso = from; iso <= to; iso = addDays(iso, 1)) {
    const d = { date: iso, lunch: 0, dinner: 0, events: 0 }
    days.push(d)
    index.set(iso, d)
  }
  for (const r of booked) {
    const d = index.get(r.date)
    if (d) d[isLunch(r.time) ? 'lunch' : 'dinner'] += r.guests
  }
  for (const e of liveEvents) {
    const d = index.get(isoDay(new Date(e.date!)))
    if (d) d.events += e.guests ?? 0
  }

  // Weekly requests received (last 6 weeks, oldest first).
  const weekly = Array.from({ length: 6 }, (_, k) => {
    const end = now.getTime() - (5 - k) * 7 * DAY
    const start = end - 7 * DAY
    const inWeek = (iso: string) => Date.parse(iso) > start && Date.parse(iso) <= end
    return {
      label: fmt(isoDay(new Date(start + DAY)), { day: 'numeric', month: 'short' }),
      reservations: recent.filter((r) => inWeek(r.createdAt)).length,
      events: inq.filter((i) => inWeek(i.createdAt)).length,
    }
  })

  const t7 = now.getTime() - 7 * DAY
  const last7 = recent.filter((r) => Date.parse(r.createdAt) >= t7)
  const prev7 = recent.filter((r) => Date.parse(r.createdAt) >= t7 - 7 * DAY && Date.parse(r.createdAt) < t7)

  const week = Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(today, i)
    const d = index.get(iso)!
    return { label: fmt(iso, { weekday: 'short' }).slice(0, 3), covers: d.lunch + d.dinner + d.events, today: i === 0 }
  })

  // Top 3 time slots by covers booked in the last 7 days, each with a daily sparkline.
  const slotTotals = new Map<string, number>()
  for (const r of last7) if (r.time) slotTotals.set(r.time, (slotTotals.get(r.time) ?? 0) + r.guests)
  const slots = [...slotTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time, covers]) => ({
      time,
      covers,
      spark: Array.from({ length: 7 }, (_, i) => {
        const day = isoDay(new Date(now.getTime() - (6 - i) * DAY))
        return sum(last7.filter((r) => r.time === time && isoDay(new Date(r.createdAt)) === day).map((r) => r.guests))
      }),
    }))

  const fresh = inq.filter((i) => (i.status ?? 'new') === 'new')
  const opening = settings.openingDate ? new Date(settings.openingDate) : null
  const daysLeft = opening ? Math.ceil((opening.getTime() - now.getTime()) / DAY) : null
  const comingSoon = settings.status === 'coming-soon' && daysLeft !== null && daysLeft > 0
  const todayKey = weekdayOf(today)
  const todaysPromo = (promos.docs as Promotion[]).find((p) => p.days?.includes(todayKey) || p.days?.includes('daily'))
  const total = items.totalDocs || 1

  const data: RestaurantBentoData = {
    today,
    days,
    weekly,
    week,
    slots,
    avgParty: recent.length ? sum(recent.map((r) => r.guests)) / recent.length : 0,
    last7: last7.length,
    prev7: prev7.length,
    status: {
      comingSoon,
      daysLeft,
      label: comingSoon && opening ? new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', timeZone }).format(opening) : fmt(today, { weekday: 'long' }),
      hours: settings.hours?.[0]?.time ?? null,
      promo: todaysPromo ? [todaysPromo.highlight, todaysPromo.title].filter(Boolean).join(' · ') : null,
    },
    pending: fresh.slice(0, 3).map((i) => ({
      name: i.name,
      date: i.date ? shortDate(i.date) : shortDate(i.createdAt),
      guests: i.guests ?? null,
      href: link(`/collections/inquiries/${i.id}`),
    })),
    pendingCount: fresh.length,
    goals: [
      {
        name: 'Platos con precio',
        progress: (items.totalDocs - itemsNoPrice.totalDocs) / total,
        detail: `${itemsNoPrice.totalDocs} sin precio`,
        href: link('/collections/menu-items?where[price][exists]=false'),
      },
      {
        name: 'Disponibles hoy',
        progress: (items.totalDocs - itemsOff.totalDocs) / total,
        detail: `${itemsOff.totalDocs} agotados`,
        href: link('/collections/menu-items?where[available][equals]=false'),
      },
    ],
  }

  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now))
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = (user?.name || '').split(' ')[0]
  const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}`

  return (
    <div className="fd">
      <RestaurantBento
        data={data}
        title={`${greeting}${firstName ? `, ${firstName}` : ''}`}
        subtitle={`${fmt(today, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase())} · ${settings.branchName ?? ''}`}
      />

      <section className="fd-lower">
        <article className="fd-card">
          <header className="fd-card__head">
            <div>
              <p className="fd-eyebrow">Bandeja</p>
              <h2>Últimas solicitudes de eventos</h2>
            </div>
            <a className="fd-link" href={link('/collections/inquiries')}>
              Ver todas →
            </a>
          </header>
          {inq.length ? (
            <div className="fd-table-wrap">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Evento</th>
                    <th>Fecha</th>
                    <th className="num">Personas</th>
                    <th>Estado</th>
                    <th aria-label="WhatsApp" />
                  </tr>
                </thead>
                <tbody>
                  {inq.slice(0, 6).map((i) => (
                    <tr key={i.id}>
                      <td>
                        <a href={link(`/collections/inquiries/${i.id}`)}>{i.name}</a>
                        <small>Recibida {shortDate(i.createdAt)}</small>
                      </td>
                      <td>{i.eventType || '—'}</td>
                      <td>{i.date ? shortDate(i.date) : '—'}</td>
                      <td className="num">{i.guests ?? '—'}</td>
                      <td>
                        <span className={`fd-chip fd-chip--${i.status ?? 'new'}`}>{statusLabels[i.status ?? 'new']}</span>
                      </td>
                      <td className="end">
                        <a className="fd-wa" href={waLink(i.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp a ${i.name}`}>
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="fd-empty">Las solicitudes del formulario de eventos llegarán aquí.</p>
          )}
        </article>

        <article className="fd-card">
          <header className="fd-card__head">
            <div>
              <p className="fd-eyebrow">Atajos</p>
              <h2>Acciones rápidas</h2>
            </div>
          </header>
          <nav className="fd-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">↗</span> Ver la web
            </a>
            <a href={link('/globals/home')}>
              <span aria-hidden="true">✦</span> Editar portada
            </a>
            <a href={link('/collections/promotions/create')}>
              <span aria-hidden="true">%</span> Nueva promoción
            </a>
            <a href={link('/collections/menu-items/create')}>
              <span aria-hidden="true">+</span> Añadir plato
            </a>
            <a href={link('/collections/media/create')}>
              <span aria-hidden="true">▶</span> Subir foto o video
            </a>
            <a href={link('/globals/settings')}>
              <span aria-hidden="true">⚙︎</span> Horarios y contacto
            </a>
          </nav>
        </article>
      </section>
    </div>
  )
}
