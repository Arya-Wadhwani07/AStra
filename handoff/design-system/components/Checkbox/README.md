# Checkbox

Checkbox (multi-select, consent) and `Radio` (single choice with descriptions) sharing one anatomy.

**Consumer provides:** `label`, optional `description`, `checked` / `defaultChecked` / `onChange`, `disabled`, `indeterminate` (checkbox), `name` + `value` (radio), `error`.

- 20px box in a 24px hit row; the whole label is clickable. Checked uses `action` fill with `on-action` check (bold). Focus ring on the box.
- Group related options under a visible legend (the field label). Use radios with descriptions for consequential choices such as Required vs Preferred criteria.
- Consent checkboxes are never pre-checked.
