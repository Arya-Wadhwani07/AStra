# SegmentedControl

A pill group for choosing one of 2–5 short options that switch a view or setting (response limit 5/10/20, Post/Event/Merchandise, role).

**Consumer provides:** `options` (`{value, label, icon?, note?, disabled?}`), `value` / `defaultValue` / `onChange`, `label` (or `ariaLabel`), optional `helper`, `size` (`sm`), `fullWidth`.

- Implemented as a `radiogroup`; the selected segment is raised onto `surface` with a `border-strong` inset and its icon switches to fill.
- The opportunity response limit always offers exactly 5 / **10 (default)** / 20.
