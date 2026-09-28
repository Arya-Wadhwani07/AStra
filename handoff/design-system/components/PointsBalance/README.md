# PointsBalance

The audience member's private loyalty balance: available points, pending points and active benefits.

**Consumer provides:** `available`, `pending`, optional `rule` (active benefit text), `action`, `compact`.

- One platform-wide points unit. Always says "Points aren't money and can't be cashed out"; no transfer, withdrawal or cash-value claims.
- Pending points are shown separately and labelled "not spendable yet".
- Uses the `points` color family only — never money styling. Balances are private to their owner.
