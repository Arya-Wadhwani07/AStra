# MotionStage

A full-bleed section on the **Cinema** theme with four layers: a `MotionLoop` media layer, a scrim toward the text-safe side, editable copy with actions, and an optional nav band.

**Consumer provides:** `media` (the `MotionLoop` props), `title`, optional `eyebrow`, `subtitle`, `actions`, `nav`, `footnote`, `textSide` (`left` | `right`), `compact`, `theme` (default `cinema`), `id`.

- Layering uses the `layer` tokens: media `z-media` 0 → scrim `z-scrim` 1 → copy 2 → pause control 3. Nav, headline, buttons and text are real DOM, never baked into video.
- Desktop: copy sits in the left `safe-text-desktop` (44%) column, vertically centred. The scrim runs 92% → 0 across 58% of the width, which keeps `ink-muted` body text at ≥ 4.5:1 over any frame.
- Mobile (≤ 720px): media fills the viewport and copy moves to the bottom `safe-text-mobile` (42%) band under a bottom-up scrim. Use the 9:16 file via `media.mobileSrc`.
- Headline: Unbounded 700, 56px desktop / 34px mobile. Only one `AuroraText` word per stage.
- The primary action is the standard navy primary with `as-btn--glow`. Only one glowing button per stage.
- Adds `data-theme="cinema"` to itself, so it can sit inside a Studio (light) page without restyling the rest of the site.
