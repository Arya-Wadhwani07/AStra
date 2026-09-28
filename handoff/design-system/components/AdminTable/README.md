# AdminTable

The administrator's compact review queue: a table of `AdminCaseRow`s with a filter bar.

**Consumer provides:** `AdminTable` — `title`, optional `tools`, `footer`, children rows. `AdminCaseRow` — `id`, `type`, `icon`, `subject`, `detail`, `status` (`pending` | `held` | `decided` | `appealed`), `age`, `selected`.

- Same tokens as the rest of AStra at higher density: 48px rows, `body-sm`, `control-sm` controls, `surface-sunken` sidebar.
- Case detail shows only the evidence needed; verification never exposes identity documents in lists.
- On tablet/mobile the table becomes stacked summary cards with the same fields and a drill-down.
