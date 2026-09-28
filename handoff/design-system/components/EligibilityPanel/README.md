# EligibilityPanel

Tells a creator whether they can respond to an opportunity, and why, criterion by criterion.

**Consumer provides:** `state` (`eligible` | `missing` | `ineligible` | `responded` | `paused` | `closed`), optional `criteria` (`{label, kind, met: true|false|undefined}`), `title`, `body`, `action`.

- Each criterion row states its kind (Required / Preferred) and result in words: Matches, Not on your profile, Not a match — still eligible, Missing from profile.
- Required criteria block; preferred criteria only highlight. Missing profile data is never inferred — the panel offers Edit profile.
- After responding, the panel replaces the form with "Response sent" and Open conversation. There is no second response button.
- Portfolios support manual review; there is no automatic quality score.
