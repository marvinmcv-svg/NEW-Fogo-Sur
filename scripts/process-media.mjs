#!/usr/bin/env node
// Grades, trims and encodes the selected Instagram media into web-ready seed assets.
//
//   MEDIA_SRC=/path/to/decoded/drive/files node scripts/process-media.mjs [--only key1,key2] [--skip-video] [--skip-photo]
//
// Requires ffmpeg (libx264) and ImageMagick (convert) on PATH.
// Writes seed/media/{video,photo}/ and seed/media/manifest.json.
// Timecodes below were verified frame-by-frame against the sources: every in/out
// point sits on a shot boundary and excludes burned-in promo text, logos and end-cards.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.MEDIA_SRC
const OUT = path.join(ROOT, 'seed', 'media')
if (!SRC || !fs.existsSync(SRC)) {
  console.error('Set MEDIA_SRC to the folder holding the decoded Drive files (e.g. DY-6dpRiUpm.mp4).')
  process.exit(1)
}

const args = process.argv.slice(2)
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null
const skipVideo = args.includes('--skip-video')
const skipPhoto = args.includes('--skip-photo')

// ---------------------------------------------------------------------------
// The look: warm cinematic, dense-but-open blacks, rolled highlights, saturation
// reined in (greens/cyans/blues pulled hardest so fire and meat carry the colour).
// Per-asset overrides tune saturation/exposure where a source is off.
// ---------------------------------------------------------------------------
const GRADE_DEFAULT = { sat: 0.9, gamma: 0.96, bright: 0, contrast: 1.04, greens: -0.3, cool: -0.25, reds: 0, yellows: 0, soften: 0 }
// Over-processed HDR carousel shots: heavy desaturation + softened halo micro-contrast
const HDR = { sat: 0.66, gamma: 0.94, greens: -0.5, reds: -0.22, yellows: -0.15, cool: -0.35, soften: 0.55 }

function gradeChain(g = {}) {
  const p = { ...GRADE_DEFAULT, ...g }
  return [
    // negative unsharp = local-contrast reduction, undoes the crunchy HDR halos
    p.soften ? `unsharp=luma_msize_x=7:luma_msize_y=7:luma_amount=-${p.soften}:chroma_msize_x=5:chroma_msize_y=5:chroma_amount=-${p.soften}` : null,
    `eq=contrast=${p.contrast}:brightness=${p.bright}:saturation=${p.sat}:gamma=${p.gamma}`,
    // tame greens/yellow-greens, then cyans/blues, then (optionally) reds
    `huesaturation=saturation=${p.greens}:colors=g:strength=1.5`,
    `huesaturation=saturation=${p.cool}:colors=c+b:strength=1.5`,
    p.reds ? `huesaturation=saturation=${p.reds}:colors=r+m:strength=1.2` : null,
    p.yellows ? `huesaturation=saturation=${p.yellows}:colors=y:strength=1.2` : null,
    // warm shadows a touch, warm mids, keep highlights golden but not orange
    'colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.025:gm=0.005:bm=-0.035:rh=0.015:gh=0.005:bh=-0.03',
    // gentle filmic S: lifted toe (no crushed blacks), soft shoulder
    "curves=master='0/0.025 0.18/0.15 0.5/0.5 0.82/0.84 1/0.975'",
  ]
    .filter(Boolean)
    .join(',')
}

// crop away the bottom fraction, keep 9:16 by trimming width, then back to 720x1280
const cropBottom916 = (frac) =>
  `crop=floor(ih*${1 - frac}*9/16/2)*2:floor(ih*${1 - frac}/2)*2:(iw-floor(ih*${1 - frac}*9/16/2)*2)/2:0,scale=720:1280:flags=lanczos`

