# CartItem

One line in the cart: item, creator, type, quantity, price and removal, with changed-price and unavailable states.

**Consumer provides:** `title`, `type` (`event` | `merch`), `creator`, optional `detail`, media (`art`/`discipline`), `price`, `qty`, `max`, `compare` (old price), `changed` (message), `unavailable` (message), `pointsEligible`.

- Availability and price are re-checked before payment. Changes appear on the row (warning) and block payment until the revised total is reviewed.
- Unavailable items can't be purchased; the only action is Remove.
- Cart may group rows by creator; the demo checks out one creator and one ticket.
