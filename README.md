# AStra

A responsive working hackathon prototype built from the approved Glass/Cinema handoff. Next.js, React, TypeScript, Phosphor icons and **MongoDB**. All application writes and development output stay under this project directory.

## Run on this Mac

Latest creator/audience test cases, results, fixes and limitations: [QA report](docs/QA_REPORT.md). Browser journeys run with `node scripts/env.mjs npm run test:browser`; they use an isolated database and save their report under `.environment/test-results/browser-report/`.

From `/Users/arya/Personal/Code/Projects/AStra`, start the persistent local database in one terminal:

```sh
node scripts/env.mjs npm run db:start
```

In another terminal:

```sh
node scripts/env.mjs npm run dev
```

Open **http://127.0.0.1:3000**. The numeric address matters if another application occupies IPv6 `localhost:3000`. For a production-mode local preview, run `npm run build` and then `npm run start`, both through `node scripts/env.mjs`.

The sample demo does not require Atlas, Docker, payment details or external credentials. Optional Spotify connection requires local Spotify configuration described below. Read [ENVIRONMENT.md](ENVIRONMENT.md) for isolation details. Stop each terminal with Ctrl+C; MongoDB retains its data. Do not run `npm` or development tools outside the wrapper.

## Sign in to AStra

Open `/signin` and select **Create account**. Enter your name, email, a 15–128 character password and Audience / Creator / Both. New accounts have zero points and unsubmitted creator verification. Returning users use **Sign in to AStra** with their email/password. Spotify and YouTube connections are optional and available in Settings only after AStra sign-in.

Only landing/sign-in are public. All feature pages and data APIs require a valid server session. Passwords are salted and hashed; credentials never appear in client snapshots. Email verification and password-reset delivery are not configured. Do not treat this local hackathon build as deployment-ready authentication.

Shared sample sign-in and no-password registration are disabled on the normal website, even with `ASTRA_DEMO=1`. Old sample and provider-only sessions no longer grant access. Their records are preserved, not merged. Use a new AStra account. Existing connections tied to another identity cannot be silently transferred.

Automated tests retain fictional Alex/Mira/Eli/Sam/Jonah fixtures only when `ASTRA_TEST_ACCOUNTS=1` and an allowlisted isolated test database are both selected. The sample administrator workflow is test-only too; no public administrator signup is available.

### Suggested walkthrough

1. Create a creator account, finish the profile and publish a post or explicitly labelled simulated link campaign.
2. In a separate signed-in audience account, follow that creator and view the post. New accounts do not receive a seeded points balance.
3. Optionally connect Spotify/YouTube from Settings; connections do not award points or replace AStra authentication.
4. Create a second creator account to try the private opportunity/response/brief workflow. Required profile criteria still apply.
5. Sign out and visit `/discover`, `/loyalty` or `/studio/collaborate` directly: each must return you to sign-in.

Automated fixture tests additionally exercise 500 points → $5 off a $25 sample ticket under a 20% cap, order fulfilment and private brief confirmation. Payments, reward discounts and verification remain simulations.

## Implemented areas

### Spotify connection and hackathon click simulation

Spotify is an optional connection for an already signed-in AStra email/password account. Open Settings → **Connect Spotify**. It links to the current account, retaining roles and points. Use **Show recent tracks** or **Disconnect** there. It is not an AStra sign-in method and does not establish artist ownership or creator verification.

The ignored `.env.local` contains `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REDIRECT_URI`. Register exactly `http://127.0.0.1:3000/api/integrations/spotify/callback` in Spotify. Run `node scripts/env.mjs npm run spotify:check` to validate application credentials and provision the local token encryption key. Do not share the environment file or `.environment/config/spotify-token-key`. OAuth itself uses PKCE; no client secret reaches the browser. Tokens are encrypted in MongoDB. Recent history is fetched on demand, not persisted or used for points. Full live user-consent testing requires the user's Spotify approval and allowed-test-user setup.

