# Replit deployment

This changes hosting configuration only. UI, account requirements, loyalty rules,
simulated checkout and provider integrations remain unchanged. Local data is not
migrated. An empty database receives the same initial fixture content as a new
local installation; locally created accounts and posts are not included.

## Upload and commands

Upload application source (`src/`, `public/`), `package.json`, `package-lock.json`,
`next.config.ts`, `next-env.d.ts`, `tsconfig.json`, and `.replit` at the project root.
Do not upload `.env.local`, `.environment/`, `.git/`, `node_modules/`, `.next/`,
recordings, design archives or unrelated source documents. Keep the lockfile; do
not upgrade packages or ask Replit Agent to rebuild/redesign the app.

Use Node >=22.13. Install with `npm ci` in Replit. The Run command is
`npm run dev:replit`. Publishing uses an Autoscale server deployment, not Static:
build `npm ci && npm run build`, run `npm run start:replit`, internal port 3000.
The `.replit` file supplies these settings. Review any hosting cost before publishing.

On the Mac, continue using `node scripts/env.mjs` with the existing local commands.
Do not run the hosted commands locally or change the environment wrapper.

## Secrets and configuration

Set these in Replit's workspace and published-app environment. Never put actual
values in source files or chat:

- `MONGODB_URI`: Atlas driver connection string with database-user credentials.
- `ASTRA_DB_NAME`: `astra` (or a separate `astra_`-prefixed database).
- `SPOTIFY_CLIENT_ID`: existing Spotify application client ID.
- `SPOTIFY_REDIRECT_URI`: `https://YOUR-PUBLISHED-HOST/api/integrations/spotify/callback`.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: existing Google OAuth web client.
- `GOOGLE_REDIRECT_URI`: `https://YOUR-PUBLISHED-HOST/api/integrations/youtube/callback`.
- `YOUTUBE_API_KEY`: existing server-side YouTube Data API key.
- `SPOTIFY_TOKEN_ENCRYPTION_KEY`: stable 64-character hexadecimal key (32 random
  bytes), used for both providers. Generate securely; keep the same value across
  redeployments. Do not include the Mac's `.environment/` to transfer it. A future
  migration of existing encrypted tokens would require preserving their key.

The current Spotify flow uses PKCE and does not read `SPOTIFY_CLIENT_SECRET`.
AStra also does not read Replit's `SESSION_SECRET`; it stores random sessions in
MongoDB. Do not enable `ASTRA_TEST_ACCOUNTS` on Replit. Hosted scripts retain
`ASTRA_DEMO=1` for existing simulated link points, not shared account access.

## Atlas and provider access

Give the Atlas database user read/write access only to the chosen application
database. Configure Atlas network access for the deployment's outbound addresses.
Do not assume allowing your Mac's IP also permits Replit, and do not expose the
local unauthenticated MongoDB server. Review network access before publishing.

Register the exact published HTTPS callback URLs in Spotify and Google's developer
consoles. Preserve local callback entries. If provider apps are in testing mode,
test users still need provider approval. Replit workspace preview has a different
hostname from publishing; a callback for one does not automatically cover the other.

## Verification before sharing

Local regression checks do not verify Atlas credentials, Replit networking or
actual provider consent. After publishing, test audience and creator signup,
logout/login, private-route protection, publishing to feed, collaboration privacy,
simulated checkout with capped points, and both provider connections. Verify that
data survives a redeploy. Do not send tokens, connection strings or callback URLs
containing authorization codes when reporting errors.

References:
- https://docs.replit.com/features/project-setup/configuration
- https://docs.replit.com/features/project-setup/ports
- https://docs.replit.com/core-concepts/project-editor/app-setup/secrets
- https://www.mongodb.com/docs/atlas/driver-connection/
