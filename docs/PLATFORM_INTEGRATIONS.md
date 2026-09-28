# External listening and viewing rewards: feasibility and test boundary

Checked against official documentation on September 27, 2026. This is an engineering assessment, not platform approval. Local Spotify and Google/YouTube OAuth are implemented for private audience/creator accounts, separate from shared samples. Playback verification and live external-activity earning remain unimplemented. A separately labeled demo link-open award is available only with `ASTRA_DEMO=1`; it is not evidence of a listen/view or permission to incentivize streams.

## Current local implementation

- YouTube: `/signin` and Settings offer Google OAuth for Audience / Creator / Both, read-only channel access on demand, and disconnect/revocation. Callback is `http://127.0.0.1:3000/api/integrations/youtube/callback`; secrets are `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`. Public video metadata uses `YOUTUBE_API_KEY` server-side. The key passed a live read-only sample-video request (HTTP 200); user OAuth consent remains unverified until the user completes it.
- Google ID-token signature verification uses `google-auth-library`, with issuer/client/expiry validation plus an attempt-specific nonce. OAuth includes PKCE and single-use 10-minute state bound to an HttpOnly cookie. Tokens reuse the local encryption key with provider-qualified associated data. Private Spotify accounts can explicitly link Google, and vice versa; separate private identities cannot be silently merged. Neither provider connection escalates existing roles or changes points.
- YouTube channels are fetched only on demand, sanitized and not persisted. No channel history, watch history or YouTube Music listening is accessed. Disconnect deletes tokens and attempts Google revocation; hashed sign-in identity/account remain. Revocation failure is disclosed and linked to Google permission management. Account deletion and production retention are unfinished.
- `/studio/publish` → YouTube creates a link post. Feed/profile/Loyalty share one campaign ID and one-time demo-credit record. Video previews load only on request, after checking public/embeddable/made-for-kids status; unavailable/unknown/kids content receives no embedded player. A privacy-enhanced YouTube player has no autoplay or reward tracking. API metadata cache lasts five minutes in server memory, bounded to 200 videos, with local per-account miss throttling. This is not a distributed production quota defense.
- Tests: `tests/youtube.test.ts`, render tests, `npm run test:youtube` (mocked Google and local MongoDB), plus HTTP route checks. Mock verification does not prove live consent or Google production approval. A YouTube connection does not force the external YouTube website to use that Google account.

- Open `/signin` and choose audience, creator or both under the private Spotify account section. Returning identities retain their existing roles. The Spotify user ID is hashed for account lookup, separate from public profile information. Artist ownership and creator verification are not inferred from OAuth.
- Callback: `http://127.0.0.1:3000/api/integrations/spotify/callback`. PKCE and single-use, ten-minute state bound to an HttpOnly browser cookie protect consent. Existing private-account reconnects are bound to that account. Session cookies are HttpOnly/SameSite=Lax for OAuth return; writes check origin.
- OAuth uses Client ID with PKCE, not a secret in browser code. `npm run spotify:check` separately validates the app's Client ID/secret against Spotify's official client-credentials endpoint, without exposing/storing the returned application token.
- Tokens are AES-256-GCM encrypted with per-account associated data. The local key is `.environment/config/spotify-token-key`, created by the configuration checker with owner-only permissions; do not remove or share it. For any future deployment, supply a separate 32-byte hex `SPOTIFY_TOKEN_ENCRYPTION_KEY` through server secret configuration.
- Settings offers connect, on-demand recent tracks, and disconnect for both roles. Raw listening history is not persisted. Disconnect deletes AStra's stored tokens, not the Spotify identity used for later sign-in. Users can revoke provider authorization through Spotify's Apps page. Account deletion is still separate work.
- Demo campaigns accept only canonical Spotify album/track and YouTube video/Shorts links. The server credits one labeled simulated award per user/campaign on a link-open request, not on confirmed navigation or listening. Ledger uniqueness plus the existing MongoDB transaction protects parallel requests. This is not a real reward mechanism or an anti-fraud-ready production system.
- New tests: `tests/spotify.test.ts`, `tests/demo-clicks.test.ts`, and `npm run test:spotify`. Mocked OAuth tests do not substitute for the user's live consent test. The live credential check does not verify callback registration or user allowlisting.

The feasibility assessment below still applies to **live rewards**; the conditional reward pipeline is not implemented. Replit deployment is not currently requested. Production privacy notices, account lifecycle, stronger authentication/session hardening, rate limiting and deployment review remain required before public launch.

## What is possible versus what is permitted

| Provider         | Official data capability                                                                                                                                              | Reward limitation                                                                                                                                                                                            | AStra today                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| Spotify | OAuth with `user-read-recently-played` can retrieve recent track records, including track/album information and a played timestamp. Requests return at most 50 items. | Spotify prohibits artificially increasing plays through compensation, financial or otherwise. A recent-track record is not proof of listening to a whole album, full playback or a royalty-qualified stream. | Private connection implemented; no listening credits. Live user consent still needs verification. |
| YouTube / Shorts | Public video metadata is separate from viewer history. The Data API does not expose the user's watch-history list. | YouTube API policy prohibits incentives for watching, liking, sharing and related engagement. OAuth does not remove this restriction. | Private account connection and public previews implemented; live consent pending. No viewing credits; separate demo link simulation only. |
| YouTube Music    | No supported individual-listen verification route has been established for this project. Google sign-in is not listening-history access.                              | Do not substitute unofficial YouTube Music clients, scraped browser history or YouTube embeds for a supported reward integration.                                                                            | Not connected; no credits. |
| Amazon Music     | Preview documentation describes a recently played content view, behind closed-beta API access.                                                                        | Beta access and contractual permission must be established. Recently played entities alone do not establish exact repeated plays or completed albums.                                                        | Not connected; no credits. |

