# StatusBadge

A small label that states a status in words, backed by an icon and a tone.

**Consumer provides:** children (the status word), `tone` (`success` | `warning` | `error` | `info` | `neutral` | `points` | `private` | `accent`), optional `icon` (Phosphor name, or `false`).

- A glass pill tinted with 12% of its tone, with an icon and a word (12px Manrope 600). Text is always present; colour and icon only reinforce it (4.5:1 on every ground).
- `points` is only for loyalty states; `private` only for creator-only markers; status colors never double as the brand accent.
- Keep separate badges for separate facts: payment status, order status and email delivery are three badges, never one.
