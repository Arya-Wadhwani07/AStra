# Button

The one way to trigger an action; four variants in three sizes, with loading and explained-disabled states.

**Consumer provides:** `children` (verb-first label), `variant` (`primary` | `secondary` | `quiet` | `destructive`), `size` (`sm` 32 | `md` 40 | `lg` 48), optional `icon` / `iconRight`, `loading` + `loadingText`, `disabled` + `disabledReason`, `fullWidth`, `onClick`, `type`.

**Anatomy:** 12px corners (`radius-md`; 8px at `sm`) → optional leading icon → label (`label` style: 14px Schibsted Grotesk 600, sentence case) → optional trailing icon. Padding 16px (12px sm, 24px lg), gap `space-2`.

- **Primary** (`action` / `on-action`): off-navy with an `action-edge` hairline and a small navy-tinted shadow. It's the one thing the view is for.
- **Public glow:** add `className="as-btn--glow"` to at most one primary per public page (hero or Cinema stage). Never in the app, forms, checkout or admin.
- **Secondary**: `surface` fill with a `border-strong` edge and ink label. **Quiet**: text-weight action that gets a sunken fill on hover; use it instead of a second outlined button when the pair would be noisy. **Destructive**: `error` fill, always inside a confirmation.
- States: hover darkens (`action-hover`), pressed nudges 1px, focus shows the 2px `focus` ring with 2px offset, loading keeps width, shows a spinner and `aria-busy`, blocks repeat submission.
- A disabled control whose reason isn't obvious passes `disabledReason`; it renders under the button and is linked with `aria-describedby`.
- Labels stay on one line at desktop: three words at most for primary actions. One label per intent on a page.
- Mobile: primary actions use `lg` (48px) and `fullWidth` in sticky footers; every button's hit area is at least `touch-min`.
- Sentence case, verb first: "Send response", not "Submit".
