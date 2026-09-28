# ResponseForm

The one short response an eligible creator sends to an opportunity, with their profile/portfolio attached.

**Consumer provides:** `profile` (attachment label), optional `value`, `max` (default 280 characters), `state` (`idle` | `sending` | `failed`).

- One response per creator per opportunity; submit disables while sending and the server rejects duplicates.
- A failed send keeps the text and offers Try again without creating a duplicate.
- Marked "Only the owner sees this". Sending opens a private conversation tied to the opportunity.