// ---------------------------------------------------------------------------
// VIDEO selects. in/out = seconds in the source reel.
// loop: crossfade the tail into the head so the clip loops without a jump.
// ---------------------------------------------------------------------------
const VIDEOS = [
  { key: 'hero-flame', src: 'DeQCzqKjEYo', in: 0.0, out: 1.6, loop: 0.3, hero: true,
    altEs: 'Brasas y chispas que se convierten en llamas', altEn: 'Embers and sparks rising into open flame' },
  { key: 'hero-carve', src: 'DY-6dpRiUpm', in: 0.0, out: 12.0, loop: 0.5, hero: true,
    altEs: 'Un gaucho corta picanha jugosa directamente del espeto', altEn: 'A gaucho carves juicy picanha straight from the skewer' },
  { key: 'ritual-select', src: 'DeAzCNYFRUk', in: 0.0, out: 7.43,
    altEs: 'Corte, doblado y ensartado de la picanha en el espeto', altEn: 'Picanha being cut, folded and threaded onto the skewer' },
  { key: 'ritual-fire', src: 'DeAzCNYFRUk', in: 7.5, out: 12.37,
    altEs: 'Espetos de carne sobre brasas al rojo vivo', altEn: 'Skewered meat over glowing coals' },
  { key: 'ritual-sparks', src: 'Deo96S8jVLk', in: 5.1, out: 8.27,
    altEs: 'Chispas que saltan sobre los espetos en la parrilla', altEn: 'Sparks flying over skewers on the grill' },
  { key: 'ritual-cut', src: 'DeE3u4JjtdU', in: 5.47, out: 13.3,
    altEs: 'El cuchillo atraviesa la carne en su punto, rosada por dentro', altEn: 'The knife slices through medium-rare meat' },
  { key: 'skewer-spiral', src: 'DeE3u4JjtdU', in: 0.0, out: 5.4,
    altEs: 'Picanha dorada en espiral sobre el espeto', altEn: 'Golden picanha spiralled on the skewer' },
  { key: 'salt-medallions', src: 'DeE3u4JjtdU', in: 13.37, out: 15.07,
    altEs: 'Un gaucho sazona medallones con sal gruesa', altEn: 'A gaucho seasons medallions with coarse salt' },
  { key: 'cut-tomahawk', src: 'DeQCzqKjEYo', in: 8.23, out: 9.53,
    altEs: 'Tomahawk marmoleado en el espeto, con sal gruesa', altEn: 'Marbled tomahawk on the skewer with coarse salt' },
  { key: 'cut-tbone', src: 'DeQCzqKjEYo', in: 6.4, out: 7.83,
    altEs: 'Sal cayendo sobre un T-bone crudo', altEn: 'Salt falling onto a raw T-bone' },
  { key: 'cut-ribeye', src: 'Dcj68SwkZW6', in: 1.13, out: 2.53,
    altEs: 'Bife ancho marmoleado en el espeto', altEn: 'Marbled ribeye on the skewer' },
  { key: 'cut-costela', src: 'Dc6ZmU7G3P0', in: 0.0, out: 5.2,
    altEs: 'Costillas y cortes girando en la parrilla y trinchados en la tabla', altEn: 'Ribs and cuts turning on the rotisserie, then carved on the board' },
  { key: 'cut-sliced', src: 'DdtoJ_PickS', in: 17.93, out: 26.1,
    altEs: 'Láminas de carne jugosa sobre un bloque de sal', altEn: 'Juicy slices of steak on a salt block' },
  { key: 'butcher', src: 'DdtoJ_PickS', in: 0.0, out: 8.23,
    altEs: 'Sazonado, fuego y corte del bife', altEn: 'Seasoning, fire and carving of the steak' },
  { key: 'service-table', src: 'Dcj68SwkZW6', in: 6.87, out: 12.23,
    altEs: 'Gauchos sirven carne en la mesa a comensales sonrientes', altEn: 'Gauchos carve meat tableside for smiling guests' },
  { key: 'market-overhead', src: 'DcWhDYEF_f5', in: 13.07, out: 16.87, loop: 0.4,
    altEs: 'La Mesa del Mercado vista desde arriba bajo las lámparas doradas', altEn: 'The Market Table from above beneath the golden chandeliers' },
  { key: 'steak-board', src: 'DcWhDYEF_f5', in: 6.77, out: 11.27,
    altEs: 'Bife sobre bloque de sal y tabla servida en la mesa', altEn: 'Steak on a salt block and a board served at the table' },
  { key: 'facade-day', src: 'Dcj68SwkZW6', in: 12.3, out: 13.3,
    altEs: 'Fachada de Fogo de Chão con vegetación y toldos', altEn: 'Fogo de Chão façade with greenery and awnings' },
  { key: 'exterior-night', src: 'DYYTPUlCoAw', in: 11.27, out: 12.7,
    altEs: 'Fachada de Fogo de Chão iluminada de noche', altEn: 'Fogo de Chão façade lit up at night' },
  { key: 'chimichurri', src: 'Dc19SNXgZ1D', in: 6.5, out: 9.3, grade: { sat: 0.86, greens: -0.35 },
    altEs: 'Chimichurri que cae sobre un bife jugoso', altEn: 'Chimichurri spooned over a juicy steak' },
  { key: 'bar-ice', src: 'DYYTPUlCoAw', in: 0.0, out: 0.7,
    altEs: 'Hielo y lima en un vaso de caipirinha', altEn: 'Ice and lime in a caipirinha glass' },
  { key: 'bar-pour', src: 'DYYTPUlCoAw', in: 3.03, out: 4.47,
    altEs: 'Cóctel rojo servido desde la coctelera', altEn: 'A red cocktail poured from the shaker' },
  { key: 'bar-spritz', src: 'DYYTPUlCoAw', in: 8.03, out: 9.2, crop: 0.12,
    altEs: 'Spritz con naranja en copa de vino', altEn: 'An orange spritz in a wine glass' },
  { key: 'bar-torch', src: 'DYYTPUlCoAw', in: 9.7, out: 10.97, crop: 0.12,
    altEs: 'Cóctel ahumado con soplete en la barra', altEn: 'A cocktail torched at the bar' },
]

