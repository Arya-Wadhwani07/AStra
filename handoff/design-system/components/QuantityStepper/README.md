# QuantityStepper

Minus / value / plus control for cart quantities.

**Consumer provides:** `value`, `min` (default 1), `max` (remaining inventory or per-order limit), `item` (for the accessible group label), `disabled`, `interactive`.

- Buttons disable at the limits; the value is announced politely. 36px tall on desktop; wrap in a 44px hit area on mobile.
- Quantity changes re-check availability; if inventory dropped, show a warning on the cart row.
