import type { Payload } from 'payload'

import { timeZone } from '../../i18n/locales'
import type { Inquiry, Promotion, ReservationRequest, Setting } from '../../payload-types'
import { CoversChart, type CoversDay } from './CoversChart'

// The admin home: what the restaurant team needs at a glance before service.
// Everything is computed from the CMS (WhatsApp reservation log, event
// inquiries, menu, promotions, settings) in Bolivia time. Server-rendered,
// no client JavaScript; styles live in custom.scss under the `fd-` prefix.

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
const nf = (n: number) => new Intl.NumberFormat('es-BO').format(n)

const statusLabels: Record<NonNullable<Inquiry['status']>, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  confirmed: 'Confirmada',
  closed: 'Descartada',
}

// Line icons (lucide geometry), stroke = currentColor.
const icon = {
  external: 'M15 3h6v6 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01',
  plate: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
}
const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split(' M').map((p, i) => (
      <path key={i} d={i ? `M${p}` : p} />
    ))}
  </svg>
)

export default async function Dashboard({ payload, user }: Props) {
  const admin = payload.config.routes.admin
  const link = (path: string) => `${admin}${path}`
  const now = new Date()
  const today = isoDay(now)
  const horizon = addDays(today, 13)

  const [settings, upcoming, recentRes, inquiries, promos, items, itemsOff, itemsNoPrice] = await Promise.all([
    payload.findGlobal({ slug: 'settings', depth: 0 }) as Promise<Setting>,
    payload.find({
      collection: 'reservation-requests',
      where: { and: [{ date: { greater_than_equal: today } }, { date: { less_than_equal: horizon } }] },
      limit: 20000,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'reservation-requests',
      where: { createdAt: { greater_than_equal: new Date(now.getTime() - 14 * DAY).toISOString() } },
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

  const booked = upcoming.docs as ReservationRequest[]
  const recent = recentRes.docs as ReservationRequest[]
  const inq = inquiries.docs as Inquiry[]

  // Covers per day by service for the next 14 days; events count once contacted/confirmed.
  const days: CoversDay[] = Array.from({ length: 14 }, (_, i) => {
    const iso = addDays(today, i)
    return { date: iso, label: fmt(iso, { weekday: 'short' }).slice(0, 3), day: fmt(iso, { day: 'numeric' }), lunch: 0, dinner: 0, events: 0 }
  })
  const index = new Map(days.map((d) => [d.date, d]))
  for (const r of booked) {
    const d = index.get(r.date)
    if (d) d[isLunch(r.time) ? 'lunch' : 'dinner'] += r.guests
  }
  for (const e of inq) {
    if (!e.date || (e.status !== 'confirmed' && e.status !== 'contacted')) continue
    const d = index.get(isoDay(new Date(e.date)))
    if (d) d.events += e.guests ?? 0
  }
  const coversOf = (d: CoversDay) => d.lunch + d.dinner + d.events
  const covers7 = sum(days.slice(0, 7).map(coversOf))
  const coversToday = coversOf(days[0])

  const t7 = now.getTime() - 7 * DAY
  const last7 = recent.filter((r) => Date.parse(r.createdAt) >= t7)
  const prev7 = recent.filter((r) => Date.parse(r.createdAt) < t7)
  const delta = last7.length - prev7.length
  const avgParty = last7.length ? sum(last7.map((r) => r.guests)) / last7.length : null

  // Most requested times (last 7 days), by covers.
  const slotTotals = new Map<string, number>()
  for (const r of last7) if (r.time) slotTotals.set(r.time, (slotTotals.get(r.time) ?? 0) + r.guests)
  const slots = [...slotTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const slotMax = Math.max(1, ...slots.map((s) => s[1]))

  const fresh = inq.filter((i) => (i.status ?? 'new') === 'new')
  const opening = settings.openingDate ? new Date(settings.openingDate) : null
  const daysLeft = opening ? Math.ceil((opening.getTime() - now.getTime()) / DAY) : null
  const comingSoon = settings.status === 'coming-soon' && daysLeft !== null && daysLeft > 0
  const todayKey = weekdayOf(today)
  const todaysPromo = (promos.docs as Promotion[]).find((p) => p.days?.includes(todayKey) || p.days?.includes('daily'))
  const total = items.totalDocs || 1
  const menuHealth = [
    {
      name: 'Platos con precio',
      value: (items.totalDocs - itemsNoPrice.totalDocs) / total,
      detail: itemsNoPrice.totalDocs ? `${itemsNoPrice.totalDocs} sin precio` : 'Todos con precio',
      href: link('/collections/menu-items?where[price][exists]=false'),
    },
    {
      name: 'Disponibles hoy',
      value: (items.totalDocs - itemsOff.totalDocs) / total,
      detail: itemsOff.totalDocs ? `${itemsOff.totalDocs} agotados` : 'Nada agotado',
      href: link('/collections/menu-items?where[available][equals]=false'),
    },
  ]

  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now))
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = (user?.name || '').split(' ')[0]
  const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
  const dateLine = fmt(today, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase())
  const openingLabel = opening ? new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', timeZone }).format(opening) : null

  return (
    <div className="fd">
      <header className="fd-top">
        <div>
          <h1 className="fd-title">
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="fd-sub">
            {dateLine}
            {settings.branchName ? ` · ${settings.branchName}` : ''}
          </p>
        </div>
        <div className="fd-top__actions">
          <span className={`fd-status ${comingSoon ? 'fd-status--soon' : 'fd-status--open'}`}>
            <i aria-hidden="true" />
            {comingSoon ? `Apertura en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}` : 'Abierto'}
          </span>
          <a className="fd-btn" href="/" target="_blank" rel="noopener noreferrer">
            <Icon d={icon.external} /> Ver la web
          </a>
        </div>
      </header>

      <section className="fd-kpis" aria-label="Resumen">
        <article className="fd-kpi">
          <p className="fd-kpi__label">Reservas por WhatsApp</p>
          <p className="fd-kpi__value">{nf(last7.length)}</p>
          <p className="fd-kpi__meta">
            {delta === 0 ? (
              'Igual que la semana anterior'
            ) : (
              <>
                <span className={delta > 0 ? 'fd-up' : 'fd-down'}>
                  {delta > 0 ? '▲' : '▼'} {nf(Math.abs(delta))}
                </span>{' '}
                vs. semana anterior
              </>
            )}
          </p>
        </article>
        <article className="fd-kpi">
          <p className="fd-kpi__label">Cubiertos · próximos 7 días</p>
          <p className="fd-kpi__value">{nf(covers7)}</p>
          <p className="fd-kpi__meta">Hoy: {nf(coversToday)} personas</p>
        </article>
        <article className={`fd-kpi ${fresh.length ? 'fd-kpi--alert' : ''}`}>
          <p className="fd-kpi__label">Eventos por responder</p>
          <p className="fd-kpi__value">{nf(fresh.length)}</p>
          <p className="fd-kpi__meta">
            {fresh.length ? (
              <a href={link('/collections/inquiries?where[status][equals]=new')}>Responder ahora →</a>
            ) : (
              'Bandeja al día'
            )}
          </p>
        </article>
        <article className="fd-kpi">
          <p className="fd-kpi__label">Mesa promedio</p>
          <p className="fd-kpi__value">{avgParty ? avgParty.toFixed(1).replace('.', ',') : '—'}</p>
          <p className="fd-kpi__meta">{avgParty ? 'personas por reserva · 7 días' : 'Sin reservas esta semana'}</p>
        </article>
      </section>

      <section className="fd-row fd-row--main">
        <article className="fd-card">
          <header className="fd-card__head">
            <div>
              <h2>Cubiertos reservados</h2>
              <p className="fd-card__sub">Próximos 14 días, por servicio</p>
            </div>
          </header>
          <CoversChart days={days} />
        </article>

        <article className="fd-card">
          <header className="fd-card__head">
            <div>
              <h2>Hoy</h2>
              <p className="fd-card__sub">{dateLine}</p>
            </div>
          </header>
          <dl className="fd-facts">
            {comingSoon && openingLabel ? (
              <div>
                <dt>Apertura</dt>
                <dd>
                  {openingLabel} · faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Horario</dt>
              <dd>{settings.hours?.[0] ? `${settings.hours[0].days} · ${settings.hours[0].time}` : 'Sin horario cargado'}</dd>
            </div>
            <div>
              <dt>Promoción del día</dt>
              <dd>{todaysPromo ? [todaysPromo.highlight, todaysPromo.title].filter(Boolean).join(' · ') : 'Ninguna activa hoy'}</dd>
            </div>
            <div>
              <dt>Cubiertos hoy</dt>
              <dd>
                {nf(coversToday)} {coversToday === 1 ? 'persona' : 'personas'}
              </dd>
            </div>
          </dl>
          <a className="fd-link" href={link('/globals/settings')}>
            Horarios y contacto →
          </a>
        </article>
      </section>

      <section className="fd-row fd-row--lower">
        <article className="fd-card">
          <header className="fd-card__head">
            <div>
              <h2>Solicitudes de eventos</h2>
              <p className="fd-card__sub">Las más recientes del formulario de la web</p>
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
                    <th>
                      <span className="fd-sr">WhatsApp</span>
                    </th>
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
            <div className="fd-empty">
              <p>Todavía no hay solicitudes.</p>
              <span>Cuando alguien escriba desde la página de eventos, aparecerá aquí con su teléfono para responder por WhatsApp.</span>
            </div>
          )}
        </article>

        <div className="fd-stack">
          <article className="fd-card">
            <header className="fd-card__head">
              <div>
                <h2>Horarios más pedidos</h2>
                <p className="fd-card__sub">Últimos 7 días, en cubiertos</p>
              </div>
            </header>
            {slots.length ? (
              <ul className="fd-bars">
                {slots.map(([time, covers]) => (
                  <li key={time}>
                    <span className="fd-bars__label">{time}</span>
                    <span className="fd-bars__track">
                      <span style={{ width: `${(covers / slotMax) * 100}%` }} />
                    </span>
                    <span className="fd-bars__value">{nf(covers)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fd-muted">Aparecerán con las primeras reservas.</p>
            )}
          </article>

          <article className="fd-card">
            <header className="fd-card__head">
              <div>
                <h2>Estado de la carta</h2>
                <p className="fd-card__sub">{nf(items.totalDocs)} platos y bebidas</p>
              </div>
            </header>
            <ul className="fd-bars fd-bars--health">
              {menuHealth.map((g) => (
                <li key={g.name}>
                  <a href={g.href}>
                    <span className="fd-bars__label">{g.name}</span>
                    <span className="fd-bars__value">{Math.round(g.value * 100)}%</span>
                    <span className="fd-bars__track">
                      <span style={{ width: `${g.value * 100}%` }} />
                    </span>
                    <small>{g.detail}</small>
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <article className="fd-card">
            <header className="fd-card__head">
              <div>
                <h2>Accesos rápidos</h2>
              </div>
            </header>
            <nav className="fd-actions">
              <a href={link('/globals/home')}>
                <Icon d={icon.home} /> Editar portada
              </a>
              <a href={link('/collections/promotions/create')}>
                <Icon d={icon.tag} /> Nueva promoción
              </a>
              <a href={link('/collections/menu-items/create')}>
                <Icon d={icon.plate} /> Añadir plato
              </a>
              <a href={link('/collections/media/create')}>
                <Icon d={icon.image} /> Subir foto o video
              </a>
            </nav>
          </article>
        </div>
      </section>
    </div>
  )
}
