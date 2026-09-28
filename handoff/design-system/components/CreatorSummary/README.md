# CreatorSummary

A creator's identity at a glance: avatar, name, discipline, location, and (full size) bio, skills and the Favorite action.

**Consumer provides:** `name`, `discipline` (`painter` | `musician` | `writer` | `dancer` | `photographer` | `video` | `streamer` | `educator`), optional `location`, `avatar`, `verified`, `bio`, `skills`, `favorite` (shows `FavoriteButton`), `action`, `compact`, `card`.

- Compact is used in feed cards, opportunity cards and rows; full size on discovery results and profile headers.
- Every discipline has its own Phosphor icon + label so the system never reads as music-only.
- Audience visitors get Favorite; creator visitors may get Message instead (via `action`).
