AStra is a creative community with dependable business tools. Creators publish work, events and merchandise. Audiences follow them and support them with one shared loyalty balance. Creators find collaborators across disciplines, and administrators keep it fair.

The system is **navy + coral**:

- off-navy for every button and selection;
- signal red-orange / coral for energy;
- royal loyalty blue that belongs only to points.

It ships in five grounds. A scoped **Cinema** treatment carries the cinematic particle loops behind public moments.

**v5 (taste pass).** The palette, type, components, motion and loyalty rules are unchanged. Studio neutrals became one family, stray glows were removed, and the page rules below were added so screens built from this system don't read as templated. See *Taste rules*.

**v7 (Glass theme).** A sixth ground, **Glass** (`data-theme="glass"`), is now the signed-in surface: a deep, blurred colour scene (`ambient-sky` to `ambient-ground` with coral, amber, blue and pink light) behind nearly clear panels. Panels are a light 45% navy tint under a 32px blur with a bright rim, a top highlight and a diagonal sheen; ink is white. Secondary controls, chips and fields are clear glass; the primary button is warm white with navy text; tab and segmented tracks press slightly into the glass. Every text pair holds 4.5:1 over the brightest part of the scene because the scene stays deep and the panel tint darkens what's behind.

**v6 (ambient glass).** The signed-in app now sits on a soft ambient light layer with liquid-glass cards and neumorphic controls, so the app feels as considered as the public pages. Public pages keep Cinema and flat Studio.

## Direction

