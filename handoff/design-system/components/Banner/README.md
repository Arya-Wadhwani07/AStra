# Banner

An inline message about the current page or section that stays until resolved or dismissed.

**Consumer provides:** `tone` (`info` | `success` | `warning` | `error` | `private` | `points`), `title`, optional children (body), `action` (a `Button`), `dismissible` / `onDismiss`, `icon`.

- Errors use `role="alert"`; others `role="status"`. Body text says what happened and what to do next; recoverable errors always offer the recovery action.
- Payment failures state plainly whether the person was charged and that the cart is preserved.
- Place above the content it concerns. Toasts are for transient confirmations; banners for anything that needs reading.
