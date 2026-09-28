# Dialog

A modal dialog (or `drawer`) for confirmations and short focused tasks.

**Consumer provides:** `title`, children, `footer` (buttons, primary last), optional `tone` (`default` | `destructive`), `drawer`, `onClose`, `inline` (preview only).

- Focus moves to the first field (or the title) on open, is trapped inside, and returns to the triggering control on close. Esc closes non-destructive dialogs.
- Destructive/restricted actions (delete, suspend, remove, refund) state the consequence, require a reason where auditable, and use `alertdialog`.
- Scrim uses the `scrim` token; `radius-xl`, `shadow-lg`, `z-dialog`. Mobile: dialogs become bottom sheets, full-width.
- Motion: fade + 8px rise in `dur-base`; instant under reduced motion. Never used during payment processing.
