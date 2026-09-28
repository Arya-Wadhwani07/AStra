# AuroraText

Gradient text whose colors drift slowly across the letters; ported from God UI `aurora-text` and wired to the theme's `aurora-1` … `aurora-4` tokens (ink → coral → loyalty blue → orange in Studio and Cinema), so it shimmers like the particle hero.

**Consumer provides:** `children` (a short word or phrase), optional `speed` (1 ≈ 10s per cycle; use 0.5–1), optional `colors` array (defaults to the theme stops; `AuroraText.RAINBOW` holds the upstream rainbow), optional `as`.

- Use on **public and editorial moments only**: the hero wordmark, a single highlighted word in a display headline, the welcome screen. One per view.
- Display sizes only (24px+, usually `display` / `display-sm` / `wordmark`). The aurora stops hold 3:1 on `bg` and `surface` in every theme, which is only enough for large text.
- Never on buttons, prices, points, form labels, status, checkout, admin or private conversations.
- Accessibility: the real text sits in a visually-hidden span; the gradient copy is `aria-hidden`. The animation pauses when scrolled out of view and stops under `prefers-reduced-motion`.
- Upstream uses Tailwind (`animate-aurora-text`, `bg-clip-text`); this port uses the `as-aurora` class with the same keyframes.
