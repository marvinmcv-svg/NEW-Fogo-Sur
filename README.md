# Fogo de Chão · Ventura Sur (Santa Cruz de la Sierra)

Experience website + admin portal for Fogo de Chão's new restaurant at **Mall Ventura Sur**
(5to anillo, Doble Vía a La Guardia). Concept: **“Del fuego a tu mesa”**, a scroll story in
eight chapters that follows a churrasco evening: Fire → Ritual → Cuts → Market Table → the
green/red Card → Bar → Semana Fogo → Your table. Planning rationale lives in
[`docs/PLAN.md`](docs/PLAN.md); media review and selects in [`docs/media-review/`](docs/media-review/).

- **6 languages** with a switcher: Español (default), English, Português, Français, Deutsch, 中文.
  Visitors are routed by browser language; the choice is remembered.
- **Reservations via WhatsApp** (+591 77165787): `/reservar` builds the message live (date, time,
  guests, occasion) and opens WhatsApp. A floating WhatsApp button follows the visitor.
- **Admin portal** at `/admin` (in Spanish, can be switched to any of the 6 languages) edits
  *everything*: every chapter of the home, all pages, cuts, menu + prices (Bs), weekly promotions,
  event formats, photos/videos, brand colours, fonts, logo, WhatsApp number, address, hours,
  opening date/countdown, SEO. Event inquiries submitted on `/eventos` land in
  *Administración → Solicitudes de eventos*.

## Stack

Next.js 15 (App Router, static pages + on-save revalidation) · Payload CMS 3 (embedded admin,
field-level localization, drafts on custom pages, live preview) · GSAP ScrollTrigger + Lenis
(scroll choreography) · 2D-canvas ember field · plain CSS design system with tokens from the CMS.
SQLite locally; Postgres + Vercel Blob in production.

## Motion system (what's animated and why)

| Moment | What it does | Tied to |
|---|---|---|
| Ember field | Sparks rise behind dark chapters, faster when you scroll fast | The grill |
| Hero triptych | Three vertical reels side by side (fire → skewer → table) that drift apart on scroll; one after another on phones | The whole evening, from the fire to your table |
| Slice reveal | Media enters through a diagonal wipe | The gaucho's knife angle |
| Ritual | Pinned sequence: Select → Fire → Carve | The churrasco process |
| Cuts conveyor | Endless drifting carousel; drag/swipe; cards flip green ↔ red | Rodízio service + the card |
| Service card | 3D tilt + flip, explains green / red | *Sim por favor / Não obrigado* |
| Skewer progress | Right-edge skewer; each chapter is a cut that browns as you pass | The espeto |
| Market descent | Camera "descends" into the Market Table; details drift at different depths | Grazing the table |

Everything respects `prefers-reduced-motion` (no scroll-jacking, no particles, content shown
immediately), pauses off-screen, and videos are muted, lazy, ≤ 2.5 MB each.

## Run locally

```bash
npm install
cp .env.example .env          # optional locally
npm run seed                  # uploads graded media + 6-language content, prints admin login
npm run dev                   # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

`npm run seed` refuses to overwrite an existing database; use `SEED_FORCE=1 npm run seed` to wipe
and re-seed. Media are re-generated from the Instagram exports with `npm run media`
(`MEDIA_SRC=<folder of originals>`); when the agency sends original masters, drop them in and
re-run for sharper output. The three hero reels are cut from the graded clips with
`node scripts/hero-reels.mjs`.

## Deploy (Vercel + Supabase Postgres + Vercel Blob)

Live setup: Vercel project `fogo-de-chao-ventura-sur` (functions in `gru1`, São Paulo), Supabase
project `fogo-de-chao-ventura-sur` (`sa-east-1`), Blob store `fogo-ventura-sur-media`.

- Every push to the default branch deploys to production. The build runs `payload migrate` first
  (`npm run vercel-build`), so schema changes ship as migrations: after changing collections run
  `DATABASE_URI=postgres://x@127.0.0.1/x DATABASE_SCHEMA=payload BLOB_READ_WRITE_TOKEN=vercel_blob_rw_placeholder npm run migrate:create <name>`
  (the Blob token placeholder matters: the storage plugin adds a column only when it is enabled) and commit
  `src/migrations`.
- Env vars (Vercel → Settings → Environment Variables): `DATABASE_URI` (Supabase **IPv4 pooler**,
  role `payload`), `DATABASE_SCHEMA=payload`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` (added by the
  Blob store), `NEXT_PUBLIC_SERVER_URL` (update it when a custom domain is added).
- The CMS uses its own Postgres role and schema (`payload`), separate from Supabase's `public`.
- Seed a fresh deployment over HTTPS (no direct DB access needed):
  `SEED_REMOTE_URL=https://<domain> SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run seed`
- Pages render on first visit and are cached; every admin save refreshes them.

## Admin quick guide (para el equipo del restaurante)

- **Portada (experiencia)**: one tab per chapter; turn chapters on/off, change titles, videos, texts.
  The hero takes up to 3 vertical videos (*Videos (tríptico)*), a short eyebrow, the title and one button.
- **Ajustes generales → Contacto y reservas → Redes sociales**: Instagram, Facebook and TikTok, shared with
  the first restaurant. Paste the profile link or just the handle (`@fogodechao.bo`); empty = hidden.
  In titles, `/` forces a line break (e.g. `Del fuego / a tu mesa.`).
- **Idioma** selector (top right of each document) switches the language you are editing.
  Empty translations fall back to Spanish.
- **Carta → Platos y bebidas**: set prices in Bs. Empty price → the site shows "Consultar".
- **Semana Fogo**: promotions per weekday; "Todos los días" ones show as a band on top. Today is
  highlighted automatically (Bolivia time).
- **Ajustes generales**: WhatsApp number, address, hours, opening date (countdown while the
  status is "Próxima apertura"; switch to "Abierto" after the launch), brand colours, fonts, logo.
- **Live preview**: the eye icon on Portada / Páginas shows the page as you edit, on mobile,
  tablet or desktop.

## To confirm with the client

- Official brand kit: logo files, exact colours, licensed typeface. Upload them in
  *Ajustes generales → Marca*. (fogodechao.com was not reachable from the build environment, so
  current values are close approximations, not official.)
- Real opening date/time (seeded as 31 Oct 2026 19:00 as a placeholder), opening hours, prices.
- Original (non-Instagram) photo/video masters for sharper hero and cut imagery.
