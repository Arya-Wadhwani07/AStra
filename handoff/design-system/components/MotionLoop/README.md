# MotionLoop

A pre-rendered ambient video loop with a poster fallback and a visible pause control. It's the only way AStra plays background motion.

**Consumer provides:** `src` (MP4), optional `webm`, `poster` (JPG), `mobileSrc` / `mobileWebm` / `mobilePoster` (9:16 files used under 720px portrait), `focus` (object-position, e.g. `"66% 45%"`), `label` (one-sentence description for screen readers), optional `still`, `hideControl`, `preload`, `className`, `style`.

- Plays `muted loop playsinline autoplay`, never with sound. The `<video>` is `aria-hidden`; `label` is announced once in a visually hidden span.
- Pauses when less than 15% on screen (IntersectionObserver) and when the tab is hidden. It resumes only if the viewer hasn't paused it.
- The pause/play `IconButton`-style control (40px, Phosphor `pause`/`play` fill) sits bottom-right on a dark glass chip, labelled "Pause background animation" with `aria-pressed`.
- Shows **the poster only** (no video element, no control) under `prefers-reduced-motion`, with Save-Data, when `still` is set, or after a playback error. With no poster, it shows the cinema gradient.
- `object-fit: cover`; set `focus` on the sculpture so crops never cut it.
- Never place it behind forms, prices, points maths, checkout, admin or private conversations.
