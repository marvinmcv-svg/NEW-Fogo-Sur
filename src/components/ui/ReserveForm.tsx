'use client'

import { useMemo, useState } from 'react'

import { localeTags, type Locale } from '../../i18n/locales'
import { fillTemplate, whatsappLink } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../layout/WhatsAppFab'

type Labels = Partial<Record<'name' | 'date' | 'time' | 'guests' | 'occasion' | 'notes' | 'submit' | 'note', string | null>>

const todayISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

// Builds the WhatsApp message live (shown as a chat bubble) and opens
// wa.me with it. No data is stored on our side.
export function ReserveForm({
  labels,
  occasions,
  times,
  template,
  whatsapp,
  locale,
  branch,
}: {
  labels: Labels
  occasions: string[]
  times: string[]
  template: string
  whatsapp: string
  locale: Locale
  branch: string
}) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState(times[0] ?? '')
  const [guests, setGuests] = useState(2)
  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')

  const prettyDate = useMemo(() => {
    if (!date) return '…'
    const [y, m, d] = date.split('-').map(Number)
    return new Intl.DateTimeFormat(localeTags[locale], { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(y, m - 1, d)),
    )
  }, [date, locale])

  const message = fillTemplate(template, {
    name: name || '…',
    date: prettyDate,
    time: time || '…',
    guests: String(guests),
    occasion: occasion || '—',
    notes: notes || '—',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    window.open(whatsappLink(whatsapp, message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="form-wrap" style={{ marginTop: 0 }}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">{labels.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
        </label>
        <div className="form__row form__row--3">
          <label className="field">
            <span className="field__label">{labels.date}</span>
            <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field__label">{labels.time}</span>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {times.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="field">
            <span className="field__label" id="guests-label">
              {labels.guests}
            </span>
            <div className="guests" role="group" aria-labelledby="guests-label">
              <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="−">
                −
              </button>
              <output aria-live="polite">{guests}</output>
              <button type="button" onClick={() => setGuests((g) => Math.min(60, g + 1))} aria-label="+">
                +
              </button>
            </div>
          </div>
        </div>
        {occasions.length ? (
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="field__label" style={{ marginBottom: 8 }}>
              {labels.occasion}
            </legend>
            <div className="chips">
              {occasions.map((o) => (
                <label key={o}>
                  <input type="radio" name="occasion" value={o} checked={occasion === o} onChange={() => setOccasion(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <label className="field">
          <span className="field__label">{labels.notes}</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </label>
        <div>
          <button className="btn btn--yes" type="submit">
            <WhatsAppIcon size={18} />
            {labels.submit}
          </button>
        </div>
        {labels.note ? <p className="form__note">{labels.note}</p> : null}
      </form>

      <aside className="reserve-preview" aria-label="WhatsApp">
        <div className="reserve-preview__head">
          <WhatsAppIcon size={20} /> {branch} · {whatsapp}
        </div>
        <p className="reserve-preview__bubble">{message}</p>
      </aside>
    </div>
  )
}