For the click demonstration: a creator opens `/studio/loyalty`, supplies a Spotify album/track or YouTube video/Shorts link and 1–100 demo points, then explicitly checks **Publish as a hackathon click simulation**. Other accounts see it at `/loyalty`. A link-open request awards once per account/campaign; repeat requests return the same destination without credit. This records a request, not successful navigation, a view, a listen or album completion. These points apply only to existing **simulated checkout**; they are not real-world discounts, and the feature is disabled unless `ASTRA_DEMO=1`. This does not establish provider permission for a live reward scheme. No Replit deployment is currently requested.

Details and privacy limitations: [platform integrations](docs/PLATFORM_INTEGRATIONS.md).

For a feed-first Spotify post, open **Create something → Spotify**, paste a full Spotify track/album URL, add a post title/message and choose 1–100 demo points (default 1). Published Spotify demo campaigns also appear as Posts/Music in followers' feeds and on the creator profile, without duplicating the campaign record. The official Spotify iframe renders the release; the separate **Open in Spotify** button requests the one-time demo award and navigates to Spotify. Playing the iframe does not award points. Existing Spotify demo campaigns also appear; older records without a creation date sort after dated posts. No reward is granted merely by rendering a card. The embed contacts Spotify, may be unavailable due to provider/network restrictions, and retains its own controls/attribution. A link remains available if the preview cannot load.

All 27 route groups are connected: landing, sign-in/join, onboarding; audience feed, discovery, creator profiles, events, cart, loyalty, orders, notifications and settings; creator overview, setup, profile, publishing, insights, orders, loyalty, community, messages and mobile menu; opportunity discovery, creation, responses and shared briefs; administrator review queue.

The approved fonts, tokens, art treatments, God UI-style AuroraText/OrbitingCircles, Phosphor icons, cinematic videos and pixel mascot are local assets. The handoff remains unchanged. Components are React modules; the canvas prototype runtime is not shipped.

The landing hero now uses an original WebGL particle sculpture inspired by the supplied recording: rotating prism/intertwined strands, perspective floor rings and a faint reflection. Geometry is generated locally, with no new dependency or asset download. It uses 10,500 particles on initial mobile load and 22,000 on desktop, capped pixel density, and two batched draw calls per frame. Pause/play is remembered for the tab. Offscreen and hidden-tab animation stops; reduced-motion, Save-Data and unavailable WebGL use the existing static poster. The other cinematic sections retain their supplied videos. Their controls remain usable if autoplay is blocked.

## Data and guarantees

MongoDB stores users, posts, opportunities, responses, briefs, conversations, messages, orders, ledger entries, notices, reviews, audits, community posts, campaign drafts, carts and sessions in separate collections. Session tokens are random, stored hashed, and sent in HttpOnly same-site cookies. Sessions have a TTL index. Creator/opportunity responses have a unique compound index.

Multi-document transactions protect inventory, orders and point debits. Payment retries are idempotent. The current small-demo implementation serializes aggregate mutations with a metadata document, reads the relevant demo dataset and persists changed documents. This is deliberately correctness-first, **not a high-scale production query architecture**. Production would use targeted queries, pagination and finer-grained transactions.

The initial SQLite experiment is no longer used by the app. Its original files are preserved in `.environment/data/`; `legacy-state.json` imports the saved sample state when the main MongoDB database is first initialized. Old session cookies are not migrated; sign in again. Test databases are separate `astra_test_*`/`astra_http_test` databases within the same project-local MongoDB storage.

## Verification

```sh
node scripts/env.mjs npm run typecheck
node scripts/env.mjs npm test
node scripts/env.mjs npm run test:mongo
node scripts/env.mjs npm run test:spotify
node scripts/env.mjs npm run build
```

For HTTP checks, run `node scripts/env.mjs env ASTRA_DB_NAME=astra_http_test ASTRA_TEST_ACCOUNTS=1 SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001/api/integrations/spotify/callback GOOGLE_REDIRECT_URI=http://127.0.0.1:3001/api/integrations/youtube/callback npm run start -- --port 3001`, then `node scripts/env.mjs npm run test:http` in another terminal. These tests use separate data and do not alter main accounts. Test-only callbacks test cancellation locally; do not register them or grant actual provider consent through the test server. Run `node scripts/env.mjs npm run test:auth` for normal-mode password/session checks with no shared-account bypass.

