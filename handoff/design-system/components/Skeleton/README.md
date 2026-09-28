# Skeleton

Placeholder shapes that mirror the layout while content loads; wrap them in `Loading` for the screen-reader announcement.

**Consumer provides:** `Skeleton` — `variant` (`text` | `card` | `row`), `lines`. `Loading` — `label`, children.

- Show after 300ms; if loading exceeds 10s, swap to an error `EmptyState` with Retry.
- Shimmer uses `surface-sunken` → `border`; it stops under reduced motion (static blocks).
- Checkout and payment never use skeletons for totals — they show an explicit "Calculating…" or processing state.
