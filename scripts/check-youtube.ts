import assert from "node:assert/strict";
import { db, read, transaction, getSession } from "../src/lib/store";
import { snapshot, mutate } from "../src/lib/model";
import { privateIdentity } from "../src/lib/private-identity";
import {
  startYouTube,
  finishYouTube,
  youtubeStatus,
  readYouTubeChannels,
  disconnectYouTube,
} from "../src/lib/youtube-store";
import { youtubeScope } from "../src/lib/youtube";
import { nonce, digest } from "../src/lib/spotify";
process.env.ASTRA_DB_NAME = "astra_youtube_test_" + Date.now();
process.env.GOOGLE_CLIENT_ID = "mock-client";
process.env.GOOGLE_CLIENT_SECRET = "mock-secret";
process.env.GOOGLE_REDIRECT_URI =
  "http://127.0.0.1:3000/api/integrations/youtube/callback";
process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY = "12".repeat(32);
process.env.ASTRA_DEMO = "1";
let calls = 0,
  checks = 0;
const pass = (s: string) => {
  checks++;
  console.log("PASS " + s);
};
const fakeFetch = (async (url: string | URL | Request) => {
  calls++;
  if (String(url) === "https://oauth2.googleapis.com/token")
    return Response.json({
      access_token: "private-mock-access",
      refresh_token: "private-mock-refresh",
      id_token: "mock-id-token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: `openid profile ${youtubeScope}`,
    });
  if (String(url).startsWith("https://www.googleapis.com/youtube/v3/channels?"))
    return Response.json({ items: [] });
  if (String(url) === "https://oauth2.googleapis.com/revoke")
    return new Response(null, { status: 200 });
  throw new Error("Unexpected mock endpoint");
}) as typeof fetch;
async function begin(role = "audience", expectedUser?: string) {
  const start = await startYouTube(role, expectedUser),
    u = new URL(start.url);
  return {
    state: u.searchParams.get("state")!,
    browser: start.browser,
    code: "mock-code",
    denied: false,
    oidcNonce: u.searchParams.get("nonce")!,
  };
}
// Signature verification is the Google library's responsibility. This mock isolates
// our persistence/state tests; production routes never accept a supplied verifier.
const identity = (subject: string, oidcNonce: string) => async () => ({
  iss: "https://accounts.google.com",
  aud: "mock-client",
  sub: subject,
  name: "Mock Google member",
  exp: Date.now() / 1000 + 3600,
  iat: Date.now() / 1000,
  nonce: oidcNonce,
});
try {
  const { database } = await db();
  const start = await begin();
  await assert.rejects(
    finishYouTube(
      { ...start, browser: nonce() },
      fakeFetch,
      identity("fan", start.oidcNonce),
    ),
  );
  assert.equal(calls, 0);
  const fan = await finishYouTube(
    start,
    fakeFetch,
    identity("fan", start.oidcNonce),
  );
  assert.equal((await getSession(fan.token))?.user, fan.session.user);
  assert.equal(fan.session.view, "audience");
  assert.equal(
    (await read()).users.find((u) => u.id === fan.session.user)?.balance,
    0,
  );
  await assert.rejects(
    finishYouTube(start, fakeFetch, identity("fan", start.oidcNonce)),
  );
  pass(
    "Audience OAuth creates a private account; browser mismatch and callback replay are rejected",
  );
  const c = await begin("creator"),
    creator = await finishYouTube(
      c,
      fakeFetch,
      identity("creator", c.oidcNonce),
    );
  assert.equal(creator.session.view, "creator");
  const repeat = await begin("both"),
    returning = await finishYouTube(
      repeat,
      fakeFetch,
      identity("fan", repeat.oidcNonce),
    );
  assert.equal(returning.session.user, fan.session.user);
  assert.equal(returning.session.view, "audience");
  pass("Creator connection and returning audience sign-in preserve roles");
  const stored = await database
    .collection("youtube_connections")
    .findOne({ _id: fan.session.user as never });
  assert.ok(stored);
  assert.ok(!JSON.stringify(stored).includes("private-mock"));
  assert.ok(
    !JSON.stringify(snapshot(await read(), fan.session)).includes(
      "googleSubjectHash",
    ),
  );
  pass(
    "Tokens are encrypted and private identity hashes stay out of snapshots",
  );
  const cancel = await begin(),
    beforeCancel = calls;
  await assert.rejects(
    finishYouTube(
      { ...cancel, denied: true },
      fakeFetch,
      identity("cancel", cancel.oidcNonce),
    ),
    /cancelled/,
  );
  assert.equal(calls, beforeCancel);
  const expired = await begin();
  await database
    .collection("youtube_oauth")
    .updateOne(
      { _id: digest(expired.state) as never },
      { $set: { expires: new Date(0) } },
    );
  await assert.rejects(
    finishYouTube(expired, fakeFetch, identity("expired", expired.oidcNonce)),
  );
  const badNonce = await begin();
  await assert.rejects(
    finishYouTube(badNonce, fakeFetch, identity("bad", "wrong")),
    /verified/,
  );
  const deniedSignature = await begin();
  await assert.rejects(
    finishYouTube(deniedSignature, fakeFetch, async () => {
      throw new Error("Invalid signature");
    }),
  );
  const missingScope = await begin();
  await assert.rejects(
    finishYouTube(
      missingScope,
      (async () =>
        Response.json({
          access_token: "x",
          expires_in: 3600,
          token_type: "Bearer",
          scope: "openid",
          id_token: "test",
        })) as typeof fetch,
      identity("scope", missingScope.oidcNonce),
    ),
    /permission/,
  );
  pass(
    "Cancellation, expiry, nonce/signature failures and missing permission cannot connect",
  );
  const bound = await begin("audience", fan.session.user);
  await assert.rejects(
    finishYouTube(
      { ...bound, currentUser: creator.session.user },
      fakeFetch,
      identity("fan", bound.oidcNonce),
    ),
    /session changed/,
  );
  const mismatch = await begin("audience", fan.session.user);
  await assert.rejects(
    finishYouTube(
      { ...mismatch, currentUser: fan.session.user },
      fakeFetch,
      identity("different", mismatch.oidcNonce),
    ),
    /does not match/,
  );
  pass(
    "Changed session and different Google identity cannot overwrite a connection",
  );
  const spotify = await transaction((s) =>
    privateIdentity(s, "spotify", "spotify", "Spotify member", "both"),
  );
  const linking = await begin("audience", spotify.user);
  const linked = await finishYouTube(
    { ...linking, currentUser: spotify.user },
    fakeFetch,
    identity("linked", linking.oidcNonce),
  );
  assert.equal(linked.session.user, spotify.user);
  const conflict = await begin("audience", spotify.user);
  await assert.rejects(
    finishYouTube(
      { ...conflict, currentUser: spotify.user },
      fakeFetch,
      identity("fan", conflict.oidcNonce),
    ),
    /does not match/,
  );
  pass(
    "Explicit Spotify/Google linking keeps one identity; separate accounts cannot be silently merged",
  );
  const before = await read();
  assert.deepEqual(await readYouTubeChannels(fan.session.user, fakeFetch), []);
  assert.deepEqual((await read()).users, before.users);
  assert.deepEqual((await read()).ledger, before.ledger);
  await database
    .collection("youtube_connections")
    .updateOne({ _id: fan.session.user as never }, { $set: { expires: 0 } });
  assert.deepEqual(await readYouTubeChannels(fan.session.user, fakeFetch), []);
  pass(
    "No-channel accounts work; refresh and channel reads never award points",
  );
  assert.equal(
    (await disconnectYouTube(fan.session.user, fakeFetch)).revoked,
    true,
  );
  assert.equal(await youtubeStatus(fan.session.user), false);
  assert.equal(await youtubeStatus(creator.session.user), true);
  await assert.rejects(
    readYouTubeChannels(fan.session.user, fakeFetch),
    /Connect YouTube first/,
  );
  assert.equal(
    (
      await disconnectYouTube(
        creator.session.user,
        (async () => new Response(null, { status: 500 })) as typeof fetch,
      )
    ).revoked,
    false,
  );
  assert.equal(await youtubeStatus(creator.session.user), false);
  pass(
    "Disconnect deletes only caller tokens, revokes Google, and stays deleted if Google is unavailable",
  );
  await transaction((s) =>
    mutate(s, { user: "mira", view: "creator" }, "campaign", {
      demo: true,
      title: "Concurrent YouTube",
      rule: "Simulation",
      link: "https://youtu.be/abcdefghijk",
      demoPoints: 2,
    }),
  );
  const campaign = (await read()).campaigns.find(
    (c) => c.title === "Concurrent YouTube",
  )!;
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
    results.filter((r) => (r as { awarded: number }).awarded === 2).length,
    1,
  );
  assert.equal(
    (await read()).ledger.filter((l) => l.demoCampaign === campaign.id).length,
    1,
  );
  pass("Five simultaneous YouTube demo requests credit only once");
  console.log(
    `${checks} YouTube mock-provider/MongoDB groups passed. No live user consent or tokens used. Test data retained: ${database.databaseName}`,
  );
} finally {
  const { client } = await db();
  await client.close();
}
