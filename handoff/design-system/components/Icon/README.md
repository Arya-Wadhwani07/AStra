# Icon

Phosphor icons, the only interface icon family in AStra; `regular` weight by default and `fill` for the selected state of the same icon.

**Consumer provides:** `name` (Phosphor kebab-case name from `Icon.names`), optional `weight` (`regular` | `fill` | `bold` | `duotone`), `size` in px (default 20), `label` when the icon alone carries meaning.

- Sizes: `icon-sm` 16 in badges/chips/helper text, `icon-md` 20 in buttons, fields and nav, `icon-lg` 24 in bottom nav, `icon-xl` 40 in empty states.
- Color inherits `currentColor`; set it through the parent's text color token, never a literal.
- Align icons to the first text line (`vertical-align: middle` is built in); gap to text is `space-2` (8px), `space-1` inside badges.
- Selected nav/tab items switch `weight` to `fill` **and** change text weight — never color alone.
- Decorative icons are `aria-hidden` automatically. Pass `label` only when there is no visible text. Icon-only buttons put the label on the button (`IconButton`), not the icon.
- Payment, eligibility and permission meanings always carry a word next to the icon.
- React production code uses `@phosphor-icons/react` (`<PaletteIcon weight="regular" />`); this bundle embeds the same SVG paths so previews run without a package.
- Don't mix icon families or use emoji as UI icons.
