# PriceTag

Money amounts (`PriceTag`) and stock/ticket availability (`AvailabilityLabel`).

**Consumer provides:** `PriceTag` — `amount` (number, USD in the demo), optional `unit`, `compare` (previous price), `size` (`lg` for totals). `AvailabilityLabel` — `status` (`available` | `low` | `soldout` | `external` | `ended`), `count`.

- Money is always `ink` with tabular figures — never the `points` color. Points use `pts` formatting and the star icon, so the two can't be confused.
- A changed price shows the old price struck through with "Was/Now" for screen readers.
- Sold out disables Add to cart. External shows "Tickets on external site" and never produces a native paid-order state.
