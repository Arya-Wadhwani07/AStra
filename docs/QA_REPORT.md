# AStra creator and audience QA

Run date: September 27, 2026. Scope: current local hackathon website; Instagram deferred. All edits, browser downloads, caches, reports and test data stayed inside AStra. Test mutations used isolated local MongoDB databases, not the main demo accounts.

## Final results

| Suite | Coverage | Result |
| --- | --- | --- |
| Unit / server render | Rules, permissions, password hashing, parsers, particle geometry, route rendering, commerce and collaboration | 131 passed |
| Chromium browser | 26 scenarios at desktop 1440×900 and mobile 390×844, including live motion controls | 52 passed |
| AStra authentication | Real password accounts, duplicate races, throttling, session invalidation and old-account rejection | 7 groups passed |
| MongoDB | Transactions, simultaneous requests, persistence and session expiry | 10 groups passed |
| Spotify | Mocked OAuth, linking to AStra password accounts, encryption, refresh, disconnect and reward concurrency | 11 groups passed |
| YouTube | Mocked OAuth, linking to AStra password accounts, identity checks, encryption, refresh, disconnect and reward concurrency | 10 groups passed |
| HTTP | Real API handlers, CSRF, cookies, permissions, 27 route groups, assets and rewards | 20 groups passed |
| Production build | Next.js compilation and TypeScript | Passed |

These are scenario/check-group counts, not a measure of exhaustive coverage. Final browser run: no retries, no skipped cases, no uncaught JavaScript or hydration errors. Early runs found four application defects below; test-fixture and selector mistakes were also corrected before the final run.

## Browser cases

Every case runs at both viewport sizes using freshly seeded test data. Provider pages/players are stubbed; no real account tokens are used or captured.

| ID | Scenario / expected outcome |
| --- | --- |
| B01 | Creator ships order; audience sees tracking and requests refund without wallet credit; shipping cannot overwrite the refund request. |
| B02 | Creator sends private message; intended collaborator sees it; third creator cannot retrieve it. |
| B03 | Public landing loads; missing creator shows a useful empty state; unknown route returns 404. |
| B04 | Audience signs in, searches creators, removes/re-adds a favorite and signs out; private creator access stays blocked. |
| B05 | Audience adds ticket, applies permitted 500 points, confirms simulated purchase and sees receipt/order; wallet and cart update. |
| B06 | Creator publishes artwork; following audience sees it but cannot modify it. |
| B07 | Creator saves a draft; audience cannot see it. |
| B08 | Creator publishes YouTube link; audience receives one simulated point for link-open; repeats return zero. |
| B09 | Creator posts cross-discipline opportunity; eligible collaborator responds once; duplicates and audience access are blocked. |
| B10 | Settings persist after reload; switching a dual-role account to audience removes private collaboration access. |
| B11 | Above-cap redemption cannot debit wallet; corrected amount succeeds. |
| B12 | Network failure displays an error; retry succeeds without losing the account. |
| B13 | Key audience/creator pages have no horizontal document overflow; screenshots captured. |
| B14 | New audience account begins with zero points and can favorite a creator in onboarding. |
| B15 | New creator account begins with zero points and can favorite a creator in onboarding. |
| B16 | Empty publication form and deceptive provider domain cannot create content. |
| B17 | Spotify post generates the official embed URL; rendering does not credit points. |
| B18 | Cancelled YouTube consent shows a safe error and creates no account. |
| B19 | Cancelled Spotify consent shows a safe error and creates no account. |

## Other happy paths and edge cases

New `tests/journeys.test.ts` covers the complete merchandise publish → purchase → capped redemption → fulfilment → refund-request flow; opportunity → response → shortlist → brief → mutual confirmation; re-confirmation after brief changes; draft/edit/publish/unpublish/delete; direct-outreach deduplication; ownership and notification privacy; quantity/stock validation; discount-cap changes at checkout; delivery details; failed/cancelled payment; registration validation; and prevention of identity/balance injection through settings.

Existing suites additionally cover pending-point restrictions, multi-seller caps, idempotent checkout, required collaboration filters and response caps, stale brief versions, origin checks, malformed provider URLs, OAuth replay/expiry/browser mismatch, missing permission, conflicting identities, token encryption, role escalation and disabled-demo behavior.

Real MongoDB tests include concurrent checkout retries, multiple creators competing for the last response slot, two buyers competing for the last ticket, and concurrent demo claims. Invalid profile updates roll back earlier field changes. Expired sessions are denied immediately without waiting for MongoDB's TTL cleanup.

## Bugs found and fixed

