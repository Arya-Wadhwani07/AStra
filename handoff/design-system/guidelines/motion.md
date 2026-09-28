# Cinematic motion

AStra's public moments (the landing hero, the collaboration intro and the loyalty intro) sit on a dark **Cinema** stage. On that stage, slow particle loops show the product's idea: separate disciplines become one shared thing. Everything else stays in the navy + coral system and stays still.

> **Status: placeholder loops.** The loops in the Motion asset group are procedurally rendered drafts (a numpy particle renderer piped to ffmpeg). They fix composition, timing, palette and safe areas for approval. They are not final production renders. Final loops can be re-rendered in a 3D tool (Blender, Houdini, Cavalry) from the same storyboards and specs.

## Recommended direction: "One constellation"

**Particles, not objects.** Each discipline is a small cloud of light with its own signature shape. On approval, these can be layered with light glyphs:

- painter: ribbon
- musician: waveform
- filmmaker: frame strip
- dancer: spiral
- photographer: aperture
- writer: lines

The clouds stream along curved paths into a single braided knot. That knot is the AStra sculpture: one form made from many hands. It stands on a dark floor with a soft reflection and slow expanding rings.

The palette is the brand, nothing new:

- **coral / orange** for creative energy;
- **loyalty blue** for support and points;
- **warm white** where they join;
- deep navy-black ground (`cinema` theme).

Why this direction:

- **It says the product in one image.** Collaboration across disciplines, and one shared place for support.
- **It suits a UI that has to be read.** The sculpture sits in one half of the frame, so a text-safe column stays dark.
- **It's cheap to ship.** It works as a pre-rendered loop (see *Video vs WebGL*).

It borrows the *feel* of the reference recording: dark stage, particles resolving into a form, rings, floor reflection. It does not use the recording's tree, cube, logos or text.

## Concepts and storyboards

Each concept has four storyboard stills in the **Storyboards** asset group: begin, middle, end and loop transition. Loops are seamless: frame 0 equals the last frame, and every particle's life cycle is periodic in the loop length.

### 1 · Creative convergence (hero): `astra-hero-loop`
| Beat | Time | What happens |
|---|---|---|
| Begin | intro 0 s | Six separate discipline clouds hang in space, each in its own signature form: ribbon, waveform, frame strip, spiral, aperture, lines. |
| Middle | intro 3.2 s | The clouds pour along curved arcs toward one point. Rings wake on the floor. |
| End | loop 6 s (poster) | One braided knot has formed. Streams keep refilling it, particles flare warm-white where they join, and it sways slowly. |
| Loop | 11.5 s → 0 s | The sway returns to rest and the clouds refill from particles leaving the knot. There is no cut. |

`astra-hero-intro-16x9` (6 s, plays once per visit) builds from the separate clouds into the loop's frame-0 state and hands off to the loop with no visible cut. Skip it under reduced motion and on repeat visits.

### 2 · Cross-discipline collaboration: `astra-collab-loop`
| Beat | Time | What happens |
|---|---|---|
| Begin | 0 s | A coral brush-sphere (left) and a blue waveform-ring (right) idle apart. |
| Middle | 2.5-5 s | They drift together. About 30% of each form's particles cross over along arcs and take the other's colour. |
| End | 5-7 s | Both resolve into one braided double helix, the shared work. |
| Loop | 7-10 s | The helix loosens back into the two forms, each now carrying a few particles from the other. |

### 3 · Shared support (loyalty intro): `astra-loyalty-loop`
| Beat | Time | What happens |
|---|---|---|
| Begin | 0 s | Five thin streams in creator colours fall from the top of the frame, right of the text column. |
| Middle | 3-6 s | They spiral into one lens-shaped reservoir and turn loyalty-blue as they arrive. |
| End | 8 s | The reservoir glows steadily. Blue rings ripple from its base. |
| Loop | 10 s → 0 s | Streams are continuous, so the loop has no visible seam. |

The loyalty loop illustrates *one shared balance fed by many creators*. It must never suggest cash, payouts or free goods (see *Loyalty copy rules*).

## Motion specs

| | Hero | Collab | Loyalty |
|---|---|---|---|
| Loop length | 12 s (+6 s one-shot intro) | 10 s | 10 s |
| Frame rate | 24 fps | 24 fps | 24 fps |
| Camera | Fixed, slightly high: about 15° tilt, telephoto-like. Only the object sways (±20° yaw, ±6° pitch, sine, 1 cycle per loop). | Fixed, about 10° tilt | Fixed, about 24° tilt |
| Particles | 6 × 3,400 discipline plus 5,000 core motes. Sizes 0.5-2 px, cubic falloff. | 9,000 (30% cross over) | 5 × 2,200 stream + 9,000 reservoir |
| Lighting | Additive glow, soft bloom (two gaussian passes), warm-white where streams join, 35% floor reflection, vignette | same | same, cooler (blue-dominant) |
| Transitions | Ease-in-out quad on every path. Nothing snaps. No flash above 3 per second, no full-frame luminance jumps. | same | same |
| Rings | 3 concentric, 0.22 aspect, expanding and fading once per 4 s | 2 | 3, blue |

