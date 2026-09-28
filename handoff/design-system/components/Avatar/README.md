# Avatar

A person's picture, or initials on a tinted disc when there's no image.

**Consumer provides:** `name` (required: drives initials and the accessible name), optional `src` + `alt`, `size` (28 / 32 / 40 / 56 / 80), `verified`.

- Fallback tint is picked from the name among four neutral-family grounds (surface, sunken, navy, ink) so a feed of fallbacks isn't monotone; initials keep ≥4.5:1. Loyalty blue and creators-only teal are never used on avatars.
- One neutral `border-strong` ring. No coloured rings.
- `verified` adds a filled seal-check with the label "Verified creator". Verification is a status only; identity documents never appear on ordinary screens.