// ---------------------------------------------------------------------------
// PHOTO selects. crop = fraction removed from the bottom (baked-in watermark).
// ---------------------------------------------------------------------------
const PHOTOS = [
  { key: 'fire-skewers', src: 'DcKEsvxCUBc_02', crop: 0.11, grade: { sat: 0.88 },
    altEs: 'Cortes en espetos dorándose sobre el fuego', altEn: 'Cuts on skewers browning over the fire' },
  { key: 'gaucho-carving', src: 'DcKEsvxCUBc_03', crop: 0.11, grade: { sat: 0.9 },
    altEs: 'Un gaucho corta carne del espeto en la mesa', altEn: 'A gaucho carves meat from the skewer at the table' },
  { key: 'salting', src: 'DcKEsvxCUBc_01', crop: 0.11, grade: { sat: 0.82, soften: 0.3 },
    altEs: 'Sal gruesa sobre picanha cruda en espetos', altEn: 'Coarse salt over raw picanha on skewers' },
  { key: 'market-chandeliers', src: 'DcB97a-jNUr_01', crop: 0.11, grade: { ...HDR, sat: 0.72 },
    altEs: 'La Mesa del Mercado bajo lámparas de flecos dorados', altEn: 'The Market Table beneath gold fringe chandeliers' },
  { key: 'market-overhead-2', src: 'DdZJbB1nJlh_01', crop: 0, grade: { ...HDR, sat: 0.74 },
    altEs: 'Vista aérea de la Mesa del Mercado', altEn: 'Aerial view of the Market Table' },
  { key: 'orange-rose', src: 'DdZJbB1nJlh_04', crop: 0, grade: { ...HDR, sat: 0.66, reds: -0.25, yellows: 0 },
    altEs: 'Rosa de naranja sobre sandía', altEn: 'An orange-peel rose on watermelon' },
  { key: 'figs', src: 'DdZJbB1nJlh_05', crop: 0, grade: { ...HDR },
    altEs: 'Higos frescos abiertos', altEn: 'Fresh halved figs' },
  { key: 'honey-station', src: 'DcB97a-jNUr_02', crop: 0.11, grade: { ...HDR },
    altEs: 'Miel, mermeladas y frutos secos en la Mesa del Mercado', altEn: 'Honey, jams and nuts at the Market Table' },
  { key: 'steak-chimichurri', src: 'Db_z-hmCRkf_03', crop: 0.11, grade: { sat: 0.84, greens: -0.35, soften: 0.25 },
    altEs: 'Bife en láminas con chimichurri', altEn: 'Sliced steak with chimichurri' },
  { key: 'steak-board-top', src: 'Db_z-hmCRkf_01', crop: 0.11, grade: { sat: 0.82, greens: -0.35, soften: 0.3 },
    altEs: 'Tabla de bife con salsas, vista cenital', altEn: 'Steak board with sauces, from above' },
  { key: 'cheese-honey', src: 'DYm3gq2mlNt_02', crop: 0, grade: { sat: 0.9 },
    altEs: 'Miel sobre queso a la parrilla', altEn: 'Honey poured over grilled cheese' },
  { key: 'ceviche', src: 'DcOjaOcHGlm_02', crop: 0.11, grade: { sat: 0.82, greens: -0.35 },
    altEs: 'Ceviche con crocantes', altEn: 'Ceviche with crisps' },
  { key: 'ceviche-board', src: 'DcOjaOcHGlm_03', crop: 0.11, grade: { sat: 0.84 },
    altEs: 'Ceviche sobre tabla de madera, vista cenital', altEn: 'Ceviche on a wooden board, from above' },
  { key: 'charcuterie-drinks', src: 'DcEIcPsnBzX_04', crop: 0.11, grade: { sat: 0.76, reds: -0.12, soften: 0.3 },
    altEs: 'Tabla de fiambres y quesos con vino y chopp', altEn: 'Charcuterie and cheese board with wine and draught beer' },
  { key: 'charcuterie-detail', src: 'DcEIcPsnBzX_02', crop: 0.11, grade: { sat: 0.74, reds: -0.15, soften: 0.35 },
    altEs: 'Detalle de quesos, fiambres y frutas', altEn: 'Detail of cheeses, cured meats and fruit' },
]

