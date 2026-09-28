import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { TokenPayload } from "google-auth-library";
import { youtubeContent } from "../src/lib/youtube-content";
import {
  youtubeConfig,
  youtubeAuthorizationUrl,
  validateGoogleClaims,
  exchangeYouTubeCode,
  youtubeScope,
  youtubeChannels,
  youtubeVideo,
  revokeGoogle,
} from "../src/lib/youtube";
import { privateIdentity } from "../src/lib/private-identity";
import { seed, snapshot, register, mutate } from "../src/lib/model";
process.env.GOOGLE_CLIENT_ID = "test-client";
process.env.GOOGLE_CLIENT_SECRET = "test-secret";
process.env.GOOGLE_REDIRECT_URI =
  "http://127.0.0.1:3000/api/integrations/youtube/callback";
process.env.YOUTUBE_API_KEY = "test-api-key";
const mock = (data: unknown, status = 200) =>
  (async () => Response.json(data, { status })) as typeof fetch;
test("YouTube URL canonicalization accepts watch, Shorts, mobile and short links only", () => {
  for (const link of [
    "https://youtu.be/abcdefghijk?si=tracking",
    "https://www.youtube.com/shorts/abcdefghijk",
    "https://m.youtube.com/watch?v=abcdefghijk&t=10",
  ])
    assert.equal(
      youtubeContent(link)?.url,
      "https://www.youtube.com/watch?v=abcdefghijk",
    );
  for (const link of [
    "javascript:alert(1)",
    "https://youtube.com.evil.test/watch?v=abcdefghijk",
    "https://youtube.com@evil.test/watch?v=abcdefghijk",
    "https://youtube.com:444/watch?v=abcdefghijk",
    "http://youtu.be/abcdefghijk",
    "https://youtube.com/playlist?list=abc",
    "https://youtube.com/embed/abcdefghijk",
    "https://youtu.be/short",
    "<iframe>",
  ])
    assert.equal(youtubeContent(link), null);
});
test("Google authorization has state, nonce, PKCE, read-only scope and no secret", () => {
  const u = new URL(youtubeAuthorizationUrl("state", "verifier", "nonce"));
  assert.equal(u.origin, "https://accounts.google.com");
  assert.equal(
    u.searchParams.get("redirect_uri"),
    process.env.GOOGLE_REDIRECT_URI,
  );
  assert.equal(u.searchParams.get("state"), "state");
  assert.equal(u.searchParams.get("nonce"), "nonce");
  assert.equal(
    u.searchParams.get("code_challenge"),
    createHash("sha256").update("verifier").digest("base64url"),
  );
  assert.equal(u.searchParams.get("scope"), `openid profile ${youtubeScope}`);
  assert.ok(!u.href.includes("test-secret"));
});
test("Google callback rejects insecure hosts, embedded credentials and redirect injection", () => {
  const old = process.env.GOOGLE_REDIRECT_URI;
  try {
    for (const url of [
      "bad",
      "http://evil.test/api/integrations/youtube/callback",
      "https://a:b@x.test/api/integrations/youtube/callback",
      "https://x.test/other",
      old + "?returnTo=evil",
      old + "#evil",
    ]) {
      process.env.GOOGLE_REDIRECT_URI = url;
      assert.throws(youtubeConfig);
    }
  } finally {
    process.env.GOOGLE_REDIRECT_URI = old;
  }
});
test("Google claims must match issuer, client, expiry and this exact attempt nonce", () => {
  const good = {
    iss: "https://accounts.google.com",
    aud: "test-client",
    exp: Date.now() / 1000 + 60,
    iat: Date.now() / 1000,
    sub: "user",
    nonce: "nonce",
  };
  validateGoogleClaims(good, "nonce");
  for (const patch of [
    { iss: "https://evil.test" },
    { aud: "other-client" },
    { exp: 1 },
    { sub: "" },
    { nonce: "replay" },
  ])
    assert.throws(() =>
      validateGoogleClaims({ ...good, ...patch } as TokenPayload, "nonce"),
    );
});
for (const role of ["audience", "creator", "both"])
  test(`Google ${role} identity is private, zero-point and non-escalating`, () => {
    const s = seed();
    const before = structuredClone(s.users);
    const session = privateIdentity(s, "google", "google-id", "Member", role);
    const u = s.users.find((u) => u.id === session.user)!;
    assert.equal(u.authProvider, "google");
    assert.equal(u.balance, 0);
    assert.equal(u.pending, 0);
    assert.deepEqual(s.users.slice(0, before.length), before);
    assert.deepEqual(
      u.roles,
      role === "both" ? ["audience", "creator"] : [role],
    );
    assert.ok(
      !JSON.stringify(snapshot(s, session)).includes(u.googleSubjectHash!),
    );
    privateIdentity(s, "google", "google-id", "Member", "both");
    assert.deepEqual(
      u.roles,
      role === "both" ? ["audience", "creator"] : [role],
    );
    assert.throws(() =>
      privateIdentity(s, "google", "google-id", "Member", "admin"),
    );
  });
