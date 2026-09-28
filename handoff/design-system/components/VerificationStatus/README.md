# VerificationStatus

A creator's verification status with what it affects and the next action.

**Consumer provides:** `status` (`not_submitted` | `pending` | `verified` | `action_needed`), optional `gatedAction` (which actions wait on it), `body`.

- Labels are proposed: Not submitted, Pending review, Verified, Action needed. Each carries an icon, word and plain-language explanation.
- A gated action elsewhere (e.g. Publish event) is disabled with a `disabledReason` pointing here.
- Never display identity documents; admins see evidence only inside case detail. Provider and trigger rules are undecided (see handoff).