**Pace rule:** nothing crosses more than 1/8 of the frame per second. Motion is ambient, never attention-grabbing.

## Composition and safe areas

**Desktop 16:9** (1600 × 900 source; scales to 1920 and 1280):

- The sculpture's centre sits at about 66% x, 45% y.
- The left **44%** (`safe-text-desktop`) is the text-safe column. The knot and its clouds start right of about 40%. The `MotionStage` scrim (92% → 80% → 45% navy-black across that column) keeps copy readable over any frame.
- Nav sits in a 72 px top band, clear of the sculpture.

**Mobile 9:16** (720 × 1280 source):

- The sculpture sits in the upper 55%.
- The bottom **42%** (`safe-text-mobile`) is text-safe under a bottom-up scrim.

**Cropping:**

- `object-fit: cover`, with `focus` set to the sculpture ("66% 45%" desktop, "50% 30%" mobile).
- On viewports narrower than 16:9 but wider than 720 px (tablet landscape), keep the desktop file and let the left edge crop first.
- Portrait under 720 px switches to the mobile file.
- Never letterbox.

**Placement on a page (v5):** Cinema is a block, not a stripe. The hero stage opens the page. The collaboration and loyalty intros sit next to each other as one continuous Cinema band further down, so the page switches theme twice at most (into the band and out of it). Never alternate Studio and Cinema section by section. The hero's primary CTA is the page's one glow; buttons in the band are plain navy primary or secondary.

**Text-side flip:** `textSide="right"` mirrors the scrim. Use it only with a mirrored render, since the loops are composed for left-side text.

## Poster frames and reduced motion

- Each loop ships a poster (JPG): frame 6.0 s for the hero, 5.5 s for collab, 8.0 s for loyalty. Each is the most "resolved" moment, not frame 0.
- Under `prefers-reduced-motion: reduce`, `MotionLoop` renders only the poster: no video element and no pause control.
- It also shows only the poster when Save-Data is on, when the video errors, or when `still` is passed.
- The poster carries the full composition, so nothing is lost.
- There is no reduced-motion "slower" variant. Still means still.

## Readable UI over motion

