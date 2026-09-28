# Toast

A brief, non-blocking confirmation that appears bottom-center (mobile) or bottom-right (desktop) and dismisses after 6s.

**Consumer provides:** `tone` (`success` | `error` | `info` | `points`), `title`, optional body, `action` label.

- `role="status"` + `aria-live="polite"`; pauses its timer on hover/focus; never the only record of something important (orders, payments, decisions get a page or banner).
- One at a time; a new toast replaces the old. Stack order `z-toast`.
- Motion: slides 8px + fades in over `dur-base`; reduced motion shows it instantly.
