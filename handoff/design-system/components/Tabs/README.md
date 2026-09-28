# Tabs

Switches between sibling views of one page. `underline` for app pages; `display` for the sign-in/join entry (large display type, glowing `accent` bar).

**Consumer provides:** `items` (`{id, label, icon?, count?}`), `value` / `defaultValue` / `onChange`, `variant` (`underline` | `display`), `ariaLabel`.

- Selected tab: `ink` text, 3px `accent` underline, icon to fill. Unselected: `ink-muted`. `role="tablist"` with arrow-key movement and roving `tabIndex`.
- Collaborate always shows three distinct tabs: Create opportunity, Find opportunities, My collaborations.
- On mobile, underline tabs scroll horizontally; never wrap to two lines.
