import assert from "node:assert/strict";
import { db, read, transaction, getSession } from "../src/lib/store";
import { mutate, snapshot } from "../src/lib/model";
import {
  startSpotify,
  finishSpotify,
  readRecentSpotify,
  disconnectSpotify,
  connectionStatus,
} from "../src/lib/spotify-store";
import { digest, nonce } from "../src/lib/spotify";
process.env.ASTRA_DB_NAME = "astra_spotify_test_" + Date.now();
process.env.SPOTIFY_CLIENT_ID = "mock-client";
process.env.SPOTIFY_REDIRECT_URI =
  "http://127.0.0.1:3000/api/integrations/spotify/callback";
process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY = "12".repeat(32);
process.env.ASTRA_DEMO = "1";
let checks = 0,
  requests = 0;
const pass = (label: string) => {
  checks++;
  console.log("PASS " + label);
};
const mockFetch = (identity: string) =>
  (async (url: string | URL | Request, init?: RequestInit) => {
    requests++;
    if (String(url) === "https://accounts.spotify.com/api/token") {
      assert.equal(init?.method, "POST");
      return Response.json({
        access_token: "mock-access-private",
        refresh_token: "mock-refresh-private",
        expires_in: 3600,
        token_type: "Bearer",
        scope: "user-read-recently-played",
      });
    }
    if (String(url) === "https://api.spotify.com/v1/me")
      return Response.json({
        id: identity,
        display_name: "OAuth test account",
      });
    if (
      String(url) ===
      "https://api.spotify.com/v1/me/player/recently-played?limit=20"
    )
      return Response.json({
        items: [
          {
            played_at: "2026-09-27T12:00:00Z",
            track: {
              id: "A".repeat(22),
              name: "Test track",
              album: { name: "Test album" },
              artists: [{ name: "Test artist" }],
            },
          },
        ],
      });
    throw new Error("Unexpected mock endpoint");
  }) as typeof fetch;
const begin = async (role = "audience", expectedUser?: string) => {
  const started = await startSpotify(role, expectedUser);
  return {
    state: new URL(started.url).searchParams.get("state")!,
    browser: started.browser,
    code: "mock-code",
    denied: false,
  };
};
try {
  const { database } = await db();
  const start = await begin();
  await assert.rejects(
    finishSpotify({ ...start, browser: nonce() }, mockFetch("audience")),
  );
  assert.equal(requests, 0);
  const audience = await finishSpotify(start, mockFetch("audience"));
  assert.equal((await getSession(audience.token))?.user, audience.session.user);
  assert.equal(audience.session.view, "audience");
  assert.equal(
    (await read()).users.find((u) => u.id === audience.session.user)?.balance,
    0,
  );
  pass(
    "OAuth browser binding; successful mocked audience consent creates private zero-point account",
  );
  await assert.rejects(finishSpotify(start, mockFetch("audience")));
  pass("Consumed OAuth state cannot be replayed");
  const creator = await finishSpotify(
    await begin("creator"),
    mockFetch("creator"),
  );
  assert.equal(creator.session.view, "creator");
  const returning = await finishSpotify(
    await begin("creator"),
    mockFetch("creator"),
  );
  assert.equal(returning.session.user, creator.session.user);
  pass("Creator connection works and repeat sign-in keeps the same account");
  const privateDoc = await database
    .collection("spotify_connections")
    .findOne({ _id: audience.session.user as never });
  assert.ok(privateDoc);
  assert.ok(!JSON.stringify(privateDoc).includes("mock-access-private"));
  assert.ok(!JSON.stringify(privateDoc).includes("mock-refresh-private"));
  assert.ok(
    !JSON.stringify(snapshot(await read(), audience.session)).includes(
      "mock-access-private",
    ),
  );
  pass("Tokens are encrypted in MongoDB and absent from account snapshots");
  const cancelled = await begin();
  const beforeCancel = requests;
  await assert.rejects(
    finishSpotify({ ...cancelled, denied: true }, mockFetch("cancelled")),
    /cancelled/,
  );
  assert.equal(requests, beforeCancel);
  const expired = await begin();
  await database
    .collection("spotify_oauth")
    .updateOne(
      { _id: digest(expired.state) as never },
      { $set: { expires: new Date(0) } },
    );
  await assert.rejects(finishSpotify(expired, mockFetch("expired")));
  pass("Denied and expired authorizations cannot create a connection");
  const bound = await begin("audience", audience.session.user);
  await assert.rejects(
    finishSpotify(
      { ...bound, currentUser: creator.session.user },
      mockFetch("audience"),
    ),
    /session changed/,
  );
  const mismatch = await begin("audience", audience.session.user);
  await assert.rejects(
    finishSpotify(
      { ...mismatch, currentUser: audience.session.user },
      mockFetch("other-user"),
    ),
    /does not match/,
  );
  pass(
    "Session switching and a different Spotify identity cannot replace a private account",
  );
  const before = await read();
  const tracks = await readRecentSpotify(
    audience.session.user,
    mockFetch("audience"),
  );
  assert.equal(tracks.length, 1);
  assert.deepEqual((await read()).ledger, before.ledger);
  assert.deepEqual((await read()).users, before.users);
  pass("Recent listening returns sanitized tracks and never awards points");
  await database
    .collection("spotify_connections")
    .updateOne(
      { _id: audience.session.user as never },
      { $set: { expires: 0 } },
    );
  assert.equal(
    (await readRecentSpotify(audience.session.user, mockFetch("audience")))
      .length,
    1,
  );
  pass("Expired access tokens are renewed with mocked refresh tokens");
  await disconnectSpotify(audience.session.user);
  assert.equal(await connectionStatus(audience.session.user), false);
  await assert.rejects(
    readRecentSpotify(audience.session.user, mockFetch("audience")),
    /Connect Spotify first/,
  );
  assert.equal(await connectionStatus(creator.session.user), true);
  pass(
    "Disconnect removes only the caller's stored tokens and prevents future reads",
  );
  await transaction((s) =>
    mutate(s, { user: "mira", view: "creator" }, "campaign", {
      title: "Concurrent demo clicks",
      rule: "Simulation only",
      demo: true,
      link: `https://open.spotify.com/album/${"B".repeat(22)}`,
      demoPoints: 10,
    }),
  );
  const campaign = (await read()).campaigns.find(
    (c) => c.title === "Concurrent demo clicks",
  )!;
  const balance = (await read()).users.find((u) => u.id === "alex")!.balance;
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      transaction((s) =>
        mutate(s, { user: "alex", view: "audience" }, "demo-link-open", {
          id: campaign.id,
        }),
      ),
    ),
  );
  assert.equal(
    results.filter((r) => (r as { awarded: number }).awarded === 10).length,
    1,
  );
  const after = await read();
  assert.equal(after.users.find((u) => u.id === "alex")!.balance, balance + 10);
  assert.equal(
    after.ledger.filter((l) => l.demoCampaign === campaign.id).length,
    1,
  );
  pass("Five simultaneous demo click requests credit exactly once in MongoDB");
  console.log(
    `${checks} Spotify/mock-provider and MongoDB checks passed. No live user tokens used. Test database retained: ${database.databaseName}`,
  );
} finally {
  const { client } = await db();
  await client.close();
}
