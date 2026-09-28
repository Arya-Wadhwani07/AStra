# OrbitingCircles

A slow ring of discipline icons orbiting a center mark — the "multiverse" of creative disciplines connecting. Ported from God UI `orbiting-circles` (staged in `components/godui/`), rebuilt with CSS so it needs no Framer Motion.

**Consumer provides:** children (usually `Icon`s inside `.as-orbit-node`), `radius` (px, default 100), `iconSize` (slot px, default 40), `duration` (s, default 24), optional `reverse`, `showPath`, `center`, `static`, and `label` describing the whole illustration.

- Decorative only: welcome screen, empty collaboration state, onboarding. Never navigation, status or an eligibility indicator.
- One per view, away from forms, checkout and private conversations.
- Default footprint 280×280 (radius 100 + slot 44 ≈ 244). On phones use radius 72, slot 36.
- `prefers-reduced-motion` or `static` freezes the ring in its designed arrangement. Pass `label` for a single accessible description, or omit it to hide the whole figure from assistive tech.
- Nodes use `surface` fill, `border` hairline and `ink` icons so they work in all five themes.