// Stills for cut cards, pulled from the source reels (sharpest frame near `at`).
const STILLS = [
  { key: 'still-picanha', src: 'DY-6dpRiUpm', at: 5.0, altEs: 'Picanha cortada en el espeto', altEn: 'Picanha carved on the skewer' },
  { key: 'still-tomahawk', src: 'DeQCzqKjEYo', at: 8.9, altEs: 'Tomahawk en el espeto', altEn: 'Tomahawk on the skewer' },
  { key: 'still-tbone', src: 'DeQCzqKjEYo', at: 7.0, altEs: 'T-bone crudo con sal gruesa', altEn: 'Raw T-bone with coarse salt' },
  { key: 'still-ribeye', src: 'Dcj68SwkZW6', at: 1.8, altEs: 'Bife ancho marmoleado', altEn: 'Marbled ribeye' },
  { key: 'still-costela', src: 'Dc6ZmU7G3P0', at: 0.4, altEs: 'Costilla en la parrilla giratoria', altEn: 'Beef rib on the rotisserie' },
  { key: 'still-sliced', src: 'DdtoJ_PickS', at: 19.0, altEs: 'Bife en láminas sobre bloque de sal', altEn: 'Sliced steak on a salt block' },
  { key: 'still-spiral', src: 'DeE3u4JjtdU', at: 3.0, altEs: 'Picanha en espiral en el espeto', altEn: 'Spiralled picanha on the skewer' },
  { key: 'still-gaucho-service', src: 'Dcj68SwkZW6', at: 7.6, altEs: 'Gaucho sirviendo en la mesa', altEn: 'Gaucho serving at the table' },
  { key: 'still-market-overhead', src: 'DcWhDYEF_f5', at: 15.2, altEs: 'Mesa del Mercado desde arriba', altEn: 'Market Table from above' },
  { key: 'still-exterior-night', src: 'DYYTPUlCoAw', at: 11.9, altEs: 'Fachada de noche', altEn: 'Façade at night' },
  { key: 'still-bar-spritz', src: 'DYYTPUlCoAw', at: 8.6, crop: 0.12, altEs: 'Spritz con naranja', altEn: 'Orange spritz' },
  { key: 'still-flame', src: 'DeQCzqKjEYo', at: 1.5, win: 1, altEs: 'Llamas de la parrilla', altEn: 'Flames from the grill' },
]

