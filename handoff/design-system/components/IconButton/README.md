# IconButton

A round, icon-only button for compact tools (close, overflow menu, notifications).

**Consumer provides:** `icon`, `label` (required — becomes `aria-label` and tooltip title), optional `variant` (`quiet` | `secondary` | `primary`), `size` (`sm` 32 | `md` 40 | `lg` 48), `toggle` + `selected`, `disabled`, `onClick`.

- Only when the icon is universally understood (close, more, bell). Anything about payment, eligibility or permissions gets a text `Button` instead.
- `toggle` adds `aria-pressed`; selected switches the icon to `fill` and tints the background.
- On touch layouts wrap `sm` buttons in a 44px hit area.