test("explicit cross-provider linking keeps the account and rejects merging, replacement and demo linking", () => {
  const s = seed();
  const a = privateIdentity(s, "spotify", "spotify-one", "One", "both");
  s.users.find((u) => u.id === a.user)!.balance = 456;
  const linked = privateIdentity(
    s,
    "google",
    "google-one",
    "One",
    "audience",
    a.user,
  );
  assert.equal(linked.user, a.user);
  assert.equal(s.users.find((u) => u.id === a.user)!.balance, 456);
  assert.equal(
    privateIdentity(s, "google", "google-one", "One", "audience").user,
    a.user,
  );
  const b = privateIdentity(s, "google", "google-two", "Two", "audience");
  assert.throws(() =>
    privateIdentity(s, "google", "google-two", "Two", "audience", a.user),
  );
  assert.throws(() =>
    privateIdentity(s, "google", "google-three", "Three", "audience", a.user),
  );
  assert.throws(() =>
    privateIdentity(s, "google", "new", "New", "audience", "alex"),
  );
  assert.equal(
    privateIdentity(s, "spotify", "spotify-two", "Two", "creator", b.user).user,
    b.user,
  );
  assert.deepEqual(s.users.find((u) => u.id === b.user)!.roles, ["audience"]);
});
test("sample registration cannot inherit either provider identity", () => {
  const s = seed();
  Object.assign(s.users[0], {
    authProvider: "google",
    googleSubjectHash: "secret-id",
    spotifySubjectHash: "other-id",
  });
  const session = register(s, {
    name: "Sample",
    role: "audience",
    authProvider: "google",
    googleSubjectHash: "injected",
  });
  const u = s.users.find((u) => u.id === session.user)!;
  assert.equal(u.authProvider, undefined);
  assert.equal(u.googleSubjectHash, undefined);
  assert.equal(u.spotifySubjectHash, undefined);
});
test("Google token exchange sends verifier and server secret, never echoes upstream errors", async () => {
  await exchangeYouTubeCode("code", "verifier", (async (url, init) => {
    assert.equal(url, "https://oauth2.googleapis.com/token");
    const p = init?.body as URLSearchParams;
    assert.equal(p.get("code_verifier"), "verifier");
    assert.equal(p.get("client_secret"), "test-secret");
    return Response.json({
      access_token: "access",
      expires_in: 3600,
      token_type: "Bearer",
    });
  }) as typeof fetch);
  for (const status of [400, 401, 403, 429, 500])
    await assert.rejects(
      exchangeYouTubeCode(
        "code",
        "verifier",
        mock({ error: "secret-upstream-body" }, status),
      ),
      (e) => e instanceof Error && !e.message.includes("secret-upstream-body"),
    );
  await assert.rejects(
    exchangeYouTubeCode(
      "code",
      "verifier",
      mock({ access_token: "access", expires_in: -1, token_type: "Bearer" }),
    ),
  );
});
test("channel reads allow no channel and expose only safe title and canonical link", async () => {
  assert.deepEqual(await youtubeChannels("token", mock({ items: [] })), []);
  const channels = await youtubeChannels(
    "token",
    mock({
      items: [
        null,
        {},
        {
          id: "UC" + "a".repeat(22),
          snippet: { title: "Channel", description: "private" },
        },
        { id: "javascript:alert(1)", snippet: { title: "bad" } },
      ],
    }),
  );
  assert.equal(channels.length, 1);
  assert.equal(
    channels[0].url,
    "https://www.youtube.com/channel/UC" + "a".repeat(22),
  );
  assert.ok(!JSON.stringify(channels).includes("private"));
});
test("public video metadata uses server-only API key and disables restricted or unknown embeds", async () => {
  const url = "https://youtu.be/abcdefghijk";
  for (const status of [
    { privacyStatus: "public", embeddable: true, madeForKids: false },
    { privacyStatus: "public", embeddable: false, madeForKids: false },
    { privacyStatus: "public", embeddable: true, madeForKids: true },
    { privacyStatus: "public", embeddable: true },
  ]) {
    const result = await youtubeVideo(url, (async (request, init) => {
      assert.ok(!String(request).includes("test-api-key"));
      assert.equal(
        (init?.headers as Record<string, string>)["X-Goog-Api-Key"],
        "test-api-key",
      );
      return Response.json({
        items: [
          {
            id: "abcdefghijk",
            snippet: { title: "Video", channelTitle: "Creator" },
            status,
          },
        ],
      });
    }) as typeof fetch);
    assert.equal(
      result.embeddable,
      status.embeddable && status.madeForKids === false,
    );
    assert.ok(!JSON.stringify(result).includes("test-api-key"));
  }
  await assert.rejects(youtubeVideo(url, mock({ items: [] })), /unavailable/);
  await assert.rejects(
    youtubeVideo(
      url,
      mock({
        items: [{ id: "abcdefghijk", status: { privacyStatus: "private" } }],
      }),
    ),
    /private/,
  );
  await assert.rejects(youtubeVideo("https://evil.test", mock({})), /link/);
});
test("provider revocation failure is explicit and does not expose credentials", async () => {
  assert.equal(
    await revokeGoogle(
      "token",
      (async () => new Response(null, { status: 200 })) as typeof fetch,
    ),
    true,
  );
  assert.equal(await revokeGoogle("token", mock({}, 500)), false);
});
test("YouTube feed and loyalty deduplicate demo awards and never credit from rendering", () => {
  const old = process.env.ASTRA_DEMO;
  process.env.ASTRA_DEMO = "1";
  try {
    const s = seed(),
      creator = { user: "mira", view: "creator" as const },
      fan = { user: "alex", view: "audience" as const };
    mutate(s, creator, "campaign", {
      demo: true,
      title: "New video",
      rule: "Simulation",
      link: "https://youtu.be/abcdefghijk",
      demoPoints: 2,
    });
    const before = s.users[0].balance,
      campaign = s.campaigns[0];
    const p = snapshot(s, fan).posts.find(
      (p) => p.demoCampaignId === campaign.id,
    )!;
    assert.equal(p.youtubeUrl, "https://www.youtube.com/watch?v=abcdefghijk");
    assert.equal(p.spotifyUrl, undefined);
    assert.equal(s.users[0].balance, before);
    assert.throws(() =>
      mutate(s, creator, "demo-link-open", { id: campaign.id }),
    );
    assert.deepEqual(mutate(s, fan, "demo-link-open", { id: campaign.id }), {
      url: p.youtubeUrl,
      awarded: 2,
    });
    assert.deepEqual(mutate(s, fan, "demo-link-open", { id: campaign.id }), {
      url: p.youtubeUrl,
      awarded: 0,
    });
    assert.equal(s.users[0].balance, before + 2);
    process.env.ASTRA_DEMO = "0";
    assert.ok(!snapshot(s, fan).posts.some((p) => p.youtubeUrl));
  } finally {
    if (old === undefined) delete process.env.ASTRA_DEMO;
    else process.env.ASTRA_DEMO = old;
  }
});
