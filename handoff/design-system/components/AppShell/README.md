# AppShell

The page frame for signed-in views: `SideNav` + `TopBar` (title, breadcrumbs, actions) + main column + optional right rail on desktop; `TopBar` + content + `BottomNav` on mobile.

**Consumer provides:** `role`, `active`, `title`, children (main content), optional `rail` (loyalty or order summary), `crumbs`, `actions`, `user`, `unread`, `mobile`, `cartCount`.

- Desktop grid: `width-sidebar` 248 + content (max `width-page` 1200, 40px gutters) + optional `width-rail` 320. Admin uses the same shell, wider and denser.
- ≥1280: sidebar + content + rail. 768–1279: rail drops below the main column. <768: top bar with role pill, content with 16px gutters, bottom nav.
- The audience feed and creator workspace differ by density and task hierarchy, not by a different visual language.