// ---------------------------------------------------------------------------
const run = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const probe = (file, entries) =>
  run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0', file]).trim()
const want = (key) => !only || only.has(key)
const mb = (b) => (b / 1048576).toFixed(2)

fs.mkdirSync(path.join(OUT, 'video'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'photo'), { recursive: true })
const manifestPath = path.join(OUT, 'manifest.json')
const manifest = new Map(
  (fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : []).map((m) => [m.key, m]),
)

function encodeVideo(v) {
  const src = path.join(SRC, `${v.src}.mp4`)
  const out = path.join(OUT, 'video', `${v.key}.mp4`)
  const dur = +(v.out - v.in).toFixed(3)
  const geo = v.crop ? cropBottom916(v.crop) : 'scale=720:1280:flags=lanczos'
  const base = `${geo},fps=30,${gradeChain(v.grade)},format=yuv420p`
  // loop: overlap the last `loop` seconds with the first ones (dissolve), so out→in is seamless
  const filter = v.loop
    ? `[0:v]${base},split[a][b];[a]trim=start=${v.loop},setpts=PTS-STARTPTS[body];[b]trim=end=${v.loop},setpts=PTS-STARTPTS[head];` +
      `[body][head]xfade=transition=fade:duration=${v.loop}:offset=${(dur - 2 * v.loop).toFixed(3)},format=yuv420p[v]`
    : `[0:v]${base}[v]`
  const limit = (v.hero ? 2.0 : 2.5) * 1048576
  let crf = 23
  for (;;) {
    run('ffmpeg', ['-v', 'error', '-y', '-ss', String(v.in), '-t', String(dur), '-i', src,
      '-filter_complex', filter, '-map', '[v]', '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
    if (fs.statSync(out).size <= limit || crf >= 32) break
    crf += 1
  }
  const poster = out.replace(/\.mp4$/, '.jpg')
  run('ffmpeg', ['-v', 'error', '-y', '-i', out, '-frames:v', '1', '-q:v', '3', path.join(os.tmpdir(), 'poster.png')])
  run('convert', [path.join(os.tmpdir(), 'poster.png'), '-strip', '-interlace', 'Plane', '-quality', '82', poster])
  const [w, h] = probe(out, 'stream=width,height').split(',').map(Number)
  const d = +(+run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out])).toFixed(2)
  const bytes = fs.statSync(out).size
  console.log(`video ${v.key.padEnd(18)} ${d}s  ${mb(bytes)} MB  crf ${crf}`)
  manifest.set(v.key, {
    key: v.key, type: 'video', file: `video/${v.key}.mp4`, poster: `video/${v.key}.jpg`, width: w, height: h,
    durationSec: d, bytes, source: v.src, in: v.in, out: v.out, loop: Boolean(v.loop), altEs: v.altEs, altEn: v.altEn,
  })
}

function writeJpeg(pngIn, out, quality, maxLong) {
  const resize = maxLong ? ['-resize', `${maxLong}x${maxLong}>`] : []
  run('convert', [pngIn, ...resize, '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', '-quality', String(quality), out])
}