- Headlines use Unbounded 700 on `cinema.ink` (#F4F1EE) over the scrim.
- Body uses `ink-muted` (#B3B8C8, 9.6:1 on the cinema bg).
- Buttons keep the standard navy primary. Only one button on the page gets the coral glow (`as-btn--glow`), usually the hero's.
- Cards over motion use a glass fill: `rgba(10,16,32,0.72)` plus a 14 px blur.
- Never put form fields, prices, points maths, checkout, admin or private messages over moving video. Those screens are **transactional and stay still**. They can use the `cinema` theme's colours without media.

## Developer handoff

**Assets.** Each has MP4 (H.264, `yuv420p`, `+faststart`) plus WebM (VP9) plus a JPG poster:

- `astra-hero-loop-16x9`: 1600×900, 12 s
- `astra-hero-loop-9x16`: 720×1280, 12 s
- `astra-hero-intro-16x9`: 1600×900, 6 s, plays once, then swaps to the loop on `ended`
- `astra-collab-loop-16x9`: 10 s
- `astra-loyalty-loop-16x9`: 10 s

Targets: loops ≤ 4 MB desktop and ≤ 2.5 MB mobile.

**Exported files** (in this design system's Motion asset group; H.264 MP4 at crf 24 and VP9 WebM at crf 38, 24 fps, no audio):

| Asset | Size | Ratio | Blob |
| --- | --- | --- | --- |
| `astra-hero-loop-16x9.mp4` | 3.9 MB | 16:9 | `/_blob/4320ee894668ee029ec9bfb9f2490e55` |
| `astra-hero-loop-16x9.webm` | 2.5 MB | 16:9 | `/_blob/699cd985d5040ce672206b517344f658` |
| `astra-hero-loop-9x16.mp4` | 1.2 MB | 9:16 | `/_blob/59c3ba56a9d5f3fdc9d0ff4755fb1584` |
| `astra-hero-loop-9x16.webm` | 0.7 MB | 9:16 | `/_blob/89b900ddc7437a2b2a93cef3860a7980` |
| `astra-hero-intro-16x9.mp4` | 1.5 MB | 16:9 | `/_blob/7d0b661bc72c7481c65b618f874364b3` |
| `astra-hero-intro-16x9.webm` | 0.8 MB | 16:9 | `/_blob/8a23686b87f00358051e246d094fd6f9` |
| `astra-collab-loop-16x9.mp4` | 1.6 MB | 16:9 | `/_blob/b28590f9dfb22ba320f538a31d2a5a53` |
| `astra-collab-loop-16x9.webm` | 0.9 MB | 16:9 | `/_blob/149f9dd4335f779ce30143cb3470e2dc` |
| `astra-loyalty-loop-16x9.mp4` | 1.6 MB | 16:9 | `/_blob/b40b0dc678fef2f5e827d4b1a3f58b79` |
| `astra-loyalty-loop-16x9.webm` | 0.6 MB | 16:9 | `/_blob/f99d03af9b25ce49c94ea609dd171506` |
| `astra-hero-poster-16x9.jpg` | 54 KB | 16:9 | `/_blob/f066f217d04f9a4832bf7bac34177543` |
| `astra-hero-poster-9x16.jpg` | 27 KB | 9:16 | `/_blob/782597d64d46b1be5435d1a604a441ab` |
| `astra-collab-poster-16x9.jpg` | 33 KB | 16:9 | `/_blob/b1fe16f1c7e9afc57bc20d8967d52203` |
| `astra-loyalty-poster-16x9.jpg` | 40 KB | 16:9 | `/_blob/8a2239a971cd4cf54a9f0ee7e575b055` |


**Layering** (bottom to top), using the `layer` tokens:

1. `z-media` 0: video or poster.
2. `z-scrim` 1: gradient toward the text-safe area.
3. Copy and actions (2).
4. Pause control (3).
5. Sticky nav (`z-sticky`).

**Loading:**

- The poster is the LCP image: `fetchpriority="high"`, preloaded.
- Video `preload="metadata"`, attached after first paint.
- Production should mount below-the-fold loops (collab, loyalty) only within about 1 viewport. The reference `MotionLoop` pauses them off-screen but doesn't lazy-mount them yet.

**Playback:**

- `muted loop playsinline autoplay`.
- Pauses when less than 15% visible and when the tab is hidden.
- Visible 40 px pause/play button, bottom-right, labelled "Pause background animation". The reference component remembers the choice while mounted. Production should persist it for the session.
- No audio, ever.

**Fallbacks:**

- The poster is shown for reduced motion, Save-Data, an autoplay rejection (the button still offers play), a decode error or no JS.
- The cinema gradient is shown if the poster fails.

Component API: see `MotionLoop` and `MotionStage`.

## Video vs WebGL

| | Pre-rendered loop (recommended now) | Real-time WebGL (later) |
|---|---|---|
| Look | Any quality; bloom and reflections are free | Limited by device GPU; bloom and reflections cost frames |
| Performance | One decode, predictable on phones | Battery and heat on low-end phones; needs a quality ladder |
| Weight | 2-4 MB per loop | About 150-400 KB JS plus shaders |
| Interactivity | None (pause only) | Cursor-reactive, data-driven (for example, the real number of creators) |
| Effort | Low | High (three.js/ogl, fallbacks, testing) |

Ship video for the hackathon. Revisit WebGL only if interactivity becomes part of the story.

## Final-render briefs (for a 3D artist or video tool)

Use the storyboards and specs above. Keep the palette hexes exact: ground #04060D, coral #FF5A3C, orange #FF8A3D, loyalty blue #3D6BFF / #9AB4FF, warm white #F4F1EE. No text, logos, coins, charts or UI in frame.

- **Hero.** "Dark navy-black void with a glossy floor. Six small clouds of glowing particles, each shaped like a discipline (a paint ribbon, a sound waveform, a film-frame strip, a dancer's spiral, a camera aperture, lines of writing), stream along soft arcs into one braided torus-knot sculpture right of centre. Particles flare warm white where they join. The sculpture sways gently. Faint coral and blue rings ripple out on the floor, with a soft reflection. Locked-off camera, slightly high, telephoto. 12-second seamless loop, 24 fps, left 44% of frame kept dark and empty."
- **Collaboration.** "A coral particle sphere and a blue particle ring drift toward each other. About a third of their particles arc across and take on the other's colour. Both braid into a slowly turning coral-and-blue double helix, then relax back into two forms that now carry each other's particles. Same stage, 10-second seamless loop, subject right of centre."
- **Shared support.** "Five thin particle streams in coral, orange, warm white and two blues descend from the top edge and spiral into one shallow, lens-shaped pool of blue light on the floor. They turn blue on arrival, and slow blue rings ripple outward. 10-second seamless loop. The pool reads as a calm reservoir, never coins or money."

## Loyalty copy rules (for anything shown with the loyalty loop)

- There is one shared points balance across participating creators.
- **100 points = $1 off.**
- Each creator sets a maximum discount percentage. Fans redeem points within that cap and pay the rest.
  - *Example (sample data):* Mira's $25 ticket, cap 20%: up to $5 off (500 pts), pay $20.
- Points have no cash value and can't be withdrawn. There is no guaranteed free merchandise.
- Don't claim verified Spotify, YouTube or other platform activity.
