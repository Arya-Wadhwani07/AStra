# BottomNav

Mobile primary navigation: the four most frequent destinations for the current role plus a labelled More menu.

**Consumer provides:** `role` (`audience` | `creator`), `active`, optional `cartCount`.

- Audience: Feed, Discover, Cart, Loyalty, More. Creator: Home, Publish, Collab, Community, More. More holds the rest (Orders, Favorites, Insights, Profile, Settings, role switch, sign out).
- Items are 56px tall with icon + always-visible label; selected shows a pill behind a fill icon.
- Sticky at the bottom (`z-sticky`); page content reserves space so nothing hides behind it.
