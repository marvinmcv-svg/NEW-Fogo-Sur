// @ts-nocheck
'use client'
/* The charts are drawn with plain DOM + SVG inside an effect (no chart
   library), so this file is checked as JavaScript. Adapted from the
   "Finance Bento" layout for the restaurant: covers instead of net worth,
   service mix instead of allocation, reservations/events instead of cash flow. */

import * as React from 'react'

export interface RestaurantBentoData {
  /** Bolivia "today", YYYY-MM-DD. */
  today: string
  /** Covers per day by service, from ~180 days ago to 13 days ahead, oldest first. */
  days: { date: string; lunch: number; dinner: number; events: number }[]
  /** Last 6 weeks: WhatsApp reservations and event inquiries received. */
  weekly: { label: string; reservations: number; events: number }[]
  /** Next 7 days of covers. */
  week: { label: string; covers: number; today: boolean }[]
  /** Most requested time slots with covers for the last 7 days. */
  slots: { time: string; covers: number; spark: number[] }[]
  avgParty: number
  last7: number
  prev7: number
  status: { comingSoon: boolean; daysLeft: number | null; label: string; hours: string | null; promo: string | null }
  pending: { name: string; date: string; guests: number | null; href: string }[]
  pendingCount: number
  goals: { name: string; progress: number; detail: string; href: string }[]
}

export interface RestaurantBentoProps {
  data: RestaurantBentoData
  title?: string
  subtitle?: string
  className?: string
}

const CSS = `.rb{--acc:#E7C46A;--ember:#E2571E;--bone:#F4EDE2;--t1:#fff;--t2:rgba(255,248,240,.62);--t3:rgba(255,248,240,.4);--hair:rgba(255,248,240,.14);--ease:cubic-bezier(.32,.72,0,1);
  --lunch:#E9C46A;--dinner:#F4EDE2;--events:#2a0d05;
  font-family:Manrope,ui-sans-serif,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;color:#fff;width:100%}
.rb *{box-sizing:border-box}
.rb .rb-c{position:relative;padding:22px;border-radius:28px;background:#0b0907;border:1px solid rgba(239,230,216,.08);color:#fff}
.rb .top{display:flex;align-items:center;gap:14px;min-height:52px;margin-bottom:18px}
.rb .top h1{margin:0;font:500 34px/1 'Cormorant Garamond',serif;letter-spacing:-.01em;flex:1;color:var(--bone)}
.rb .top h1 span{font:500 13px Manrope,sans-serif;color:var(--t3);letter-spacing:.02em;margin-left:14px}
.rb .seg{display:flex;padding:3px;gap:2px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
.rb .seg button{border:0;height:28px;min-width:48px;padding:0 12px;border-radius:11px;background:transparent;color:var(--t2);font:700 12px Manrope,sans-serif;cursor:pointer;transition:background .25s,color .25s}
.rb .seg button[aria-pressed="true"]{background:var(--bone);color:#140f0c}
.rb .seg button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.rb .grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
.rb .h1{height:376px}.rb .h2{height:176px}.rb .h3{height:330px}
.rb #cov{grid-column:span 8}.rb #mix{grid-column:span 4}.rb .kpi{grid-column:span 3}
.rb #flow{grid-column:span 5}.rb #slots{grid-column:span 4}.rb #week{grid-column:span 3}
@media (max-width:1199px){.rb #cov{grid-column:span 12}.rb #mix{grid-column:span 6;grid-row:span 2;height:auto}.rb .kpi{grid-column:span 6}
  .rb #flow{grid-column:span 12}.rb #slots,.rb #week{grid-column:span 6}}
@media (max-width:767px){.rb .rb-c{padding:16px 14px}.rb .top{flex-wrap:wrap;gap:12px}.rb .top h1{font-size:28px}.rb .top h1 span{display:block;margin:6px 0 0}
  .rb #cov{height:420px}.rb #cov .legend{flex:1 0 100%;order:3;margin-top:8px}.rb #cov .hrow,.rb #cov .nrow{flex-wrap:wrap}
  .rb #mix{grid-column:span 12;grid-row:auto;height:376px}.rb .kpi{grid-column:span 6}.rb #slots,.rb #week{grid-column:span 12}.rb .grid{gap:12px}}
@media (max-width:520px){.rb .kpi{grid-column:span 12}}
.rb .card{position:relative;border-radius:24px;overflow:hidden;opacity:0;transform:translateY(14px) scale(.985);transition:opacity .7s ease,transform .9s var(--ease)}
.rb .in .card{opacity:1;transform:none}
.rb .card .rim{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 0 0 1px rgba(255,255,255,.06);pointer-events:none;z-index:9}
.rb .g{position:absolute;inset:0}
.rb .core{position:absolute;left:10%;right:10%;top:16%;bottom:-6%;border-radius:90px;filter:blur(60px)}
.rb .glass{background:rgba(255,248,240,.045);border:1px solid rgba(255,248,240,.1)}
.rb .in-c{position:absolute;inset:0;padding:22px 24px;z-index:2}
.rb .ttl{font:500 24px/1.1 'Cormorant Garamond',serif;letter-spacing:0;display:flex;align-items:center;gap:8px}
.rb .cap{font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--acc)}
.rb .solid .cap{color:rgba(20,12,4,.7)}
.rb .big{font:500 46px/1 'Cormorant Garamond',serif;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.rb .delta{font-weight:700;font-size:12.5px;color:var(--acc);font-variant-numeric:tabular-nums}
.rb .muted{font-size:12.5px;color:var(--t3);font-weight:500}
.rb .chip{display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:11px;background:rgba(0,0,0,.8);color:#fff;font:700 11px Manrope,sans-serif;font-variant-numeric:tabular-nums}
.rb .legend{display:flex;gap:16px;font-size:12px;font-weight:600;color:var(--t2)}
.rb .legend span{display:inline-flex;align-items:center;gap:6px}
.rb .legend i{width:8px;height:8px;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.35)}
.rb .row{display:flex;align-items:center;gap:12px}
.rb .nwn{flex:0 0 auto}
.rb .num{font-variant-numeric:tabular-nums}
.rb a.lnk{color:inherit;text-decoration:none}
.rb a.lnk:hover{color:var(--acc)}
.rb .dots circle{transition:opacity .26s,transform .26s;transform-box:fill-box;transform-origin:center}
.rb .empty{position:absolute;left:24px;right:24px;bottom:84px;text-align:center;font-size:13px;color:var(--t2)}
.rb .tip{position:fixed;z-index:50;pointer-events:none;background:rgba(18,13,10,.94);color:#fff;border:1px solid rgba(255,248,240,.12);border-radius:14px;padding:9px 11px;font-size:12px;
  backdrop-filter:blur(16px);box-shadow:0 12px 30px -10px rgba(0,0,0,.6);opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s;white-space:nowrap;min-width:150px}
.rb .tip.on{opacity:1;transform:none}
.rb .tip .t{color:var(--t2);margin-bottom:5px;font-weight:600;text-transform:capitalize}
.rb .tip .r{display:flex;justify-content:space-between;gap:14px;align-items:center;line-height:19px}
.rb .tip .r span{display:inline-flex;align-items:center;gap:6px;color:var(--t2)}
.rb .tip i{width:7px;height:7px;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.35)}
.rb .tip b{font-weight:700;font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion: reduce){.rb .card{transition:none}}`

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const markup = (o) => `<div class="rb-c">
  <div class="top">
    <h1>${esc(o.title)}<span>${esc(o.subtitle)}</span></h1>
    <div class="seg" id="period" role="group" aria-label="Período"></div>
  </div>
  <div class="grid" id="grid">
    <section class="card h1" id="cov" aria-label="Cubiertos"></section>
    <section class="card h1" id="mix" aria-label="Mezcla de servicios"></section>
    <section class="card solid h2 kpi" id="res" aria-label="Reservas"></section>
    <section class="card glass h2 kpi" id="open" aria-label="Estado"></section>
    <section class="card glass h2 kpi" id="pend" aria-label="Eventos por atender"></section>
    <section class="card glass h2 kpi" id="goals" aria-label="Carta"></section>
    <section class="card h3" id="flow" aria-label="Reservas y eventos"></section>
    <section class="card h3" id="slots" aria-label="Horas pico"></section>
    <section class="card h3" id="week" aria-label="Esta semana"></section>
  </div>
</div>
<div class="tip" id="tip"></div>`

