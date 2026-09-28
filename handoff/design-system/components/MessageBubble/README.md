# MessageBubble

A message in a private creator-to-creator conversation, including system notes and sending/failed states.

**Consumer provides:** children (text), `author`, `time`, `own`, `status` (`sending` | `sent` | `failed`), `system` + `icon`.

- Own messages: `action` fill with `on-action` text, right-aligned. Others: `surface-sunken` with a hairline, avatar + name.
- Failed: dashed `error` outline, "Not sent" + Retry that resends the same message once.
- Conversations are visible only to participants (and authorized review). No typing indicators or read receipts are promised.
