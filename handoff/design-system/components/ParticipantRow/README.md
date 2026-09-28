# ParticipantRow

A candidate (response) or project participant in the owner's review list or a brief.

**Consumer provides:** `name`, `discipline`, optional `role`, `match` (e.g. "3 of 3 criteria"), `message` (their short response), `status` (`new` | `shortlisted` | `declined` | `accepted` | `changes` | `awaiting` | `confirmed`), `version`, `verified`, `actions`.

- Candidate states (New, Shortlisted, Declined, Accepted, Changes requested) are distinct from opportunity and project states.
- Owner actions: Shortlist, Decline, Accept, Request changes. Declines are private to the owner and the candidate.
