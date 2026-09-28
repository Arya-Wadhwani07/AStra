# Breadcrumbs

Breadcrumb trail for pages two or more levels deep, plus `Pagination` for long lists (admin queue, ledger history).

**Consumer provides:** `Breadcrumbs` — `items` (labels, last = current page). `Pagination` — `page`, `pages`.

- Breadcrumbs sit above the page title on desktop; on mobile replace them with a back button in the top bar.
- Pagination numbers use tabular figures; the current page is `action`-filled with `aria-current="page"`.
