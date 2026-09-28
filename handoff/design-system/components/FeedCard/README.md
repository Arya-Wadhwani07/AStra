# FeedCard

One item in the audience's chronological feed: a post, event or merchandise item from a favorite creator.

**Consumer provides:** `type` (`post` | `event` | `merch`), `creator`, `discipline`, `time`, `title`, optional `body`, media (`src`/`alt` or `art`, `credit`, `ratio`), `textOnly` (writer updates), event `date` + `location`, `price`, `availability` + `count`, `favorite`, `verified`.

**Anatomy:** header (compact `CreatorSummary`, type tag with icon + word, relative time) → media → body (event when/where in `accent-ink`, title, text, price + availability) → footer (content-specific action, favorite, overflow with Report).

- Actions match content: Read post / View event / View item — not every card is an ad. External events say "Open ticket site" with an external-link icon.
- Event titles use the display family; posts and merch use the interface family. Text-only posts are first-class (larger title, full-contrast body).
- Report sits in the overflow menu, available without dominating the card.
- Never shows creator-only collaboration content.
- Mobile: full-width, 20px padding, 16px gap between cards.
