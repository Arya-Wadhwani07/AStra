# EmptyState

A designed state for first use, no results, or a recoverable load error.

**Consumer provides:** `tone` (`empty` | `noresults` | `error`), `title`, `body`, `action`, optional `secondary`, `icon`, `compact`.

- First-use states teach the next step with one meaningful action ("Find creators"). No-results offers Clear filters. Errors say what's safe ("Nothing you saved was lost") and offer Retry.
- Error tone uses a solid `error` border and `role="alert"`.
- The illustration slot takes an icon, or `OrbitingCircles` on the collaboration first-use state.