- **Six themes, one palette.**
  - **Glass** (`glass`, scene #16306A to #0A1026) is the signed-in app and onboarding: scenic liquid glass with white ink (v7).
  - **Studio** (`light`, warm off-white #FAF7F4) is the default for feeds, forms, checkout and admin.
  - **Crimson**, **Chrome** and **Prism** are for public, editorial and event moments.
  - **Cinema** (`cinema`, #04060D) is used *only* behind motion surfaces: the landing hero and section intros.
- **Buttons are navy, energy is coral, points are blue.** `action` (#1E2B4D Studio / #2A3A66 dark) fills every primary button and selection, with an `action-edge` hairline. `accent` (#E8472F Studio / #FF5A3C Cinema) is for highlights, the logo planet and focus. `points` (#1F4FC4 / #9AB4FF) is loyalty only.
- **One glow per public page.** `shadow-glow` belongs to a single CTA on the hero or a Cinema stage. `as-backdrop` is for onboarding and public pages. Selections, tabs and buttons carry no glow.
- **Ambient glass is the signed-in surface (v6).** Every page after sign-in (feed, profiles, events, collaboration, cart and checkout, loyalty, creator dashboard, admin) puts an `as-ambient` layer behind the shell: four blurred light sources (`ambient-1…4`: coral, amber, brand navy, pink) over a fine grain. **Liquid glass is the default material wherever a surface can take it** (`glass-fill` over a backdrop blur, a `glass-edge` rim and a `glass-highlight` sheen): cards, the sidebar, mobile bars, fields, chips, secondary buttons, quantity steppers, banners (their status tint at 78%), toasts, tooltips, dialogs and drawers, media credit chips. The navy primary keeps its fill and gains a glass rim. Tab tracks, segmented controls and stat tiles are **neumorphic** on `neu-surface`: tracks press in, the selected item and tiles lift out. The same treatment applies to the Studio sections of public pages via `as-app--glass`; Cinema stages keep their own glass panels.
- **Cinematic motion is scoped.** Pre-rendered particle loops (`MotionLoop`) sit behind editable copy (`MotionStage`) on the Cinema theme. See `guidelines/motion.md`. Checkout, forms, admin and private conversations never move.

## Taste rules

These apply to every screen built from AStra. They come from an anti-template audit and keep the brand, not replace it.

**Page composition**
- **Cinema appears as blocks, not stripes.** A public page opens on its Cinema hero. Lower down, the collaboration and loyalty intros sit back to back as one continuous Cinema band. Never alternate Studio and Cinema section by section.
- **No three identical cards in a row** on public pages. Use a 1 + 2 split, an asymmetric pair, or a list. Inside the app, grids of equal cards are fine when the content is equal (feed items, opportunities).
- **Eyebrows are rationed:** at most one per three sections, and the hero counts. Cinema stages can use theirs; Studio sections usually just need a headline.
- **Headline, then body, stacked.** No big headline with a small paragraph floating in the right column.
- **One label per intent across a page:** "Join AStra" is the sign-up action everywhere; don't add "Get started" or "Sign up free" beside it.

**Copy**
- **No em dash or en dash.** Use a period, comma, colon or parentheses. Ranges use a hyphen: 6-8 PM, $25-30.
- **One middle dot per line at most.** "Oct 10 · Los Angeles" is fine. For more, use line breaks or columns.
- No filler verbs ("elevate", "seamless", "unleash"), no exclamation marks in success messages, and no "Oops".
- Body text runs at most 65 characters wide (`.as-measure`). Headings balance their lines (`text-wrap: balance`).

**Surfaces**
- **Without an ambient layer, cards are flat** (`surface` plus a `border` hairline); the glass needs colour behind it to read.
- **With it, everything is glass.** Add `as-ambient` as the shell's first child (or `as-app--glass` on the shell). Use `as-ambient--drift` on browsing pages (feed, profile, event, find opportunities, loyalty, dashboard) so the light slowly moves; checkout, forms and conversations keep the ambient layer still; admin uses `as-ambient--quiet` (still, lower opacity). Drift freezes under reduced motion.
- **Glass and neumorphism never carry meaning.** Status, eligibility and points keep their badges, words and 3:1 control outlines on top of the effect. On Studio ambient, glass fill stays at 72% (Glass theme: a 45% navy tint) so ink holds 4.5:1 over any blob. Neumorphic controls keep their labels and focus ring; the soft shadow is decoration, not the boundary.
- **Neumorphism lives on its own ground.** Use `neu-surface` tracks and `as-neu-tile` stats; don't put neumorphic shadows on glass or on imagery.
- **Semantic colours never decorate.** Loyalty blue and creators-only teal mean something, so they don't tint avatars, dividers or backgrounds for variety.
- **No pure black.** The darkest ground is Chrome's #08080A; Cinema is #04060D navy-black.

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

- Read every colour through its token. Theme ids: `light` (Studio), `crimson`, `chrome`, `prism`, `cinema`, `glass`.
- Grounds: `bg` → `surface` → `surface-raised` → `surface-sunken`. Inputs use `field`.
- Studio neutrals are one family: warm ground (#FAF7F4, sunken #F2EEEA, hairline #E7E1DC) with navy-grey ink and control edges (`border-strong` #7B7E8C, 4.0:1 on white).
- Ink: `ink`, `ink-muted` and `ink-subtle`. All three pass 4.5:1 on their surfaces in every theme (see `guidelines/handoff.md`).
- Brand: `action` / `action-hover` / `action-edge` / `on-action` (navy), `accent` / `accent-ink` (coral), `link`, `focus`, `glow-1` (coral) / `glow-2` (blue), `aurora-1…4` for `AuroraText`.
- Domain: `points` + `points-bg` (loyalty blue, star icon, "pts") and `private` (creators-only). Status: `success`, `warning`, `error`, `info` with `-bg` grounds, always icon + word.
- **Cinema** is navy-black (`bg` #04060D, `surface` #0A1020) with warm ink #F4F1EE, coral `accent` #FF5A3C, blue `points` #9AB4FF. Its other tokens inherit Crimson's status colours. Set `data-theme="cinema"` on a section, never on the whole app.

## Typography

- **Unbounded** (`font-display`): `wordmark` 160, `display` 64, `display-sm` 40. Public headlines only; keep display headlines to two lines.
- **Schibsted Grotesk** (`font-sans`): `page-title` 30/36, `section-title` 20/28, `title` 16/24, `body` 16/24, `body-sm` 14/20, `label` 14/20 600, `helper` 13/18, `caption` 12/16, `numeric-total` 28/32, `numeric` 16/24 tabular, `eyebrow` 11/16 600 at 0.18em uppercase.
- **IBM Plex Mono** (`font-mono`): `code` 13/20 for order, case and record IDs.
- Money, points, counts and IDs use tabular figures.
- Font files ship in `fonts/` (OFL). Inputs are 16px so phones don't zoom.

## Spacing and layout

- 4px base (`space-0-5` … `space-24`). Section rhythm is 32 / 48 / 64 in the app and 96 on public pages.
- Breakpoints: `bp-sm` 390 (hold at 360), `bp-md` 768, `bp-lg` 1280, `bp-xl` 1440.
- App shell: `width-sidebar` 248, `width-rail` 320, `width-content` 680, `width-page` 1200.
- Motion safe areas: `safe-text-desktop` 44% (left column) and `safe-text-mobile` 42% (bottom band).

## Shape and depth

- **One radius rule:** controls (buttons, inputs, selects, cart rows) 12 (`radius-md`); cards and panels 20 (`radius-lg`); dialogs, drawers and motion stages 28 (`radius-xl`); pills only for chips, badges, segmented controls, avatars and the pause control.
- Shadows: `shadow-sm` for raised panels, `md` for menus and popovers, `lg` for dialogs, plus `shadow-glow` for the one primary public action. All are navy-tinted.
- Layers: `z-media` 0, `z-scrim` 1, `z-sticky`, `z-drawer`, `z-dialog`, `z-toast`, `z-tooltip`.

## Motion

- **Cinematic loops.** `MotionLoop` covers three placeholder loops: Creative convergence (hero), Cross-discipline collaboration and Shared support (loyalty).
  - Each is muted, pauses off-screen and has a visible pause control.
  - It shows the poster only under reduced motion or Save-Data.
  - Storyboards, specs, safe areas and developer handoff are in `guidelines/motion.md`.
- **Decorative UI motion:** `AuroraText` (one word per page, display sizes) and `OrbitingCircles` (onboarding, empty states). Both pause off-screen and freeze under reduced motion.
- UI feedback: `--dur-fast` 120ms, `--dur-base` 200ms, and a 1px press on buttons. Checkout, forms, admin and conversations don't animate.

## Imagery

- Creators' work is the loudest thing on a page. Until approved imagery exists, media frames use labelled placeholder art in the palette.
- Credit real work ("Artwork: Mira Rao"). Placeholder art carries one "Placeholder art" credit, not decorative captions. The motion loops are labelled "procedurally rendered placeholder loop" until final renders are approved.

## Iconography

- **Phosphor Icons only** (`Icon`; `@phosphor-icons/react` in production). `regular` weight by default, `fill` for selected states. No emoji, no hand-drawn icon paths.
- Icons never carry payment, eligibility or permission meaning alone. Pair them with a word.

## Accessibility

- Every text pair meets 4.5:1 (3:1 for control outlines, focus and large aurora text) in all six themes.
- On motion stages, a scrim holds copy contrast. Essential information never depends on animation.
- There's a visible focus ring everywhere. Icon-only buttons carry labels, and loops carry a one-sentence description.
