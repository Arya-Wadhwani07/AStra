# TextField

Labeled single- or multi-line text input with helper, error and success messages. `PasswordField` adds a show/hide toggle.

**Consumer provides:** `label` (always visible), optional `placeholder` (an example, never the label), `helper`, `error` (sentence saying how to fix it), `success`, `required` / `optional`, `disabled`, `icon` (leading), `type` (`text`, `email`, `search`, `date`, `time`, `datetime-local`, `number`…), `multiline` + `rows`, `counter`, `value` / `defaultValue` / `onChange`, `size` (`sm` for admin tables, `lg` for mobile checkout).

**Anatomy:** label (`label`) → 8px → control (`field` fill, `border-strong` outline, `radius-md`, 40px) → 8px → helper/error (`helper`, 13px).

- Focus: `focus` border + 1px ring. Error: `error` outline + icon + message linked by `aria-describedby`, `aria-invalid`. Success: `success` outline and message.
- Disabled uses `surface-sunken` fill and `ink-subtle` text and says why in the helper.
- Keep the entered value on error; never clear a form after a failed submit.
- Date/time fields show the time zone in helper text.
- Mobile: 16px input text (no zoom), 48px (`lg`) controls in checkout.
