# OpportunityCard

A creator-only collaboration opportunity in the Find opportunities list, or (with `detail`) the header of its detail page.

**Consumer provides:** `title`, `poster`, `posterDiscipline`, `discipline` (needed), `deliverable`, `timing`, `remote` or `location`, `arrangement` (`paid` | `exchange` | `revenue` | `unpaid` | `open` — always one), optional `budget`, `criteria` (`{label, kind: 'required'|'preferred', met?}`), `responses`, `limit` (5 / 10 / 20), `status` (`open` | `paused` | `closed` | `draft`), `verified`, `detail`, `description`, `selected`.

- Always marked **Creators only** (lock + words). Rendered only inside the creator workspace — never in audience feeds, search or notifications.
- Opportunity status (Open / Paused — limit reached / Closed) is separate from a candidate's response status and from project status.
- The counter shows real snapshots: 8/10 before Eli responds, 9/10 after, 10/10 paused.
