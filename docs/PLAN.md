# Fogo de Chão Santa Cruz: Website Experience Plan

Planning document for the Fogo de Chão website for Santa Cruz de la Sierra, Bolivia (Boulevard · Ventura Mall).
Nothing is built yet. This plan has to be approved before production starts.

- Media review boards: [`docs/media-review/`](media-review/), starting with [`selects-board.jpg`](media-review/selects-board.jpg)
- Selected assets with clean timecodes: [`docs/media-selects.json`](media-selects.json)

---

## 0. Decisions needed before build

These need your answer (or the client's) first. Each one changes what we build.

| # | Question | Why it matters |
|---|----------|----------------|
| Q1 | **Which location is new?** Every reel end-card reads *"Boulevard · Ventura Mall"*, and the content shows that restaurant already operating (Happy Hour, Lunes de Fogo, terrace, exterior signage). Is Ventura Mall the **second** store opening now, or is it the existing store with the new one somewhere else? | It decides the hero message ("Abrimos en Ventura" vs. "Ahora en dos ubicaciones"), the location pages, and the structured data. |
| Q2 | **Can we get the original files?** Everything in Drive was downloaded from Instagram: reels at 720×1280, photos at 1080×1350, and Instagram compression on both. | A world-class, full-bleed desktop hero needs at least 1080p, and ideally 4K horizontal masters. See §6. |
| Q3 | **How do reservations work?** WhatsApp, phone, OpenTable/SevenRooms, or a custom form? | It's the main conversion. In Bolivia WhatsApp is the expected channel. |
| Q4 | **Brand guidelines from Fogo de Chão corporate.** Do we have the official font licence, logo files and colour codes? | It's a franchise. The corporate brand rules come first, and we can't stretch them without approval. |
| Q5 | **Which promotions are current?** Lunes de Fogo −50%, Martes 2×1, Jueves Rodizio Ejecutivo, Happy Hour 2×70 cocktails (18:00–00:00). | These become a "Semana Fogo" section that the restaurant updates itself (CMS), so we need the real list. |
| Q6 | **Languages:** Spanish only, or ES + EN (tourists, business travel)? PT? | Affects routing, copy budget and SEO. |
| Q7 | **Prices on the site?** Rodizio price, Market Table only, kids' pricing. | Price transparency converts, but some franchises forbid publishing prices. |

---

## 1. What I reviewed

The Drive folder contains 10 carousels (33 slides), 1 single photo and 21 reels. I downloaded, decoded and reviewed everything except one asset:

- **`Dbb3VDgpCRb.mp4` (6.7 MB) could not be retrieved.** It's over the Drive connector's transfer limit, and this sandbox's network policy blocks direct Google downloads. Please re-upload it in a smaller size or send it another way if it matters.
- `DcR5PABj40O` is a re-post of `DYYTPUlCoAw` (same Happy Hour edit). I treated it as a duplicate.
- The second set of `Carousels / Photos / Videos` folders in the root is empty.

How I reviewed it: a contact sheet for every photo, a 10-frame strip for every reel, then 1-frame-per-second timestamped strips for the 10 strongest reels to find clean in/out points with no burned-in promo text.

### Findings

1. **The reel footage is the best material we have.** It includes professional, cinematic, shallow-depth-of-field macro craft: picanha folded onto the skewer, coals, sparks, carving in slow motion, salt falling, a tomahawk on the skewer. It is far better than the photography and should lead the site.
2. **Promo text is burned into the video.** Most reels have text baked in ("LUNES DE FOGO −50%", "2x70", "Los Jueves…"). The only usable parts are the clean segments I logged. Never put a reel on the site whole.
3. **The FOGO DE CHÃO watermark is in the lower ~12% of nearly every photo.** Each photo needs a crop, or content-aware removal, before use.
4. **The colour grading doesn't match across assets.** The reels have a warm, low-key cinematic grade. Several carousels (`DcB97a-jNUr_03/04`, `DdZJbB1nJlh_02/06`) are pushed HDR with oversaturated greens and reds, and they look cheap next to the reels. Everything we use must go through **one** LUT (see §4.3).
5. **The copy voice is inconsistent.** The reels mix Argentine voseo ("Disfrutá") with tú ("Tú decides"). Bolivian Spanish uses **tú**, so the site copy should standardise on it.
6. **Brand assets we should build on:**
   - **Gaucho uniform:** white shirt, burgundy-red tie, dark vest and belt. It's the human face of the brand.
   - **Gold fringe chandeliers** over the Market Table, the venue's signature interior.
   - **The green/red card:** "YES, PLEASE / SIM POR FAVOR" and "NO THANKS / NÃO OBRIGADO" (`Dej3hP_jmYp_03`). It's the most recognisable ritual Fogo has, and an obvious interaction metaphor.
   - **Night exterior:** dark façade, hanging greenery, warm signage.
   - **Embers and sparks:** already used as the closing motif in their own edits.

---

## 2. Creative concept: *"Del fuego a tu mesa"* (From the fire to your table)

The site follows the order of a churrasco evening instead of a generic restaurant template:
**Fire → Craft → Market Table → the Card → the Bar → Your table (book).**

The animations come from what actually happens in the restaurant:

| Real-world ritual | Interaction / motion it becomes |
|---|---|
| Embers and sparks rising from the grill | A slow ember particle field drifts up behind dark sections and intensifies on scroll velocity. It's the site's "heartbeat". |
| The gaucho's knife slicing down the skewer | **"Slice" reveal:** images and headlines enter through a diagonal mask wipe at the same angle as the knife in `DY-6dpRiUpm`. This is the signature transition, used sparingly. |
| Meats on a vertical skewer | **Skewer scroll-progress:** a thin vertical skewer on the right edge. Each chapter adds a "cut" to it, so the page reads as a full skewer by the end. |
| Green card / red card | **Flip-card toggles** (3D flip, 600 ms). In "Los Cortes" the green side shows the cut's story and the red side shows its details. The final booking CTA is the green card: "¿Lista tu mesa? → SÍ, POR FAVOR". |
| Continuous service, cut after cut | The cuts carousel runs as a slow conveyor (rodízio), with drag and inertia, so guests "take" the next cut. |
| Heat | A subtle heat-haze shimmer (displacement shader) on the hero headline only. |

The rule for the whole team: **every animation has to point to something real in the restaurant.** If we can't say what it refers to, it gets cut.

---

## 3. Site map & scroll narrative

A single long-scroll home page carries the story. Separate light pages handle the practical needs (SEO, sharing, speed).

```
/                 Home: the scroll story (chapters 1–8)
/menu             Rodizio, Market Table, Bar, Desserts (CMS)
/cortes/[slug]    One page per cut (SEO: "picanha santa cruz")
/semana-fogo      Weekly promotions (CMS)
/eventos          Private dining / corporate / celebrations + inquiry form
/ubicacion        Ventura Mall map, hours, parking, contact (+ second location per Q1)
/reservar         Booking (per Q3)
```

### Home chapters

**1. Hero: "El Fuego"** (full viewport)
- Media: `DeQCzqKjEYo` 0–2 s (embers → open flame) as a loop that crossfades into `DY-6dpRiUpm` 0–12 s (slow picanha carving, moody, no text, loops cleanly).
- The reels are vertical, so the desktop layout is a **centred vertical "flame column"**: the video sits in a tall 9:16 frame flanked by a deep black field with an ember canvas. The headline "Del fuego a tu mesa." breaks across the column. This uses vertical footage on purpose instead of upscaling it to a blurry 16:9. On mobile it goes full-bleed.
- Motion: the headline letters rise out of the embers (staggered, 40 ms per char, with heat-haze). On scroll the column widens toward full width while the video scales and the vignette lifts, as if you're walking up to the grill.
- CTA pinned top right: **Reservar**, with a secondary WhatsApp icon.

**2. "El Ritual"** (pinned scroll sequence, 3 beats)
- Beat 1: Picanha. `DeAzCNYFRUk` 0–7 s (cutting, folding into the C-shape, onto the skewer).
- Beat 2: Fire. `DeAzCNYFRUk` 7–12 s (over the coals) and `Deo96S8jVLk` 5–8 s (spark burst).
- Beat 3: The cut. `DeE3u4JjtdU` 5–13 s (knife through medium-rare).
- Scroll scrubs between beats, with one line of copy per beat ("Seleccionamos." / "Asamos al fuego." / "Cortamos en tu mesa."). Video plays at native speed in each beat. We don't scrub video frames: it stutters on 720p H.264 and burns mobile batteries.

**3. "Los Cortes"** (rodízio conveyor of flip cards)
- 8–12 cards: Picanha, Fraldinha, Tomahawk, T-bone, Bife Ancho, Costela, Cordeiro, Frango, Linguiça, etc. The final list comes from the menu.
- Front: cut name in display serif, a short line, a 2–3 s muted micro-loop on hover/visible (desktop) or a poster frame (mobile).
- Flip (the green/red card): tasting notes, origin, recommended point of cooking, wine pairing.
- Interim sources: `DY-6dpRiUpm` (picanha), `DeQCzqKjEYo` 8–10 s (tomahawk), 6–8 s (T-bone), `Dcj68SwkZW6` 1–3 s (raw ribeye), `Dc6ZmU7G3P0` (costela), `DdtoJ_PickS` (sliced ribeye on a salt block).
- **We don't have a consistent per-cut shoot.** The production fix is in §6.

**4. "Mesa del Mercado"** (Market Table)
- Opens with the overhead chandelier shot (`DdZJbB1nJlh_01` / `DcB97a-jNUr_01`) as a parallax "descent": the camera tilts down into the table as you scroll.
- It then breaks into a masonry of macro details that drift in at different parallax depths, like a grazing table: figs (`DdZJbB1nJlh_05`), orange rose (`_04`), the honey and jam station (`DcB97a-jNUr_02`), ceviche (`DcOjaOcHGlm_02`), grilled cheese with honey pour (`DYm3gq2mlNt_02`).
- Video accent: `DcWhDYEF_f5` 13–17 s (guests at the table, from above).

**5. "Sí, por favor"** (the Card / service)
- A large interactive green/red card in the centre. Hover or tap flips it and explains the ritual in two sentences.
- Behind it: `Dcj68SwkZW6` 7–12 s (gaucho carving tableside for guests, people smiling). It's the only footage that shows guests and service with good production value.
- This is the emotional "experience" chapter, about hospitality rather than food.

**6. "El Bar"**
- Dark, cooler-lit sub-section (still warm, with amber instead of fire red).
- Clips from `DYYTPUlCoAw`: 0–1 s (ice and lime), 3–5 s (red pour), 8–10 s (spritz), 10–11 s (torch). Crop out the small disclaimer line on the bottom ~8%.
- Stills: charcuterie with wine and chopp (`DcEIcPsnBzX_04`).
- Cards for the Caipirinha, signature cocktails, wine list and Happy Hour hours. The Happy Hour details live in the CMS.

**7. "Semana Fogo"** (weekly promotions, CMS-driven)
- A 7-day strip with today highlighted automatically (America/La_Paz timezone).
- Each day's card uses our clean b-roll and **live text**. We never reuse the promo reels with baked-in text, because they go stale and can't be translated.

**8. "Tu mesa"** (Visit / Book)
- Night exterior: `DcWhDYEF_f5` 0–1 s, `Dcj68SwkZW6` 12–13 s (daytime façade with greenery).
- Map (custom-styled dark Mapbox/MapLibre), hours, parking at Ventura Mall, phone and WhatsApp.
- Final CTA: the green card, **"SÍ, POR FAVOR. Reservar"**.
- Footer: the ember field fades out like coals going dark.

---

## 4. Design system

### 4.1 Colour (pending Q4 corporate codes)
| Token | Role | Value (proposal) |
|---|---|---|
| `--carvão` | Base background (charcoal, not pure black) | `#0E0B09` |
| `--brasa` | Primary accent: ember orange | `#E2571E` |
| `--ouro` | Gold for display type and chandelier highlights | `#C9A24A` |
| `--osso` | Body text on dark (warm bone) | `#EFE6D8` |
| `--verde-sim` | The green card | `#5BAE6A` (match the card in `Dej3hP_jmYp_03`) |
| `--vermelho-nao` | The red card | `#D9534A` |

The site is dark by design, because the food and fire glow against it. Light "paper" sections (warm `#F4EDE2`) are reserved for the Market Table chapter, where freshness reads better on light.

### 4.2 Type
- **Display:** a high-contrast serif in the spirit of the FOGO DE CHÃO wordmark. Use the corporate face if licensed (Q4); otherwise propose *Canela* or *GT Super*, with *Cormorant* as the free fallback.
- **UI/body:** a restrained grotesk (*Neue Montreal* / *Inter* fallback).
- The condensed bold sans in their promo reels ("LUNES DE FOGO") is for promotions only, never for brand chapters.

### 4.3 Image treatment
- **One LUT for every asset:** warm highlights, lifted-but-dense blacks, saturation reined in on greens. We grade the HDR carousels down to match the reels.
- A light, consistent film grain overlay (2–3%) across the site hides compression differences between Instagram sources.
- Crop out every baked-in watermark.

---

## 5. Motion system

**Stack:** GSAP + ScrollTrigger (scroll choreography), Lenis (smooth scroll), Motion/Framer Motion (component micro-interactions), and one small WebGL layer (OGL) for embers and heat-haze.

**Tokens**
- Easing: `ease-fogo = cubic-bezier(0.22, 1, 0.36, 1)` (out-expo-ish) for reveals, and `power2.inOut` for pinned scrubs.
- Durations: micro 180 ms · UI 400 ms · reveal 900 ms · chapter transition 1.4 s.
- Stagger: 40 ms per character for headlines and 80 ms for cards.

**Signature moments (the only "loud" ones):**
1. Hero letters rising from the embers.
2. The "slice" diagonal mask transition: used at most 4 times on the page.
3. The ritual pinned sequence.
4. The green/red card flip.

**Everything else stays quiet:** fades, 12–24 px rises and gentle parallax. With fewer big effects, the four signature moments stand out.

**Guardrails**
- `prefers-reduced-motion`: no scroll-jacking, no particles and no parallax. Videos show poster frames with a play button, and headlines show instantly.
- Video starts only when visible (IntersectionObserver), pauses off-screen, and never more than 2 play at once.
- WebGL is progressive enhancement. On low-end devices (detected by `deviceMemory`/`hardwareConcurrency` and an FPS probe) embers fall back to a CSS gradient glow.
- 60 fps target on a mid-range Android (Moto G / Galaxy A series is the realistic Santa Cruz device).

---

## 6. Media production plan

### 6.1 Use now (from Drive). Full list with timecodes in `media-selects.json`
**Hero-grade video:** `DY-6dpRiUpm`, `DeQCzqKjEYo`, `DeAzCNYFRUk`, `DeE3u4JjtdU`, `DdtoJ_PickS`, `Dcj68SwkZW6`, `DcWhDYEF_f5`
**Supporting video:** `Deo96S8jVLk` (5–14 s), `Dc19SNXgZ1D` (0–5 s, 6.5–9 s), `DYYTPUlCoAw` (bar clips), `Dc6ZmU7G3P0`
**Photos:** `DcKEsvxCUBc_01/02/03`, `DcB97a-jNUr_01/02`, `DdZJbB1nJlh_01/04/05`, `Db_z-hmCRkf_01/03`, `DYm3gq2mlNt_02`, `DcOjaOcHGlm_02/03`, `DcEIcPsnBzX_04`, `Dej3hP_jmYp_03` (reference only, since it has a graphic overlay)

### 6.2 Rejected, and why
| Asset | Reason |
|---|---|
| `Da8-ak5Bmmm`, `DbItucrDrah`, `DeVvmApj8Hx` | Phone/event footage with captions burned in throughout. Lower production value, and the content is dated (Día de la Mujer, group visit). |
| `DeseDcsAuH5`, `Defel9EDXp-`, `DexbdDoDajo` | Promo text on nearly every frame. Only a few frames are clean, and better versions exist elsewhere. |
| `Ddp-ZLIjdXB` | 360p, with "Felicidades Santa Cruz" text on every frame. |
| `DcR5PABj40O` | Duplicate of `DYYTPUlCoAw`. |
| `DZiS5gkCXLV_*`, `DZkishxCaGR_*`, `DZyHRV5lM5P` | World Cup "Fuego y Fútbol" graphics (time-bound campaign with baked-in typography). `DZkishxCaGR_01` (caipirinha) would be great if we had the clean original. |
| `Db_z-hmCRkf_02/04`, `Dc19SNXgZ1D` 9–15 s | The Happy Hour price menu card is visible in frame. |
| `DcB97a-jNUr_03/04`, `DdZJbB1nJlh_02/03/06`, `DcEIcPsnBzX_01–03` | Over-processed HDR/saturation, or busy buffet framing that reads as "all-you-can-eat" rather than premium. `DcEIcPsnBzX_02/03` are usable as small detail tiles only. |
| `Dej3hP_jmYp_01/02` | Text overlays. |

### 6.3 What we need to shoot or request (most important first)
1. **Original masters** of the reels and photos (Q2). This is the cheapest big upgrade we can get.
2. **One horizontal 4K hero take:** a slow dolly along the grill wall with embers in the foreground. It's the only shot we truly lack for desktop.
3. **A per-cut series:** 10–12 cuts on the skewer, in the same light and angle on a black background, each as a still plus a 3 s loop. This powers "Los Cortes" and the `/cortes/[slug]` pages.
4. **People:** 2–3 natural tableside moments with gauchos and guests, plus the card flip in a guest's hand.
5. **The bar:** clean (no text) versions of the cocktail pour and torch shots, plus a hero caipirinha.
6. **The space:** a wide interior at golden hour, the terrace at night, and the chandelier from below.

---

## 7. Technical architecture

- **Framework:** Next.js (App Router) + TypeScript. Static generation for every page, with ISR for CMS content.
- **CMS:** Sanity (or Payload) so the restaurant can edit the menu, cuts, Semana Fogo, hours and events without developers.
- **Video pipeline:** ffmpeg build step → clean segments cut per `media-selects.json` → LUT applied → AV1/WebM + H.264 MP4 at 480p/720p (1080p when masters arrive) → posters (AVIF/WebP) → served from a CDN (Vercel Blob or Mux). The hero loop must be **under 2.5 MB** on mobile.
- **Images:** `next/image` with AVIF, art-directed crops per breakpoint, and blur-up placeholders.
- **Hosting:** Vercel.
- **Performance budget:** LCP < 2.5 s on 4G mid-range Android, CLS < 0.05, INP < 200 ms, initial JS < 180 KB gzipped (GSAP and WebGL lazy-loaded after first paint).
- **Accessibility:** WCAG 2.1 AA, captions/alt text for all media, keyboard-operable flip cards and carousel, and reduced-motion as described in §5.
- **SEO and local:** `Restaurant` + `Menu` JSON-LD, Google Business Profile alignment, ES (+EN) `hreflang`, and keyword targets such as "churrasquería Santa Cruz", "rodizio Santa Cruz", "picanha Santa Cruz" and "restaurante Ventura Mall".
- **Analytics:** reservation-click, WhatsApp-click and call-click events. Consent banner as required.

---

## 8. Team & workstreams

| Role (agent) | Owns | First deliverable |
|---|---|---|
| **Creative Director** (lead) | Concept, narrative, approves every animation against the "real ritual" rule | Signed-off storyboard (8 chapters) |
| **Art Director** | Design system, layouts, grid, typography | Figma: tokens, hero and 2 chapters at desktop and mobile |
| **Motion Designer** | Motion tokens, signature moments, prototypes | 4 signature moments as After Effects/Rive or code prototypes |
| **Creative Technologist** | WebGL embers, heat-haze, slice mask, performance fallbacks | Ember + slice demo running at 60 fps on mid-range Android |
| **Media Editor / Colourist** | LUT, cutting clean segments, watermark removal, encoding | Graded selects package from `media-selects.json` |
| **Copywriter (ES-Bolivia + EN)** | Voice in tú, chapter lines, cut descriptions, microcopy | Copy deck v1 |
| **Front-end Engineer(s)** | Next.js build, CMS integration, components | Skeleton + hero chapter in production quality |
| **SEO / Local** | Structured data, GBP, keywords, `/cortes` pages | SEO brief |
| **QA / Accessibility** | Device lab, reduced-motion, Lighthouse/WebPageTest gates | Test matrix and acceptance report |

---

## 9. Phases

| Phase | Output | Exit gate |
|---|---|---|
| **0. Answers** | Q1–Q7 resolved, brand kit received, masters requested | Client sign-off |
| **1. Design** | Storyboard → design system → hi-fi hero and 2 chapters (desktop and mobile) → motion prototypes of the 4 signature moments | Creative approval |
| **2. Media** | Graded and encoded selects package. Shoot brief issued for §6.3 | Every asset passes the LUT and watermark check |
| **3. Build** | All chapters and pages, CMS, booking flow | Feature complete on staging |
| **4. Polish & QA** | Performance budget, a11y AA, device lab, copy proofing in ES/EN | All budgets green on a mid-range Android |
| **5. Launch** | Production deploy, analytics, GBP update, handover and CMS training | — |

When new masters or shoot footage arrive, we swap the media files and the code doesn't change. The pipeline is driven by `media-selects.json`.