Instagram Reels and YouTube Shorts are different products. YouTube cannot verify viewing an Instagram Reel. Ask which one the creator means; Instagram capability research remains separate and incomplete.

Sources:

- [Spotify recent tracks](https://developer.spotify.com/documentation/web-api/reference/get-recently-played)
- [Spotify policy, section II.2](https://developer.spotify.com/policy)
- [Spotify OAuth with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify development and extended quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [YouTube policy, playback integrity](https://developers.google.com/youtube/terms/developer-policies)
- [YouTube API history-access limitations](https://developers.google.com/youtube/v3/revision_history)
- [Google server-side OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google OpenID Connect identity verification](https://developers.google.com/identity/openid-connect/openid-connect)
- [YouTube channel lookup](https://developers.google.com/youtube/v3/docs/channels/list)
- [YouTube video status fields](https://developers.google.com/youtube/v3/docs/videos)
- [Amazon Music preview views and closed-beta notice](https://www.developer.amazon.com/docs/music/API_web_views.html)

## Decisions and access needed before implementation

1. Written provider permission for this exact incentivized use, not merely an API key. Availability of any exception is not assumed. Amazon also needs approved beta access and confirmed evidence semantics.
2. Choose a permitted non-incentivized data feature, an explicitly simulated demo, or AStra-native earning actions. These alternatives are proposals, not approved scope changes.
3. Confirm whether short videos mean YouTube Shorts, Instagram Reels or both.
4. Define one qualifying action: one track versus every track in an album; required completion; repeat limits; campaign start/end; points per action; daily and campaign budgets; fraud handling; funding; reversals. The fixed redemption rate does not answer these earning questions.
5. For an authorized connection: developer application/client ID, registered callback URL, access level/test accounts, and required scopes. Secrets belong only in project-local server configuration, never chat, screenshots, logs or browser code. No credentials are needed yet for blocked reward integrations.
6. Before real user data: production account authentication, explicit consent, token encryption/key handling, disconnect and provider revocation, retention/deletion rules and privacy notice.

## Conditional live-reward architecture (not implemented)

Only after access, evidence and permission are established:

Creator content URL → allowlisted provider/content ID → server-side ownership/eligibility checks → reviewed earning campaign.

Audience consent → provider-hosted OAuth (no passwords in AStra) → callback bound to the actual signed-in account → server-only token storage → authorized server-side event retrieval → match content and campaign window → deduplicate and validate → atomically append earning ledger and update approved points in MongoDB.

Never award points from a URL click, screenshot, browser timer, `ended` event, client-supplied `verified: true`, or aggregate view count. OAuth proves authorization, not qualifying consumption. Polling must respect rate limits; partial history is not complete evidence. A creator's submitted URL alone does not prove ownership or entitlement to run a campaign.

Keep raw playback data out of public/creator snapshots. Store the minimum evidence needed for the approved purpose. Uncertain evidence must not become spendable points. There is no fallback to scraping or unofficial APIs.

## Tests implemented now

`tests/external-rewards.test.ts` tests the actual current model, not fabricated provider responses:

- All four provider labels: claimed playback cannot credit points, including retries and another user's ID.
- Campaign activation/approval/owner flags supplied by a browser cannot activate a draft or change balances/ledger.
- Clicks, timers, screenshots, embedded-player events and uploaded history JSON cannot claim rewards.
- Settings cannot persist fake provider connections, tokens or injected balances.
- Creator permissions and campaign privacy remain enforced.
- Administrative role cannot bypass missing earning support.

`scripts/check-http.ts` additionally checks authenticated forged claims, repeated events, unauthenticated claims and audience campaign attempts through the HTTP API and persisted MongoDB-backed state. Run only against the separate test database described in README.md.

These are blocked-state regression tests. They do not demonstrate a successful OAuth flow or a verified listen.

## Live-integration acceptance checklist

Some account-connection cases below now have mock-provider tests (see the current implementation section); the full live-consent and production checklist is not complete. A live rewards adapter remains unimplemented and unapproved:

- OAuth state/PKCE validation, cancellation, callback replay/expiry, account binding and open-redirect rejection.
- Token refresh, revoked consent, disconnect/deletion, least privilege and tokens absent from logs/client responses.
- Provider 401/403/429/5xx, Retry-After, missing scopes, malformed responses, history gaps and sync-cursor recovery without invented events.
- Correct provider/content/album membership, campaign windows, completion semantics and creator eligibility.
- Duplicate provider events, concurrent workers, forged timestamps, daily caps and atomic one-time MongoDB credit.
- Failed transactions roll back both earning ledger and balance; pending evidence remains unspendable.
- Real provider sandbox/test-account end-to-end checks with user consent. Mocks alone cannot establish API access or policy approval.
