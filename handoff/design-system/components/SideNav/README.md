# SideNav

Desktop sidebar: logo, role switch, primary destinations for the current role, then notifications, settings and the account menu.

**Consumer provides:** `role` (`creator` | `audience` | `admin`), `active` (destination id), optional `user`, `unread`, `dual` (false hides the role switch), `onRoleChange`, custom `items`.

- Creator: Overview, Publish, Community, Collaborate (lock = creators only), Audience insights, Loyalty, Orders. Audience: Feed, Discover, Favorites, Loyalty, Cart, Orders. Admin (separate provisioning, `surface-sunken` sidebar + Admin badge): Review queue, Verification, Loyalty rules, Commerce disputes, Accounts, Audit history.
- Selected item: `surface-sunken` fill, 3px `accent` inset bar, fill icon in `action`, semibold text, `aria-current="page"`.
- Width `width-sidebar` (248px). Below `bp-md` (768px) it becomes the `TopBar` + `BottomNav`.
