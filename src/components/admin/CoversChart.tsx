// Stacked bars of covers per day (lunch / dinner / events), drawn as plain SVG
// on the server. Each day carries a native tooltip and a screen-reader table.

export type CoversDay = { date: string; label: string; day: string; lunch: number; dinner: number; events: number }

const series = [
  { key: 'dinner', label: 'Cena' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'events', label: 'Eventos' },
] as const

const W = 700
const H = 220
const PAD = { top: 12, right: 8, bottom: 40, left: 32 }

// Round axis maxima whose halves are round too (4, 8, 10, 20, 40, 60, 80, 100…).
const niceMax = (n: number) => {
  if (n <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(n))
  const m = [1, 2, 4, 6, 8, 10].find((x) => x * p >= n)!
  return m * p
}

export function CoversChart({ days }: { days: CoversDay[] }) {
  const totals = days.map((d) => d.lunch + d.dinner + d.events)
  const max = niceMax(Math.max(...totals))
  const empty = totals.every((t) => t === 0)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const step = plotW / days.length
  const barW = Math.min(28, step * 0.56)
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH
  const ticks = [0, max / 2, max]

  return (
    <figure className="fd-chart">
      <ul className="fd-legend">
        {series.map((s) => (
          <li key={s.key}>
            <i className={`fd-sw fd-sw--${s.key}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="fd-chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cubiertos reservados por día y servicio, próximos 14 días">
          {ticks.map((t) => (
            <g key={t} className="fd-axis">
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'fd-axis__base' : undefined} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {days.map((d, i) => {
            const cx = PAD.left + step * i + step / 2
            let acc = 0
            const segments = series
              .map((s) => ({ key: s.key, value: d[s.key] }))
              .filter((s) => s.value > 0)
            return (
              <g key={d.date} className={`fd-day ${i === 0 ? 'fd-day--today' : ''}`}>
                <title>
                  {`${d.label} ${d.day}: ${totals[i]} cubiertos` +
                    (totals[i] ? ` (cena ${d.dinner}, almuerzo ${d.lunch}, eventos ${d.events})` : '')}
                </title>
                <rect className="fd-day__hit" x={cx - step / 2} y={PAD.top} width={step} height={plotH} />
                {segments.map((s, k) => {
                  const top = y(acc + s.value)
                  const h = y(acc) - top - (k > 0 ? 2 : 0) // 2px surface gap between stacked fills
                  acc += s.value
                  const isTop = k === segments.length - 1
                  return (
                    <rect
                      key={s.key}
                      className={`fd-seg fd-seg--${s.key}`}
                      x={cx - barW / 2}
                      y={top}
                      width={barW}
                      height={Math.max(h, 1)}
                      rx={isTop ? 4 : 0}
                    />
                  )
                })}
                <text className="fd-xlabel" x={cx} y={H - 22} textAnchor="middle">
                  {d.label}
                </text>
                <text className="fd-xlabel fd-xlabel--day" x={cx} y={H - 8} textAnchor="middle">
                  {d.day}
                </text>
              </g>
            )
          })}
        </svg>
        {empty ? <p className="fd-chart__empty">Aún no hay reservas para estas fechas.</p> : null}
      </div>
      <table className="fd-sr">
        <caption>Cubiertos reservados por día</caption>
        <thead>
          <tr>
            <th>Día</th>
            {series.map((s) => (
              <th key={s.key}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{`${d.label} ${d.day}`}</td>
              {series.map((s) => (
                <td key={s.key}>{d[s.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
