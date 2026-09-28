# Tooltip

A short supplementary hint on hover or keyboard focus.

**Consumer provides:** `text` (one sentence), a single focusable child, optional `side` (`top` | `bottom`), `open`.

- Linked with `aria-describedby`; appears on focus as well as hover. Never holds essential information or interactive content — use a Banner or disclosure for anything required.
- `ink` fill with `bg` text (inverted) so it reads in every theme; max 240px wide.
