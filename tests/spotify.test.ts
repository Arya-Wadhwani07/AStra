import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  seal,
  unseal,
  authorizationUrl,
  spotifyConfig,
  spotifyIdentity,
  exchangeCode,
  spotifyGet,
  recentTracks,
} from "../src/lib/spotify";
import { seed, snapshot, register } from "../src/lib/model";

process.env.SPOTIFY_CLIENT_ID = "unit-test-client";
process.env.SPOTIFY_REDIRECT_URI =
  "http://127.0.0.1:3000/api/integrations/spotify/callback";
test("Spotify authorization uses PKCE, explicit scope and the exact callback", () => {
  const url = new URL(authorizationUrl("test-state", "verifier"));
  assert.equal(url.origin, "https://accounts.spotify.com");
  assert.equal(url.searchParams.get("state"), "test-state");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    process.env.SPOTIFY_REDIRECT_URI,
  );
  assert.equal(
    url.searchParams.get("code_challenge"),
    createHash("sha256").update("verifier").digest("base64url"),
  );
  assert.equal(url.searchParams.get("scope"), "user-read-recently-played");
  assert.equal(url.searchParams.has("client_secret"), false);
});
test("invalid callback schemes, localhost, credentials and query strings fail closed", () => {
  const original = process.env.SPOTIFY_REDIRECT_URI;
  try {
    for (const uri of [
      "http://localhost:3000/api/integrations/spotify/callback",
      "http://external.example/api/integrations/spotify/callback",
      "https://user:pass@example.com/api/integrations/spotify/callback",
      "https://example.com/wrong",
      "https://example.com/api/integrations/spotify/callback?returnTo=evil",
      "bad",
    ]) {
      process.env.SPOTIFY_REDIRECT_URI = uri;
      assert.throws(spotifyConfig);
    }
  } finally {
    process.env.SPOTIFY_REDIRECT_URI = original;
  }
});
test("tokens are encrypted, owner-bound and tamper-evident", () => {
  const key = Buffer.alloc(32, 8);
  const token = seal("private-test-token", "alice", key);
  assert.ok(!token.includes("private-test-token"));
  assert.equal(unseal(token, "alice", key), "private-test-token");
  assert.throws(() => unseal(token, "bob", key));
  assert.throws(() => unseal(token, "alice", Buffer.alloc(32, 9)));
  const parts = token.split(".");
  parts[2] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => unseal(parts.join("."), "alice", key));
});
for (const role of ["audience", "creator", "both"])
  test(`${role}: Spotify creates a private zero-point account, separate from samples`, () => {
    const state = seed();
    const old = structuredClone(state.users);
    const session = spotifyIdentity(
      state,
      { id: "real-spotify-id", display_name: "Private member" },
      role,
    );
    const user = state.users.find((u) => u.id === session.user)!;
    assert.equal(user.authProvider, "spotify");
    assert.equal(user.balance, 0);
    assert.equal(user.pending, 0);
    assert.equal(user.verification, "not submitted");
    assert.deepEqual(
      user.roles,
      role === "both" ? ["audience", "creator"] : [role],
    );
    assert.deepEqual(state.users.slice(0, old.length), old);
    assert.ok(
      !JSON.stringify(snapshot(state, session)).includes(
        user.spotifySubjectHash!,
      ),
    );
  });
test("repeat OAuth sign-in returns the same account without granting creator or admin roles", () => {
  const state = seed();
  const first = spotifyIdentity(state, { id: "repeat" }, "audience");
  assert.deepEqual(spotifyIdentity(state, { id: "repeat" }, "creator"), first);
  assert.throws(() => spotifyIdentity(state, { id: "repeat" }, "admin"));
});
test("connecting another Spotify identity cannot replace a signed-in private identity", () => {
  const state = seed();
  const session = spotifyIdentity(state, { id: "alice" }, "both");
  assert.throws(
    () => spotifyIdentity(state, { id: "bob" }, "both", session.user),
    /does not match/,
  );
});
test("sample registration cannot inherit or inject Spotify authentication", () => {
  const state = seed();
  state.users[0].authProvider = "spotify";
  state.users[0].spotifySubjectHash = "private-hash";
  const session = register(state, {
    name: "Sample",
    role: "audience",
    authProvider: "spotify",
  });
  const user = state.users.find((u) => u.id === session.user)!;
  assert.equal(user.authProvider, undefined);
  assert.equal(user.spotifySubjectHash, undefined);
});
test("token exchange sends the code verifier and never returns provider errors verbatim", async () => {
  let called = false;
  const tokens = await exchangeCode("code", "verifier", (async (url, init) => {
    called = true;
    assert.equal(url, "https://accounts.spotify.com/api/token");
    const body = init!.body as URLSearchParams;
    assert.equal(body.get("code_verifier"), "verifier");
    return Response.json({
      access_token: "test",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "user-read-recently-played",
    });
  }) as typeof fetch);
  assert.ok(called);
  assert.equal(tokens.access, "test");
  await assert.rejects(
    exchangeCode("code", "verifier", (async () =>
      Response.json(
        { error: "SECRET_TEST_VALUE" },
        { status: 400 },
      )) as typeof fetch),
    (error) =>
      error instanceof Error && !error.message.includes("SECRET_TEST_VALUE"),
  );
});
test("Spotify API failures remain explicit, and rate limits do not become fake data", async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(
      spotifyGet(
        "/me",
        "test",
        (async () =>
          new Response("private upstream body", { status })) as typeof fetch,
      ),
      (error) =>
        error instanceof Error &&
        !error.message.includes("private upstream body"),
    );
});
test("recent track results omit tokens, arbitrary URLs and malformed entries", () => {
  const items = recentTracks({
    access_token: "private",
    items: [
      {
        played_at: "2026-09-27T10:00:00Z",
        track: {
          id: "A".repeat(22),
          name: "A track",
          album: { name: "An album" },
          artists: [{ name: "Artist" }],
          external_urls: { spotify: "javascript:alert(1)" },
        },
      },
      null,
      {},
    ],
  });
  assert.equal(items.length, 1);
  assert.equal(
    items[0].url,
    `https://open.spotify.com/track/${"A".repeat(22)}`,
  );
  assert.ok(!JSON.stringify(items).includes("private"));
  assert.throws(() => recentTracks({ items: "invalid" }));
});
