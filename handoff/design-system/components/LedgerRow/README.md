# LedgerRow

One entry in a private points history: activity, source, date, status and change, with a reason for anything not approved.

**Consumer provides:** `activity`, `source`, `date`, `change` (signed number), `status` (`pending` | `approved` | `rejected` | `reversed` | `redeemed` | `restored`), `reason`.

- Every rejected, reversed or restored row carries a plain-language reason. Rejected/reversed amounts are struck through; pending amounts are muted.
- Redemption shows exactly one "−500 pts / Redeemed" row per order; a refund adds a linked +500 row rather than editing history.
