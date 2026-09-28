# FavoriteButton

Adds or removes a creator from the audience member's Favorites; favorites drive the chronological feed.

**Consumer provides:** `name` (creator, used in the accessible label), `active`, optional `withLabel`, `interactive`.

- `aria-pressed` toggle. Off: outline heart, `ink-muted`. On: filled heart in `accent-ink`, label reads "Favorited".
- Optimistic update with a toast on failure ("Couldn't save favorite — try again"), which reverts the state.
