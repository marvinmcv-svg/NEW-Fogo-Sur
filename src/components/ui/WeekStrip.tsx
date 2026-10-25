'use client'

import { useEffect, useMemo, useState } from 'react'

import { localeTags, timeZone, type Locale } from '../../i18n/locales'

export type WeekPromo = {
  id: number | string
  title: string
  highlight?: string | null
  days: string[]
  time?: string | null
  description?: string | null
  conditions?: string | null
  image?: string
}

const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

// The week at a glance: seven columns, today lit up (Bolivian time), each
// day showing what's on. "Daily" promos show on every day.
export function WeekStrip({ promos, locale, todayLabel }: { promos: WeekPromo[]; locale: Locale; todayLabel: string }) {
  const [today, setToday] = useState<string | null>(null)

  useEffect(() => {
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(new Date()).toLowerCase().slice(0, 3)
    setToday(day)
  }, [])

  // 2024-01-01 was a Monday; format a week of dates to get localized names.
  const names = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTags[locale], { weekday: 'long', timeZone: 'UTC' })
    return order.map((_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))))
  }, [locale])

  const daily = promos.filter((p) => p.days.includes('daily'))

  return (
    <div className="week">
      {daily.length ? (
        <ul className="week__daily" data-reveal="rise">
          {daily.map((p) => (
            <li key={p.id}>
              <span className="week__everyday">{everyDayLabel(locale)}</span>
              {p.highlight ? <span className="week__highlight">{p.highlight}</span> : null}
              <span className="week__title">{p.title}</span>
              {p.time ? <span className="week__time">{p.time}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <ol className="week__days">
        {order.map((day, i) => {
          const list = promos.filter((p) => p.days.includes(day))
          const isToday = day === today
          return (
            <li key={day} className={`week__day ${isToday ? 'is-today' : ''} ${list.length ? '' : 'is-empty'}`} data-reveal="rise" style={{ ['--i' as string]: i }}>
              <p className="week__name">
                {names[i]}
                {isToday ? <span className="week__today">{todayLabel}</span> : null}
              </p>
              {list.length ? (
                <ul className="week__promos">
                  {list.map((p) => (
                    <li key={p.id} className="week__promo">
                      {p.highlight ? <span className="week__highlight">{p.highlight}</span> : null}
                      <span className="week__title">{p.title}</span>
                      {p.time ? <span className="week__time">{p.time}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="week__ember" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// "Every day" in the six site languages; short UI label, not worth a CMS field.
const everyDayLabel = (locale: Locale) =>
  ({ es: 'Todos los días', en: 'Every day', pt: 'Todos os dias', fr: 'Tous les jours', de: 'Täglich', zh: '每天' })[locale]
