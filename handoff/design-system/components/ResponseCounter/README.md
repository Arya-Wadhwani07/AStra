# ResponseCounter

Responses received against the opportunity's limit, with a meter and a paused state at the cap.

**Consumer provides:** `count`, `limit` (5 | 10 | 20).

- A `meter` with an accessible "8 of 10 responses" label; figures use tabular numbers.
- At the limit it switches to "Paused at limit" (warning icon + words) and new responses are blocked server-side. What happens to slots after declines or reopening is an open rule — never silently reset the count.
