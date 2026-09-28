# Chip

Compact pills for filters, skills and opportunity criteria.

**Consumer provides:** children/`label`, optional `icon`, `interactive` / `onClick` + `selected` (filter toggle, `aria-pressed`), `onRemove` (removable filter), `tone` (`neutral` | `required` | `preferred`), `met` (`true` / `false` when compared with a viewer's profile), `count`.

- **Required** criteria: solid `border-strong` outline + lock icon + the word "Required". **Preferred**: dashed outline + four-point star + "Preferred". The word is always present — shape and icon back it up.
- `met` adds the success/error tint and swaps the icon, for eligibility views only.
- Audience feed filters are Posts, Events, Merchandise — never collaboration types.