| Problem | Fix and regression |
| --- | --- |
| Unknown/missing publication command silently unpublished a post. | Accept only publish, unpublish or delete; invalid values leave content unchanged. |
| Malformed close/reopen command silently reopened an opportunity. | Require a boolean before changing its status. |
| Shipping could overwrite a pending refund request. | Only Preparing orders can transition to Shipped; refund requests remain on hold. Model and browser/API checks cover this. |
| Repeating shipping created duplicate notifications. | Same-order/same-tracking retry is a no-op; other changes to non-Preparing orders are rejected. |

The subsequent approved design/authentication pass adds consistent hover/press/focus states, a continuous dark landing surface and three device-resolution particle sculptures. Mobile animation controls initially sat beneath the text layer; live-motion browser testing caught this, and stacking/positioning were corrected. The top mascot was deliberately omitted; the existing footer mascot remains.

## Mandatory AStra authentication

- Normal users create an AStra email/password account. Spotify/YouTube are optional Settings connections, not replacements for AStra authentication. New accounts start with zero points. There is no email verification or password-reset delivery yet.
- Passwords use per-account random salts and scrypt (N=131072, r=8, p=1), with bounded hashing concurrency. The parameters follow [OWASP password-storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Password/lookup hashes are excluded from every client snapshot.
- Email lookup is case-normalized and unique. Transactional signup tests cover simultaneous duplicate attempts. Persistent per-email throttling permits at most ten authentication attempts per 15-minute window; this is not a substitute for production-wide/IP abuse protection.
- All 25 feature-route patterns require a server-validated session. Anonymous/forged cookies receive redirects to sign-in; app-data and provider APIs return 401 without feature data. Landing/sign-in remain public. Logout returns no app snapshot.
- Shared login/passwordless registration are disabled in normal operation, independently of the simulated-rewards flag. Test fixtures require both an explicit test flag and an allowlisted isolated database. Genuine old sample/provider-only session cookies are rejected in normal mode. Old records are preserved; they are not silently merged into new email/password accounts.
- Browser cases add creator/audience password signup, logout/sign-in, wrong password, duplicate signup, invalid role, CSRF, 25-route anonymous/forged-cookie checks, provider authentication gates, keyboard focus, hover, reduced motion, real WebGL pause/resume and vector fallbacks.
- Read-only checks against the normal port-3000 server confirmed anonymous `/api/app` is 401, legacy `login` and `register` are 403, and the sign-in HTML has no shared-account selector.

## Artifacts and rerunning

- Browser report: [local HTML report](../.environment/test-results/browser-report/index.html).
- Screenshots/traces: `.environment/test-results/browser/`. The runner replaces its own generated report/results on the next run. Provider stubs and dummy OAuth configuration prevent recording personal credentials.
- Tests: `tests/browser.spec.ts`, `tests/journeys.test.ts`, existing test files, and `scripts/check-mongo.ts`.
- Browser configuration: `playwright.config.ts`; it accepts only `astra_browser_test_<timestamp>` databases. Test databases remain local for inspection. Main user records were not deleted.

Run from AStra with MongoDB running:

```sh
node scripts/env.mjs npm run build
node scripts/env.mjs npm test
node scripts/env.mjs npm run test:mongo
node scripts/env.mjs npm run test:auth
node scripts/env.mjs npm run test:spotify
node scripts/env.mjs npm run test:youtube
node scripts/env.mjs npm run test:browser
```

The browser suite starts/stops its own port-3002 server. Install its local browser if needed with `node scripts/env.mjs node_modules/.bin/playwright install chromium`.

For HTTP tests, use the isolated port-3001 server command in README, then `node scripts/env.mjs npm run test:http`. Stop only the temporary test server afterward. Main site: `http://127.0.0.1:3000`.

## Limits and final manual checks

- Passing tests do not guarantee an error-free, production-ready or security-certified website.
- Browser coverage is Chromium desktop/mobile emulation, not physical phones, Safari or Firefox. Landing and sculpture screenshots were inspected alongside representative app pages; this is not a pixel-by-pixel audit of every page/theme.
- Live Spotify/Google consent was not completed in this run. The last reported Google blocker required adding an approved test user. Provider happy paths use mocks; actual client registration, test-account access and consent still require manual confirmation.
- Actual external playback is not exercised. Rewards remain simulated one-time link-open points, not verified listens/views.
- Payments, shipping, tickets, verification and refunds remain hackathon simulations. No real charges, messages or shipments were made. Refund settlement and point-restoration policies are unresolved.
- Load/stress testing, full accessibility audits, production account lifecycle and deployment hardening are outside this pass.

Recommended manual demo: creator publishes a link; audience favorites them, claims once and redeems within the creator cap on a sample purchase; creators then demonstrate a private collaboration. Separately approve live provider consent using test accounts, without sharing authorization codes or tokens.
