# AuditRow

One immutable entry in the audit history: action, affected record, actor, time, reason and user notice.

**Consumer provides:** `action`, `record` (ID), `actor`, `time` (with time zone), optional `reason`, `notice`.

- Every restricted admin decision (warn, restrict, suspend, restore, remove, rule change) writes one row with a reason and the notice sent.
- Timeline rail uses `border` with an `action` dot; IDs use the mono `code` style.
