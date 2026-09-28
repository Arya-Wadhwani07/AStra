# Select

A native select styled to match `TextField`, for short fixed lists (discipline, arrangement, time zone).

**Consumer provides:** `label`, `options` (strings or `{value, label}`), `value` / `defaultValue` / `onChange`, optional `helper`, `error`, `disabled`, `size`.

- Use for 4–15 options. Fewer than 4 → `SegmentedControl` or radios; searchable long lists (skills, languages) → a combobox built from `SearchField` + `Chip` (documented in the handoff as a later addition).
- Native element keeps keyboard, screen-reader and mobile pickers correct. Caret icon is decorative.