function processPhoto(p) {
  const src = path.join(SRC, `${p.src}.jpg`)
  const out = path.join(OUT, 'photo', `${p.key}.jpg`)
  const tmp = path.join(os.tmpdir(), `${p.key}.png`)
  const crop = p.crop ? `crop=iw:floor(ih*${1 - p.crop}/2)*2:0:0,` : ''
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `${crop}format=gbrp,${gradeChain(p.grade)},format=rgb24`, tmp])
  writeJpeg(tmp, out, 82)
  const [w, h] = run('identify', ['-format', '%w,%h', out]).split(',').map(Number)
  const bytes = fs.statSync(out).size
  console.log(`photo ${p.key.padEnd(18)} ${w}x${h}  ${(bytes / 1024).toFixed(0)} KB`)
  manifest.set(p.key, { key: p.key, type: 'photo', file: `photo/${p.key}.jpg`, width: w, height: h, bytes, source: p.src, altEs: p.altEs, altEn: p.altEn })
}

// pick the sharpest frame within ±win×0.1s of `at` (win keeps the search inside one shot) (variance of a Laplacian-ish edge map)
function sharpestFrame(src, at, crop, win = 3) {
  let best = null
  for (let i = -win; i <= win; i++) {
    const t = Math.max(0, at + i * 0.1)
    const f = path.join(os.tmpdir(), `cand_${i + 3}.png`)
    const geo = crop ? cropBottom916(crop) : 'scale=720:1280:flags=lanczos'
    run('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', src, '-frames:v', '1', '-vf', geo, f])
    const score = +run('convert', [f, '-colorspace', 'Gray', '-morphology', 'Convolve', 'Laplacian:0', '-format', '%[fx:standard_deviation]', 'info:'])
    if (!best || score > best.score) best = { t, score, f }
  }
  return best
}

function processStill(s) {
  const src = path.join(SRC, `${s.src}.mp4`)
  const out = path.join(OUT, 'photo', `${s.key}.jpg`)
  const best = sharpestFrame(src, s.at, s.crop, s.win)
  const tmp = path.join(os.tmpdir(), `${s.key}.png`)
  run('ffmpeg', ['-v', 'error', '-y', '-i', best.f, '-vf', `format=gbrp,${gradeChain(s.grade)},format=rgb24`, tmp])
  writeJpeg(tmp, out, 85)
  const [w, h] = run('identify', ['-format', '%w,%h', out]).split(',').map(Number)
  const bytes = fs.statSync(out).size
  console.log(`still ${s.key.padEnd(22)} @${best.t.toFixed(2)}s  ${(bytes / 1024).toFixed(0)} KB`)
  manifest.set(s.key, { key: s.key, type: 'photo', file: `photo/${s.key}.jpg`, width: w, height: h, bytes, source: s.src, in: +best.t.toFixed(2), altEs: s.altEs, altEn: s.altEn })
}

if (!skipVideo) VIDEOS.filter((v) => want(v.key)).forEach(encodeVideo)
if (!skipPhoto) {
  PHOTOS.filter((p) => want(p.key)).forEach(processPhoto)
  STILLS.filter((s) => want(s.key)).forEach(processStill)
}

const order = [...VIDEOS, ...PHOTOS, ...STILLS].map((x) => x.key)
const list = order.filter((k) => manifest.has(k)).map((k) => manifest.get(k))
fs.writeFileSync(manifestPath, JSON.stringify(list, null, 2) + '\n')
const total = list.reduce((s, m) => s + m.bytes + (m.poster ? fs.statSync(path.join(OUT, m.poster)).size : 0), 0)
console.log(`\n${list.length} assets, ${mb(total)} MB → ${path.relative(ROOT, OUT)}`)

export { VIDEOS, PHOTOS, STILLS, gradeChain }
