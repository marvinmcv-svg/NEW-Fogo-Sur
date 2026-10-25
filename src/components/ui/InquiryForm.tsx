'use client'

import { useState } from 'react'

type Labels = Partial<Record<'name' | 'phone' | 'email' | 'date' | 'guests' | 'eventType' | 'message' | 'submit' | 'error', string | null>>

export function InquiryForm({ labels, success, locale, types }: { labels: Labels; success: string; locale: string; types: string[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (form.get('company')) return // honeypot: bots fill every field
    setState('sending')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email') || undefined,
          date: form.get('date') || undefined,
          guests: form.get('guests') ? Number(form.get('guests')) : undefined,
          eventType: form.get('eventType') || undefined,
          message: form.get('message') || undefined,
          locale,
        }),
      })
      setState(res.ok ? 'ok' : 'error')
      if (res.ok) (e.target as HTMLFormElement).reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'ok') return <p className="form__status form__status--ok" role="status">{success}</p>

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__row">
        <label className="field">
          <span className="field__label">{labels.name}</span>
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label className="field">
          <span className="field__label">{labels.phone}</span>
          <input name="phone" required maxLength={40} type="tel" autoComplete="tel" />
        </label>
      </div>
      <div className="form__row form__row--3">
        <label className="field">
          <span className="field__label">{labels.date}</span>
          <input name="date" type="date" />
        </label>
        <label className="field">
          <span className="field__label">{labels.guests}</span>
          <input name="guests" type="number" min={1} max={500} inputMode="numeric" />
        </label>
        <label className="field">
          <span className="field__label">{labels.eventType}</span>
          <select name="eventType" defaultValue="">
            <option value="" />
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field__label">{labels.email}</span>
        <input name="email" type="email" autoComplete="email" />
      </label>
      <label className="field">
        <span className="field__label">{labels.message}</span>
        <textarea name="message" maxLength={2000} />
      </label>
      <label className="sr-only" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      {state === 'error' ? (
        <p className="form__status form__status--error" role="alert">
          {labels.error}
        </p>
      ) : null}
      <div>
        <button className="btn btn--yes" type="submit" disabled={state === 'sending'}>
          <span className="btn__dot" aria-hidden="true" />
          {labels.submit}
        </button>
      </div>
    </form>
  )
}
