#!/usr/bin/env node
// Cuts the three hero reels (fire → skewer → table) from the already graded
// seed clips, so it needs no MEDIA_SRC. Each reel dissolves shot to shot and
// crossfades its tail into its head, so the loop has no jump.
//
//   node scripts/hero-reels.mjs
//
// Requires ffmpeg (libx264) and ImageMagick (convert). Updates seed/media/manifest.json.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'seed', 'media', 'video')
const manifestPath = path.join(ROOT, 'seed', 'media', 'manifest.json')

const FADE = 0.4 // dissolve between shots
const SEAM = 0.5 // tail → head crossfade
const LIMIT = 1.6 * 1048576

const REELS = [
  { key: 'hero-fire', shots: ['ritual-sparks', 'ritual-fire'],
    altEs: 'Chispas y brasas al rojo vivo bajo los espetos', altEn: 'Sparks and glowing coals beneath the skewers' },
  { key: 'hero-skewer', shots: ['skewer-spiral', 'cut-tomahawk', 'salt-medallions'],
    altEs: 'Cortes en el espeto, sal gruesa y el tomahawk listo para el fuego', altEn: 'Cuts on the skewer, coarse salt and the tomahawk ready for the fire' },
  { key: 'hero-table', shots: ['service-table', 'steak-board'],
    altEs: 'Un gaucho sirve en la mesa; tabla de carne recién cortada', altEn: 'A gaucho serves at the table; a board of freshly carved steak' },
]

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim()
const duration = (file) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])

const manifest = new Map(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).map((m) => [m.key, m]))

for (const reel of REELS) {
  const files = reel.shots.map((s) => path.join(DIR, `${s}.mp4`))
  const durs = files.map(duration)

  // 1) montage: chain xfades, each offset = running length minus the overlap
  const tmp = path.join(os.tmpdir(), `${reel.key}-montage.mp4`)
  let chain = files.map((_, i) => `[${i}:v]fps=30,settb=AVTB,setpts=PTS-STARTPTS[s${i}]`).join(';')
  let last = 's0'
  let length = durs[0]
  for (let i = 1; i < files.length; i++) {
    const out = `x${i}`
    chain += `;[${last}][s${i}]xfade=transition=fade:duration=${FADE}:offset=${(length - FADE).toFixed(3)}[${out}]`
    last = out
    length += durs[i] - FADE
  }
  run('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', chain, '-map', `[${last}]`, '-an',
    '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', tmp])

  // 2) seamless loop + final encode under the size limit
  const total = duration(tmp)
  const seam =
    `[0:v]split[a][b];[a]trim=start=${SEAM},setpts=PTS-STARTPTS[body];[b]trim=end=${SEAM},setpts=PTS-STARTPTS[head];` +
    `[body][head]xfade=transition=fade:duration=${SEAM}:offset=${(total - 2 * SEAM).toFixed(3)},format=yuv420p[v]`
  const out = path.join(DIR, `${reel.key}.mp4`)
  let crf = 23
  for (;;) {
    run('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-filter_complex', seam, '-map', '[v]', '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
    if (fs.statSync(out).size <= LIMIT || crf >= 32) break
    crf += 1
  }

  const poster = out.replace(/\.mp4$/, '.jpg')
  const png = path.join(os.tmpdir(), `${reel.key}-poster.png`)
  run('ffmpeg', ['-v', 'error', '-y', '-i', out, '-frames:v', '1', png])
  run('convert', [png, '-strip', '-interlace', 'Plane', '-quality', '82', poster])

  const bytes = fs.statSync(out).size
  const d = +duration(out).toFixed(2)
  console.log(`reel ${reel.key.padEnd(12)} ${d}s  ${(bytes / 1048576).toFixed(2)} MB  crf ${crf}`)
  manifest.set(reel.key, {
    key: reel.key, type: 'video', file: `video/${reel.key}.mp4`, poster: `video/${reel.key}.jpg`, width: 720, height: 1280,
    durationSec: d, bytes, source: reel.shots.join('+'), loop: true, altEs: reel.altEs, altEn: reel.altEn,
  })
}

fs.writeFileSync(manifestPath, `${JSON.stringify([...manifest.values()], null, 2)}\n`)