function mount(root, data) {
  let alive = true
  const frames = new Set()
  const RAF = (cb) => { if (!alive) return 0; const id = requestAnimationFrame((t) => { frames.delete(id); if (alive) cb(t) }); frames.add(id); return id }
  const $id = (id) => root.querySelector('#' + id)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ACC = '#E7C46A', T2 = 'rgba(255,248,240,.62)', T3 = 'rgba(255,248,240,.4)', HAIR = 'rgba(255,248,240,.14)'
  const COL = { lunch: '#E9C46A', dinner: '#F4EDE2', events: '#2a0d05' }
  const LBL = { lunch: 'Almuerzo', dinner: 'Cena', events: 'Eventos' }
  const ease = (t) => 1 - Math.pow(1 - t, 3)
  const NS = 'http://www.w3.org/2000/svg'
  const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e }
  const nf = (v, d = 0) => Number(v).toLocaleString('es-BO', { minimumFractionDigits: d, maximumFractionDigits: d })
  const dayLabel = (iso, opts) => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-BO', { timeZone: 'UTC', ...opts }).replace('.', '')

  /* ---------- state & windows ---------- */
  const S = { period: '14D' }
  const WIN = { '14D': [0, 13], '30D': [-16, 13], '90D': [-76, 13] }
  const idxToday = data.days.findIndex((d) => d.date === data.today)
  const T = idxToday < 0 ? data.days.length - 14 : idxToday
  const total = (p) => p.lunch + p.dinner + p.events
  function series() { const [a, b] = WIN[S.period]; return data.days.slice(Math.max(0, T + a), T + b + 1).map((d) => ({ ...d, l: dayLabel(d.date, { day: 'numeric', month: 'short' }) })) }
  function previous() { const [a, b] = WIN[S.period], n = b - a + 1; return data.days.slice(Math.max(0, T + a - n), Math.max(0, T + a)) }

  /* ---------- helpers ---------- */
  const bg = ({ top, base, bottom, core }) => `<div class="g" style="background:linear-gradient(180deg,${top} 0%,${base} 36%,${base} 74%,${bottom} 100%)"></div><div class="core" style="background:${core}"></div>`
  const GR = {
    ember: { top: '#ffb48a', base: '#b8401a', bottom: '#d8622f', core: '#1a0703' },
    char: { top: '#8a7f75', base: '#2e2621', bottom: '#4a3e36', core: '#070504' },
    gold: { top: '#f6e2a8', base: '#c49a35', bottom: '#dcb85e', core: '#2a1c04' },
    wine: { top: '#f2a49c', base: '#8e2a22', bottom: '#b8453b', core: '#1d0504' },
    copper: { top: '#f6bf96', base: '#a6552c', bottom: '#c9744a', core: '#1d0b05' },
    green: { top: '#a6e8c0', base: '#2f7a46', bottom: '#4c9c63', core: '#04170b' },
  }
  function smoothPath(P, move = true) { let d = (move ? 'M' : 'L') + `${P[0][0]},${P[0][1]}`; for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2, k = 0.17
    d += `C${p1[0] + (p2[0] - p0[0]) * k},${p1[1] + (p2[1] - p0[1]) * k} ${p2[0] - (p3[0] - p1[0]) * k},${p2[1] - (p3[1] - p1[1]) * k} ${p2[0]},${p2[1]}` } return d }
  const P2 = (r, a) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)]
  const F = { '0': ['01110','10001','10011','10101','11001','10001','01110'], '1': ['00100','01100','00100','00100','00100','00100','01110'], '2': ['01110','10001','00001','00010','00100','01000','11111'], '3': ['11111','00010','00100','00010','00001','10001','01110'], '4': ['00010','00110','01010','10010','11111','00010','00010'], '5': ['11111','10000','11110','00001','00001','10001','01110'], '6': ['00110','01000','10000','11110','10001','10001','01110'], '7': ['11111','00001','00010','00100','01000','01000','01000'], '8': ['01110','10001','10001','01110','10001','10001','01110'], '9': ['01110','10001','10001','01111','00001','00010','01100'], '.': ['0','0','0','0','0','1','1'], ' ': ['00','00','00','00','00','00','00'] }
  function DotNumber(host, pitch) {
    const cols = 48, svg = el('svg', { class: 'dots', 'aria-hidden': 'true' }, host), cells = []
    for (let c = 0; c < cols; c++) for (let r = 0; r < 7; r++) { const ci = el('circle', { cx: c * pitch + pitch / 2, cy: r * pitch + pitch / 2, r: pitch * 0.36, fill: '#fff', opacity: 0 }, svg); ci.style.transitionDelay = c * 7 + 'ms'; cells.push([c, r, ci]) }
    const set = (t) => { const on = new Set(); let x = 0; for (const ch of t) { const g = F[ch] || F[' ']; const w = g[0].length; for (let r = 0; r < 7; r++) for (let k = 0; k < w; k++) if (g[r][k] === '1') on.add((x + k) * 8 + r); x += w + 1 }
      const used = Math.max(1, x - 1); for (const [c, r, ci] of cells) { const v = on.has(c * 8 + r); ci.setAttribute('opacity', v ? 1 : c < used ? 0.08 : 0); ci.style.transform = v ? 'none' : 'scale(.55)' }
      svg.setAttribute('width', used * pitch); svg.setAttribute('height', 7 * pitch); svg.setAttribute('viewBox', `0 0 ${used * pitch} ${7 * pitch}`) }
    let raf = 0, cur = 0
    return { count(to, dur = 900) { cancelAnimationFrame(raf); const from = cur, t0 = performance.now(); let last = ''
      const f = (now) => { const t = reduce ? 1 : Math.min(1, (now - t0) / dur); cur = from + (to - from) * ease(t); const s = nf(Math.round(cur)); if (s !== last) { set(s); last = s } if (t < 1) raf = RAF(f) }; raf = RAF(f) } }
  }
  function tween(node, to, fmt, dur = 900) { const from = +node.dataset.v || 0, t0 = performance.now(); node.dataset.v = to
    ;(function f(now) { const t = reduce ? 1 : Math.min(1, (now - t0) / dur); node.textContent = fmt(from + (to - from) * ease(t)); if (t < 1) RAF(f) })(t0) }
  const tip = $id('tip')
  function showTip(x, y, title, rows) { tip.innerHTML = `<div class="t">${esc(title)}</div>` + rows.map(([k, v, c]) => `<div class="r"><span>${c ? `<i style="background:${c}"></i>` : ''}${esc(k)}</span><b>${esc(v)}</b></div>`).join('')
    tip.classList.add('on'); const r = tip.getBoundingClientRect(); let L = x + 16, Tt = y - r.height - 14; if (L + r.width > innerWidth - 8) L = x - r.width - 16; if (Tt < 8) Tt = y + 16; tip.style.left = L + 'px'; tip.style.top = Tt + 'px' }
  const hideTip = () => tip.classList.remove('on')
  const periodText = { '14D': 'próximos 14 días', '30D': 'últimos 16 días + próximos 14', '90D': 'últimos 76 días + próximos 14' }

  /* ================= cards ================= */

  /* ---- Covers: a stream of lunch / dinner / events ---- */
  const cov = $id('cov')
  cov.innerHTML = `${bg(GR.ember)}<div class="in-c">
    <div class="row hrow" style="justify-content:space-between"><div class="ttl">Cubiertos</div>
      <div class="legend"><span><i style="background:${COL.dinner}"></i>Cena</span><span><i style="background:${COL.lunch}"></i>Almuerzo</span><span><i style="background:${COL.events}"></i>Eventos</span></div></div>
    <div class="row nrow" style="margin-top:16px;align-items:flex-end;gap:16px"><div class="nwn"></div>
      <div style="padding-bottom:6px"><div class="delta nwd"></div><div class="muted nwc" style="margin-top:3px;color:rgba(255,248,240,.75)"></div></div></div>
    <svg class="nws" style="position:absolute;left:0;right:0;bottom:0;display:block" aria-hidden="true"></svg><div class="empty" hidden>Aún no hay reservas en este período.</div></div><div class="rim"></div>`
  const covNum = DotNumber(cov.querySelector('.nwn'), innerWidth < 520 ? 5.4 : 7)
  let grow = 0, covRaf = 0, D = []
  function drawCov() {
    const svg = cov.querySelector('.nws'), W = cov.clientWidth, Hh = 226, top = 26, bot = 26, mid = top + (Hh - top - bot) / 2
    svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`)
    const n = D.length, tots = D.map(total), mx = Math.max(1, ...tots), half = (Hh - top - bot) / 2
    const X = (i) => -20 + (i / Math.max(1, n - 1)) * (W + 40)
    const g = ease(grow), base = 1.2
    // Bands grow from the centre line; empty days keep a hairline so the stream stays continuous.
    const lay = D.map((p) => { const q = ((half * 2) / (mx * 1.05)) * g / 2, f = p.dinner * q, s = p.lunch * q, c = p.events * q; return { f: f + base, fs: f + s + base, fsc: f + s + c + base } })
    const band = (k) => { const Tp = D.map((p, i) => [X(i), mid - lay[i][k]]), B = D.map((p, i) => [X(i), mid + lay[i][k]]).reverse(); return smoothPath(Tp) + smoothPath(B, false) + 'Z' }
    const peak = tots.indexOf(Math.max(...tots)), ti = D.findIndex((d) => d.date === data.today)
    // Today, the busiest day and the window end; drop markers that would overlap.
    const marks = [...new Set([ti >= 0 ? ti : 0, peak, n - 1])].sort((a, b) => a - b).filter((i, k, all) => k === 0 || X(i) - X(all[k - 1]) > 90)
    svg.innerHTML = `
      <defs><linearGradient id="rbf" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".05" stop-color="#fff" stop-opacity="1"/></linearGradient>
        <mask id="rbm"><rect width="${W}" height="${Hh}" fill="url(#rbf)"/></mask></defs>
      <g mask="url(#rbm)"><path d="${band('fsc')}" fill="${COL.events}" opacity=".9"/><path d="${band('fs')}" fill="${COL.lunch}"/><path d="${band('f')}" fill="${COL.dinner}" opacity=".95"/></g>
      ${marks.map((i, k) => { const x = Math.min(W - 40, Math.max(40, X(i))); return `<g style="opacity:${g > 0.6 ? 1 : 0};transition:opacity .4s ${k * 0.08}s">
        <line x1="${x}" x2="${x}" y1="${top - 4}" y2="${Hh - bot + 4}" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/>
        <rect x="${x - 36}" y="${top - 14}" width="72" height="22" rx="11" fill="#140b07"/><text x="${x}" y="${top + 1}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Manrope">${nf(tots[i])} pax</text>
        <rect x="${x - 34}" y="${Hh - bot - 8}" width="68" height="22" rx="11" fill="#140b07"/><text x="${x}" y="${Hh - bot + 7}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${i === ti ? ACC : 'rgba(255,255,255,.75)'}" font-family="Manrope">${i === ti ? 'Hoy' : esc(D[i].l)}</text></g>` }).join('')}
      <line class="hl" y1="${top}" y2="${Hh - bot}" stroke="#fff" stroke-width="1.5" opacity="0"/>
      <rect width="${W}" height="${Hh}" fill="transparent" class="hit"/>`
    const hit = svg.querySelector('.hit'), hl = svg.querySelector('.hl')
    hit.onpointermove = (e) => { const r = svg.getBoundingClientRect(), z = r.width / W, x = (e.clientX - r.left) / z; const i = Math.max(0, Math.min(n - 1, Math.round(((x + 20) / (W + 40)) * (n - 1)))); const p = D[i]
      hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i)); hl.setAttribute('opacity', 1)
      showTip(r.left + X(i) * z, r.top + (mid - lay[i].fsc) * z, dayLabel(p.date, { weekday: 'long', day: 'numeric', month: 'short' }), [['Cena', nf(p.dinner) + ' pax', COL.dinner], ['Almuerzo', nf(p.lunch) + ' pax', COL.lunch], ['Eventos', nf(p.events) + ' pax', COL.events], ['Total', nf(total(p)) + ' pax']]) }
    hit.onpointerleave = () => { hl.setAttribute('opacity', 0); hideTip() }
  }
  function updateCov() {
    D = series(); const now = D.reduce((a, p) => a + total(p), 0), before = previous().reduce((a, p) => a + total(p), 0)
    covNum.count(now)
    cov.querySelector('.empty').hidden = now > 0
    cov.querySelector('.nwd').textContent = before ? (now >= before ? '↑ ' : '↓ ') + Math.abs(((now - before) / before) * 100).toFixed(1) + '%' : now ? 'Nuevo' : ''
    cov.querySelector('.nwc').textContent = 'pax · ' + periodText[S.period]
    cancelAnimationFrame(covRaf); const t0 = performance.now(); grow = 0
    const f = (now) => { grow = reduce ? 1 : Math.min(1, (now - t0) / 1100); drawCov(); if (grow < 1) covRaf = RAF(f) }; covRaf = RAF(f)
  }

  /* ---- Service mix: a half gauge of tick marks ---- */
  const mix = $id('mix')
  mix.innerHTML = `${bg(GR.char)}<div class="in-c">
    <div class="row" style="justify-content:space-between"><div class="ttl">Servicios</div><span class="chip" style="background:rgba(255,255,255,.1)">Mesa prom. ${data.avgParty ? nf(data.avgParty, 1) : '—'}</span></div>
    <svg class="alg" width="300" height="168" viewBox="-150 -150 300 168" style="position:absolute;left:50%;margin-left:-150px;top:70px" aria-hidden="true"></svg>
    <div class="all" style="position:absolute;left:24px;right:24px;bottom:20px"></div></div><div class="rim"></div>`
  function updateMix() {
    const sums = { dinner: 0, lunch: 0, events: 0 }; D.forEach((p) => { sums.dinner += p.dinner; sums.lunch += p.lunch; sums.events += p.events })
    const t = sums.dinner + sums.lunch + sums.events, fr = t ? { dinner: sums.dinner / t, lunch: sums.lunch / t, events: sums.events / t } : { dinner: 0, lunch: 0, events: 0 }
    const n = 56, svg = mix.querySelector('.alg'); let s = ''
    for (let i = 0; i <= n; i++) { const f = i / n, a = 180 + f * 180, cls = !t ? null : f <= fr.dinner ? 'dinner' : f <= fr.dinner + fr.lunch ? 'lunch' : 'events'; const [x1, y1] = P2(136, a), [x2, y2] = P2(i % 7 === 0 ? 112 : 118, a)
      const stroke = cls === 'events' ? '#E2571E' : cls ? COL[cls] : 'rgba(255,255,255,.18)'
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" style="opacity:0;animation:tk .4s ${i * 12}ms forwards"/>` }
    s += `<text y="-28" text-anchor="middle" font-family="Cormorant Garamond" font-weight="500" font-size="56" fill="#fff">${t ? Math.round(fr.dinner * 100) : '—'}<tspan font-size="18" dy="-26" fill="${T2}">${t ? '%' : ''}</tspan></text><text y="2" text-anchor="middle" font-size="12" font-weight="600" fill="${T3}" font-family="Manrope">en la cena</text>`
    svg.innerHTML = `<style>@keyframes tk{to{opacity:1}}</style>` + s
    mix.querySelector('.all').innerHTML = [['dinner', fr.dinner, sums.dinner], ['lunch', fr.lunch, sums.lunch], ['events', fr.events, sums.events]].map(([c, f, v], i) =>
      `<div class="row" style="height:30px;${i ? 'border-top:1px solid rgba(255,255,255,.1)' : ''}"><i style="width:8px;height:8px;border-radius:50%;background:${c === 'events' ? '#E2571E' : COL[c]}"></i><span style="flex:1;font-size:13px;font-weight:600">${LBL[c]}</span><span class="num muted" style="width:44px;text-align:right">${Math.round(f * 100)}%</span><span class="num" style="width:76px;text-align:right;font-size:13px;font-weight:600">${nf(v)} pax</span></div>`).join('')
  }

  /* ---- KPI: reservations this week (solid gold tile) ---- */
  const res = $id('res')
  const pct = data.prev7 ? ((data.last7 - data.prev7) / data.prev7) * 100 : null
  res.innerHTML = `${bg(GR.gold)}<div class="in-c" style="color:#1a1004"><div class="row" style="justify-content:space-between"><div class="cap">Reservas · 7 días</div><span class="chip">${pct === null ? (data.last7 ? 'Nuevo' : '—') : (pct >= 0 ? '+' : '−') + Math.abs(pct).toFixed(0) + '%'}</span></div>
    <div style="position:absolute;left:22px;bottom:34px;display:flex;align-items:center;gap:10px"><svg width="28" height="34" viewBox="0 0 34 40" aria-hidden="true"><path d="${pct !== null && pct < 0 ? 'M17 3v32M5 23l12 12 12-12' : 'M17 37V5M5 17L17 5l12 12'}" fill="none" stroke="#1a1004" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="big rtv" style="font-size:60px;color:#1a1004">0</span></div>
    <div class="rtp" style="position:absolute;left:24px;bottom:14px;font-size:11.5px;font-weight:600;color:rgba(26,16,4,.65)">Por WhatsApp · semana anterior: ${nf(data.prev7)}</div></div><div class="rim" style="box-shadow:inset 0 1px 0 rgba(255,255,255,.5)"></div>`
  const updateRes = () => tween(res.querySelector('.rtv'), data.last7, (v) => nf(Math.round(v)))

  /* ---- KPI: opening countdown / today ---- */
  const open = $id('open'), st = data.status
  open.innerHTML = `<div class="in-c"><div class="row" style="justify-content:space-between"><div class="cap">${st.comingSoon ? 'Próxima apertura' : 'Hoy'}</div><span class="muted">${esc(st.label)}</span></div>
    <div class="row" style="margin-top:12px;align-items:baseline;justify-content:space-between">${st.comingSoon ? `<span class="big opv" style="font-size:44px">0</span><span class="muted">días</span>` : `<span class="big" style="font-size:30px">${esc(st.hours || 'Horario por confirmar')}</span>`}</div>
    ${st.promo ? `<div class="muted" style="margin-top:4px;color:${T2}">Semana Fogo: <b style="color:${ACC}">${esc(st.promo)}</b></div>` : ''}
    <svg class="ost" width="100%" height="22" style="position:absolute;left:24px;right:24px;bottom:20px;width:calc(100% - 48px)" aria-hidden="true"></svg></div>`
  function updateOpen() {
    if (st.comingSoon) tween(open.querySelector('.opv'), st.daysLeft || 0, (v) => nf(Math.round(v)))
    // 30 ticks = the last month before opening; lit ticks are days already gone.
    const svg = open.querySelector('.ost'), W = svg.getBoundingClientRect().width || 220, n = 30, done = st.comingSoon ? Math.max(0, n - (st.daysLeft || 0)) : n; let s = ''
    for (let i = 0; i < n; i++) { const x = 1 + (i * (W - 2)) / (n - 1), on = i < done; s += `<line x1="${x}" x2="${x}" y1="${i % 7 === 0 ? 2 : 8}" y2="20" stroke="${on ? ACC : 'rgba(255,255,255,.24)'}" stroke-width="1.6" stroke-linecap="round" style="transition:stroke .2s ${i * 14}ms"/>` }
    svg.innerHTML = s
  }

  /* ---- KPI: event inquiries waiting for an answer ---- */
  const pend = $id('pend')
  pend.innerHTML = `<div class="in-c" style="padding-bottom:14px"><div class="row" style="justify-content:space-between"><div class="cap">Eventos por atender</div><span class="num muted">${nf(data.pendingCount)}</span></div>
    <div style="margin-top:10px">${data.pending.length ? data.pending.map((p, i) => `<a class="lnk row" href="${esc(p.href)}" style="height:36px;${i ? 'border-top:1px solid rgba(255,255,255,.08)' : ''}"><i style="width:24px;height:24px;border-radius:8px;background:rgba(226,87,30,.22);color:#ffb48a;display:grid;place-items:center;font:700 11px Manrope;font-style:normal">${esc(p.name.charAt(0).toUpperCase())}</i><span style="flex:1;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</span><span class="muted num" style="font-size:11.5px">${esc(p.date)}</span><span class="num" style="width:54px;text-align:right;font-size:13px;font-weight:600">${p.guests ? nf(p.guests) + ' pax' : '—'}</span></a>`).join('') : `<p class="muted" style="margin:14px 0 0">Todo al día. Las nuevas solicitudes del formulario de eventos aparecerán aquí.</p>`}</div></div>`

  /* ---- KPI: menu health as progress ticks ---- */
  const goals = $id('goals')
  goals.innerHTML = `<div class="in-c"><div class="row" style="justify-content:space-between"><div class="cap">Carta</div><span class="muted">Estado</span></div>
    ${data.goals.map((g, k) => `<a class="lnk" href="${esc(g.href)}" style="display:block;margin-top:${k ? 14 : 16}px"><div class="row" style="justify-content:space-between;font-size:13px;font-weight:600"><span>${esc(g.name)}</span><span class="num" style="font-weight:600">${Math.round(g.progress * 100)}%<span class="muted"> ${esc(g.detail)}</span></span></div>
      <svg width="100%" height="12" style="margin-top:8px;display:block" class="gl" data-f="${g.progress}" aria-hidden="true"></svg></a>`).join('')}</div>`
  function updateGoals() { RAF(() => goals.querySelectorAll('.gl').forEach((svg, k) => { const W = svg.getBoundingClientRect().width, n = 40, f = +svg.dataset.f; let s = ''
    for (let i = 0; i < n; i++) { const x = 1 + (i * (W - 2)) / (n - 1), on = i / (n - 1) <= f; s += `<line x1="${x}" x2="${x}" y1="${i % 8 === 0 ? 0 : 4}" y2="12" stroke="${on ? ACC : 'rgba(255,255,255,.24)'}" stroke-width="1.6" stroke-linecap="round" style="opacity:0;animation:tk2 .3s ${300 + k * 150 + i * 12}ms forwards"/>` }
    svg.innerHTML = '<style>@keyframes tk2{to{opacity:1}}</style>' + s })) }

  /* ---- Reservations vs. event inquiries: mirrored waves, same scale ---- */
  const flow = $id('flow'), WKS = data.weekly
  flow.innerHTML = `${bg(GR.wine)}<div class="in-c">
    <div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="ttl">Solicitudes</div><div class="muted" style="margin-top:4px;color:${T2}">Por semana · últimas 6</div></div>
      <div class="legend" style="flex-direction:column;gap:4px;align-items:flex-end"><span><i style="background:#fff"></i>Reservas</span><span><i style="background:#FFD3C2"></i>Eventos</span></div></div>
    <svg class="fls" style="position:absolute;left:0;bottom:12px" aria-hidden="true"></svg></div><div class="rim"></div>`
  let flowRaf = 0
  function updateFlow(instant) {
    const svg = flow.querySelector('.fls'), W = flow.clientWidth, Hh = 236, L = 44, R = W - 30, mid = Hh / 2, lab = 16, amp = mid - lab - 8
    const max = Math.max(4, ...WKS.map((w) => Math.max(w.reservations, w.events)))
    const step = Math.max(1, Math.ceil(max / 3)), maxR = step * 3
    svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`)
    const X = (i) => L + (i / (WKS.length - 1)) * (R - L)
    cancelAnimationFrame(flowRaf); const t0 = instant ? -1e6 : performance.now()
    const frame = (now) => { const g = ease(reduce ? 1 : Math.min(1, (now - t0) / 1200))
      const path = (arr, dir) => smoothPath(arr.map((v, i) => [X(i), mid + dir * (lab + (v / maxR) * amp * g)]))
      let s = ''
      ;[0, step, step * 2, step * 3].forEach((v) => { const yT = mid - lab - (v / maxR) * amp, yB = mid + lab + (v / maxR) * amp
        s += `<line x1="${L}" x2="${R}" y1="${yT}" y2="${yT}" stroke="${HAIR}"/><line x1="${L}" x2="${R}" y1="${yB}" y2="${yB}" stroke="${HAIR}"/>
          <text x="${L - 12}" y="${yT + 3.5}" text-anchor="end" font-size="10" fill="${T3}" font-family="Manrope">${v}</text><text x="${L - 12}" y="${yB + 3.5}" text-anchor="end" font-size="10" fill="${T3}" font-family="Manrope">${v}</text>` })
      WKS.forEach((w, i) => (s += `<text x="${X(i)}" y="${mid + 4}" text-anchor="middle" font-size="10.5" font-weight="600" fill="rgba(255,255,255,.8)" font-family="Manrope">${esc(w.label)}</text>`))
      s += `<path d="${path(WKS.map((w) => w.reservations), -1)}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`
      s += `<path d="${path(WKS.map((w) => w.events), 1)}" fill="none" stroke="#FFD3C2" stroke-width="2.4" stroke-linecap="round"/>`
      s += `<line class="hl" y1="10" y2="${Hh - 10}" stroke="#fff" stroke-opacity=".5" opacity="0"/><rect class="hit" x="${L - 10}" width="${R - L + 20}" height="${Hh}" fill="transparent"/>`
      svg.innerHTML = s
      const hit = svg.querySelector('.hit'), hl = svg.querySelector('.hl')
      hit.onpointermove = (e) => { const r = svg.getBoundingClientRect(), z = r.width / W, x = (e.clientX - r.left) / z, i = Math.max(0, Math.min(WKS.length - 1, Math.round(((x - L) / (R - L)) * (WKS.length - 1))))
        hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i)); hl.setAttribute('opacity', 1)
        showTip(r.left + X(i) * z, r.top + (mid - lab - (WKS[i].reservations / maxR) * amp) * z, 'Semana del ' + WKS[i].label, [['Reservas', nf(WKS[i].reservations), '#fff'], ['Eventos', nf(WKS[i].events), '#FFD3C2']]) }
      hit.onpointerleave = () => { hl.setAttribute('opacity', 0); hideTip() }
      if (g < 1) flowRaf = RAF(frame) }
    flowRaf = RAF(frame)
  }

  /* ---- Peak times: slots with a 7-day sparkline each ---- */
  const sl = $id('slots'), SL = data.slots, slTotal = SL.reduce((a, s) => a + s.covers, 0)
  sl.innerHTML = `${bg(GR.copper)}<div class="in-c"><div class="row" style="justify-content:space-between"><div class="ttl">Horas pico</div><span class="muted" style="color:${T2}">7 días</span></div>
    <div class="row" style="margin-top:10px;align-items:flex-end;justify-content:space-between"><span class="big slv">${SL[0] ? esc(SL[0].time) : '—'}</span><span style="padding-bottom:6px" class="muted">${SL[0] ? 'el horario más pedido' : 'sin datos aún'}</span></div>
    <div class="crb" style="margin-top:14px"></div>
    <div class="crl" style="position:absolute;left:24px;right:24px;bottom:12px"></div></div><div class="rim"></div>`
  function spark(d, id) { const W = 96, H = 30, lo = Math.min(...d), hi = Math.max(...d), pad = (hi - lo) * 0.15 || 1, Y = (v) => H - 3 - ((v - lo + pad) / (hi - lo + 2 * pad)) * (H - 6)
    const P = d.map((v, i) => [2 + (i / (d.length - 1)) * (W - 6), Y(v)]), e = P[P.length - 1], up = d[d.length - 1] >= d[0], gid = 'rbs' + id
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="${smoothPath(P)}L${e[0]},${H}L${P[0][0]},${H}Z" fill="url(#${gid})"/><path d="${smoothPath(P)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${e[0]}" cy="${e[1]}" r="3" fill="${up ? ACC : '#fff'}" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>` }
  function updateSlots() {
    if (!SL.length) { sl.querySelector('.crl').innerHTML = `<p class="muted" style="color:${T2};margin:0 0 70px">Los horarios más pedidos aparecerán con las primeras reservas.</p>`; return }
    sl.querySelector('.crb').innerHTML = `<div style="display:flex;gap:3px;height:6px">${SL.map((s, i) => `<div style="flex:0 0 calc(${(s.covers / slTotal) * 100}% - 2px);border-radius:3px;background:rgba(255,255,255,${[0.95, 0.6, 0.32][i]});transform-origin:left;transform:scaleX(0);transition:transform .8s var(--ease) ${0.1 + i * 0.1}s" class="crs"></div>`).join('')}</div>
      <div style="display:flex;gap:3px;margin-top:7px">${SL.map((s) => `<span class="num muted" style="flex:0 0 calc(${(s.covers / slTotal) * 100}% - 2px);font-size:11px;white-space:nowrap;color:${T2}">${esc(s.time)} ${Math.round((s.covers / slTotal) * 100)}%</span>`).join('')}</div>`
    RAF(() => RAF(() => sl.querySelectorAll('.crs').forEach((b) => (b.style.transform = 'scaleX(1)'))))
    sl.querySelector('.crl').innerHTML = SL.map((s, i) => `<div class="row" style="height:48px;${i ? 'border-top:1px solid rgba(255,255,255,.1)' : ''}">
      <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:700">${esc(s.time)}</div><div class="num muted" style="font-size:11px;color:${T2}">${i === 0 ? 'Pico' : 'Horario'} · 7d</div></div>${spark(s.spark, i)}
      <div style="width:70px;text-align:right"><div class="num" style="font-size:13px;font-weight:700">${nf(s.covers)} pax</div></div></div>`).join('')
  }

  /* ---- This week: capsule columns per day ---- */
  const wk = $id('week'), WK = data.week
  wk.innerHTML = `${bg(GR.green)}<div class="in-c"><div class="ttl">Esta semana</div>
    <div style="margin-top:12px"><span class="big wkv" style="font-size:40px">0</span><span class="muted" style="color:${T2}"> pax</span></div><div class="muted" style="margin-top:2px;color:${T2}">reservados · próximos 7 días</div>
    <svg class="sts" style="position:absolute;left:18px;bottom:14px" aria-hidden="true"></svg></div><div class="rim"></div>`
  function updateWeek(instant) {
    if (!instant) tween(wk.querySelector('.wkv'), WK.reduce((a, d) => a + d.covers, 0), (v) => nf(Math.round(v)))
    const svg = wk.querySelector('.sts'), W = wk.clientWidth - 36, Hh = 150, pb = 18, bw = Math.min(18, (W - 24) / WK.length - 6), max = Math.max(4, ...WK.map((d) => d.covers)), gap = (W - 24 - bw * WK.length) / (WK.length - 1)
    svg.setAttribute('width', W); svg.setAttribute('height', Hh)
    const Y = (x) => (Hh - pb) * (1 - x / max); let s = ''
    s += `<text x="0" y="${Y(max) + 8}" font-size="9.5" fill="${T3}" font-family="Manrope">${max}</text><text x="0" y="${Y(0) + 3.5}" font-size="9.5" fill="${T3}" font-family="Manrope">0</text>`
    WK.forEach((d, i) => { const X = 24 + i * (bw + gap)
      s += `<rect x="${X}" y="${Y(max)}" width="${bw}" height="${Hh - pb - Y(max)}" rx="${bw / 2}" fill="rgba(0,0,0,.28)"/>
        <rect class="sb" x="${X}" y="${Hh - pb}" width="${bw}" height="0" rx="${bw / 2}" fill="${d.today ? ACC : '#fff'}" data-y="${Y(d.covers)}" data-h="${Hh - pb - Y(d.covers)}" style="transition:y .8s var(--ease) ${i * 70}ms,height .8s var(--ease) ${i * 70}ms"/>
        <text x="${X + bw / 2}" y="${Hh - 3}" text-anchor="middle" font-size="10" font-weight="600" fill="${d.today ? '#fff' : T3}" font-family="Manrope">${esc(d.label)}</text>
        <rect class="hit" x="${X - 4}" y="0" width="${bw + 8}" height="${Hh}" fill="transparent" data-i="${i}"/>` })
    svg.innerHTML = s
    RAF(() => RAF(() => svg.querySelectorAll('.sb').forEach((b) => { b.setAttribute('y', b.dataset.y); b.setAttribute('height', b.dataset.h) })))
    svg.querySelectorAll('.hit').forEach((h) => { h.onpointermove = (e) => { const i = +h.dataset.i; showTip(e.clientX, e.clientY, WK[i].today ? 'Hoy' : WK[i].label, [['Cubiertos', nf(WK[i].covers) + ' pax', d0(WK[i])]]) }; h.onpointerleave = hideTip })
  }
  const d0 = (d) => (d.today ? ACC : '#fff')

  /* ---------- controls ---------- */
  const seg = $id('period')
  seg.innerHTML = Object.keys(WIN).map((k) => `<button type="button" aria-pressed="${S.period === k}">${k}</button>`).join('')
  seg.querySelectorAll('button').forEach((b) => (b.onclick = () => { S.period = b.textContent; seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); updateCov(); updateMix() }))
  function updateAll() { updateCov(); updateMix(); updateRes(); updateOpen(); updateGoals(); updateFlow(); updateSlots(); updateWeek() }

  let rz; const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => { if (!D.length) return; cancelAnimationFrame(covRaf); grow = 1; drawCov(); updateFlow(true); updateWeek(true); updateOpen(); updateGoals() }, 120) })
  ;['cov', 'flow', 'week', 'open'].forEach((id) => ro.observe($id(id)))
  ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!alive) return; $id('grid').classList.add('in')
    root.querySelectorAll('.card').forEach((c, i) => (c.style.transitionDelay = i * 60 + 'ms')); updateAll() })

  return () => { alive = false; frames.forEach((f) => cancelAnimationFrame(f)); ro.disconnect(); clearTimeout(rz) }
}

// Rendered into a shadow root: the admin's own stylesheet uses generic class
// names (.card, .row, .dots…) that would otherwise restyle the charts.
export function RestaurantBento({ data, title = 'Resumen', subtitle = '', className = '' }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const host = ref.current
    if (!host) return
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `<style>:host{display:block}${CSS}</style><div class="rb">${markup({ title, subtitle })}</div>`
    const stop = mount(shadow.querySelector('.rb'), data)
    return () => { stop(); shadow.innerHTML = '' }
  }, [data, title, subtitle])
  return <div ref={ref} className={className} />
}

export default RestaurantBento
