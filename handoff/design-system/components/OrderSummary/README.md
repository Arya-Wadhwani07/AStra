# OrderSummary

Totals for the cart and checkout: subtotal, points discount, fees/tax, total, and points remaining after the order.

**Consumer provides:** `items`, `subtotal`, `pointsUsed`, `discount`, `fees` (`null` = calculated later), `feesNote`, `total`, `remaining`, `pending`, `rule` (active demo rule text), `state` (`ready` | `processing` | `blocked`), `cta`, `notice`.

- Money lines are `ink`; the points discount line is `points` with the star icon and the points used ("500 pts applied"). The remaining balance is stated separately from money — pending points are never spendable.
- Demo arithmetic: 1 × $25 = $25; 500 of 600 points → −$5; fees $0; **total $20**; 100 points remain, 50 still pending.
- Processing disables the button, shows a spinner and "We won't charge you twice". Blocked (changed price) explains why.
- Desktop: sticky in the right rail. Mobile: collapsed total in a sticky footer that expands.
