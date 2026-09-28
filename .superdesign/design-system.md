# AStra design system (navy + coral, five themes incl. Cinema)

Source of truth: design-system/ (tokens.json, tokens.css, design-system-guide.md, motion.md, handoff.md).


The system is **navy + coral**:

- off-navy for every button and selection;
- signal red-orange / coral for energy;
- royal loyalty blue that belongs only to points.

It ships in five grounds. A scoped **Cinema** treatment carries the cinematic particle loops behind public moments.

## Direction

- **Five themes, one palette.**
  - **Studio** (`light`, warm off-white #FBF5F1) is the default for feeds, forms, checkout and admin.
  - **Crimson**, **Chrome** and **Prism** are for public, editorial and event moments.
  - **Cinema** (`cinema`, #04060D) is used *only* behind motion surfaces: the landing hero and section intros.
- **Buttons are navy, energy is coral, points are blue.** `action` (#1E2B4D Studio / #2A3A66 dark) fills every primary button and selection, with an `action-edge` hairline and a coral glow. `accent` (#E8472F Studio / #FF5A3C Cinema) is for highlights, the logo planet and focus. `points` (#1F4FC4 / #9AB4FF) is loyalty only.
- **Glows are for public moments.** `shadow-glow`, gradient meters and the `as-backdrop` wash appear on public and selected states. Transactional views stay quiet.
- **Cinematic motion is scoped.** Pre-rendered particle loops (`MotionLoop`) sit behind editable copy (`MotionStage`) on the Cinema theme. See `guidelines/motion.md`. Checkout, forms, admin and private conversations never move.

## Content fundamentals

- Plain, warm, specific. Sentence case everywhere except the `eyebrow` style.
- Buttons are verb-first ("Join AStra", "Send response", "Continue to payment").
- Name real disciplines: painters, musicians, filmmakers, dancers, photographers, writers.
- **Loyalty rules** apply everywhere they're shown:
  - one shared balance across participating creators;
  - **100 points = $1 off**;
  - each creator sets a maximum % discount, and fans redeem within it and pay the rest.
  - No cash value, no withdrawals, no guaranteed free merchandise, no claims of verified Spotify/YouTube activity.
- Evidence rule: no invented press, streaming counts, follower numbers or traction. Label sample data once per view ("Sample data").
- Collaboration surfaces say who can see them ("Creators only", lock + word).

## Color

- Read every colour through its token. Theme ids: `light` (Studio), `crimson`, `chrome`, `prism`, `cinema`.
- Grounds: `bg` → `surface` → `surface-raised` → `surface-sunken`. Inputs use `field`.
- Ink: `ink`, `ink-muted` and `ink-subtle`. All three pass 4.5:1 on their surfaces in every theme (see `guidelines/handoff.md`).
- Brand: `action` / `action-hover` / `action-edge` / `on-action` (navy), `accent` / `accent-ink` (coral), `link`, `focus`, `glow-1` (coral) / `glow-2` (blue), `aurora-1…4` for `AuroraText`.
- Domain: `points` + `points-bg` (loyalty blue, star icon, "pts") and `private` (creators-only). Status: `success`, `warning`, `error`, `info` with `-bg` grounds, always icon + word.
- **Cinema** is navy-black (`bg` #04060D, `surface` #0A1020) with warm ink #F4F1EE, coral `accent` #FF5A3C, blue `points` #9AB4FF. Its other tokens inherit Crimson's status colours. Set `data-theme="cinema"` on a section, never on the whole app.

## Typography

- **Unbounded** (`font-display`): `wordmark` 160, `display` 64, `display-sm` 40. Public headlines only.
- **Schibsted Grotesk** (`font-sans`): `page-title` 30/36, `section-title` 20/28, `title` 16/24, `body` 16/24, `body-sm` 14/20, `label` 14/20 600, `helper` 13/18, `caption` 12/16, `numeric-total` 28/32, `numeric` 16/24 tabular, `eyebrow` 11/16 600 at 0.18em uppercase.
- **IBM Plex Mono** (`font-mono`): `code` 13/20 for order, case and record IDs.
- Font files ship in `fonts/` (OFL). Inputs are 16px so phones don't zoom.

## Spacing and layout

- 4px base (`space-0-5` … `space-24`). Section rhythm is 32 / 48 / 64.
- Breakpoints: `bp-sm` 390 (hold at 360), `bp-md` 768, `bp-lg` 1280, `bp-xl` 1440.
- App shell: `width-sidebar` 248, `width-rail` 320, `width-content` 680, `width-page` 1200.
- Motion safe areas: `safe-text-desktop` 44% (left column) and `safe-text-mobile` 42% (bottom band).

## Shape and depth

- Radii: `radius-xs` 4, `sm` 8, `md` 12 (buttons, inputs, cards), `lg` 20, `xl` 28, `pill`.
- Shadows: `shadow-sm`, `md`, `lg`, plus `shadow-glow` for the one primary public action.
- Layers: `z-media` 0, `z-scrim` 1, `z-sticky`, `z-drawer`, `z-dialog`, `z-toast`, `z-tooltip`.

## Motion

- **Cinematic loops.** `MotionLoop` covers three placeholder loops: Creative convergence (hero), Cross-discipline collaboration and Shared support (loyalty).
  - Each is muted, pauses off-screen and has a visible pause control.
  - It shows the poster only under reduced motion or Save-Data.
  - Storyboards, specs, safe areas and developer handoff are in `guidelines/motion.md`.
- **Decorative UI motion:** `AuroraText` (one word per view, display sizes) and `OrbitingCircles` (onboarding, empty states). Both pause off-screen and freeze under reduced motion.
- UI feedback: `--dur-fast` 120ms, `--dur-base` 200ms. Checkout, forms, admin and conversations don't animate.

## Imagery

- Creators' work is the loudest thing on a page. Until approved imagery exists, media frames use labelled placeholder art in the palette.
- Credit every image. The motion loops are labelled "procedurally rendered placeholder loop" until final renders are approved.

## Iconography

- **Phosphor Icons only** (`Icon`; `@phosphor-icons/react` in production). `regular` weight by default, `fill` for selected states. No emoji.
- Icons never carry payment, eligibility or permission meaning alone. Pair them with a word.

## Accessibility

- Every text pair meets 4.5:1 (3:1 for control outlines, focus and large aurora text) in all five themes.
- On motion stages, a scrim holds copy contrast. Essential information never depends on animation.
- There's a visible focus ring everywhere. Icon-only buttons carry labels, and loops carry a one-sentence description.
