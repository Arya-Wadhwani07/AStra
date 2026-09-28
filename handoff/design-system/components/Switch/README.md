# Switch

An on/off setting that takes effect immediately (notification and privacy preferences).

**Consumer provides:** `label`, optional `description`, `checked` / `defaultChecked` / `onChange`, `disabled`.

- `role="switch"` with `aria-checked`; the thumb shows a check when on so state isn't color-only.
- Use only for instant settings. Choices that need Save, or that change money/points, use a checkbox or radio inside a form.
- Disabled switches explain why in the description (e.g. required notifications).
