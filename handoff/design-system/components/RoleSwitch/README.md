# RoleSwitch

The explicit creator ↔ audience view switch for dual-role accounts, with a persistent "Viewing as" label.

**Consumer provides:** `role` (`creator` | `audience`), `onChange`.

- Shown only to accounts that hold both roles. Single-role accounts see no switch; administrators never see it (admin access is provisioned separately and is never a public choice).
- Switching to Audience hides every collaboration surface; the nav's creator-only items disappear rather than disabling.
- On mobile, the current role is a pill in the top bar and the switch lives in the More menu.