### YouTube account connection and feed

The server reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` and `YOUTUBE_API_KEY` from ignored `.env.local`. Register the exact local callback `http://127.0.0.1:3000/api/integrations/youtube/callback` on a Google OAuth **Web application** client. Enable YouTube Data API v3 and add your Google account as a test user. Consent requests `openid profile` plus `https://www.googleapis.com/auth/youtube.readonly`. Restrict the server API key to YouTube Data API v3; browser referrer restrictions do not suit server-side requests.

Sign in to AStra first, then open Settings → **Connect YouTube** and approve Google consent. Success returns to Settings with **Connected**. **Check my YouTube channels** performs an on-demand read; a channel is not required. No watch history or YouTube Music history is read. Google secrets/tokens never enter browser responses. The Google library verifies ID-token signatures and claims; nonce/PKCE/browser state bind the flow. The local token-encryption key uses a YouTube-specific encryption context.

To use Spotify and YouTube on **one** AStra account, sign in with your AStra email/password, then connect each separately in Settings. Already separately registered identities are not automatically merged. Shared test accounts are never linked to private tokens. Disconnect deletes YouTube tokens locally and attempts Google revocation; the AStra account remains. If revocation fails, use the Google permissions link. Production account deletion/retention remains separate work.

Creators open `/studio/publish` → **YouTube**, enter a public video/Shorts link and demo point amount. Followers see it in All / Posts / Videos and the creator profile. **Load YouTube preview** first checks public metadata, embedding and made-for-kids status; unavailable/restricted/unknown-status videos keep an external-link fallback. No preview autoplay. Viewing never awards points; only the separately labeled hackathon link-open request can credit the one-time simulated award. Account connection cannot choose which Google account the external YouTube website is currently using.

Run `node scripts/env.mjs npm run test:youtube` for mocked Google + isolated local MongoDB checks. A successful API-key check is not proof that OAuth client settings or user consent work; live consent must be completed by the user.

The automated suite covers populated rendering of all routes, audience/private-data separation, role authorization, caps, pending points, failed checkout, idempotency, stock, response limits and filters, version confirmations, verification gates and audited decisions. MongoDB integration checks exercise rollback, real concurrent requests, persistence, sessions and indexes. HTTP checks cover sign-in, CSRF, role switching, route responses and local assets.

**Visual browser QA remains outstanding:** browser automation was unavailable in this session. Responsive rules are implemented, but exact screenshot matching at 1440px/390px, keyboard walkthroughs and live video behavior have not been visually verified. Component rendering tests are not a substitute for those checks.

## Explicit prototype limits

- Mandatory AStra email/password authentication is implemented; shared sample login is restricted to isolated tests. No email verification/reset delivery, real payments, ticket fulfilment, identity checks, shipping integration, uploads or media storage service. Sample checkout never collects card information or charges money.
- Spotify account connection and on-demand recent tracks do not verify listening completion or award points. No YouTube Music or Amazon Music account integration. Draft earning proposals remain non-earning unless explicitly published as demo click campaigns. Sample points are not evidence of actual listening or engagement.
- Whole-point redemption and caps from 0 to 99% are labeled demo assumptions. Fees, taxes, shipping, expiry, discount funding, multi-seller settlement and refunds remain unresolved. Refund requests create reviews and never automatically restore points or money.
- Direct outreach starts a conversation immediately in this local demo. Acceptance, blocking, rate limiting and full moderation workflows need production decisions and implementation.
- The sample art is deliberately labeled. Analytics are calculated from demo orders; unconnected audience metrics are not invented.
- All routes are implemented, but not every illustrative state and pixel-level detail in the 53 reference boards is a production-complete feature. Deployment and a security/accessibility audit remain separate work.

Team: Saloni Belliappa Bolakaranda (Product), Arya Jay Wadhwani (Technical). AStra is the working name.
