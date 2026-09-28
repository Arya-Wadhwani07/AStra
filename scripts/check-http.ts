import assert from "node:assert/strict";
const base = "http://127.0.0.1:3001";
let checks = 0;
async function request(
  action: string,
  data: Record<string, unknown>,
  cookie = "",
) {
  const response = await fetch(base + "/api/app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      Cookie: cookie,
    },
    body: JSON.stringify({ action, data }),
  });
  return {
    status: response.status,
    cookie: response.headers.get("set-cookie")?.split(";")[0] || cookie,
    body: await response.json(),
  };
}
function pass(label: string) {
  checks++;
  console.log("PASS " + label);
}
const publicResponse = await fetch(base + "/api/app");
assert.equal(publicResponse.status, 401);
const publicState = await publicResponse.json();
assert.equal("opportunities" in publicState, false);
assert.deepEqual(Object.keys(publicState), ["error"]);
pass("Anonymous API access returns only an authentication error");
const privateAccount = await request("signup", {
  name: "HTTP private user",
  email: `http-${Date.now()}@example.test`,
  password: "HTTP private passphrase!",
  role: "both",
});
assert.equal(privateAccount.status, 200);
assert.equal(privateAccount.body.state.me.balance, 0);
assert.equal(privateAccount.body.state.me.authProvider, "password");
assert.ok(!JSON.stringify(privateAccount.body).includes("passwordHash"));
pass(
  "AStra password signup creates an individual zero-point account without exposing credentials",
);
const fan = await request("login", { account: "alex" });
assert.equal(fan.status, 200);
assert.ok(fan.cookie.startsWith("astra-session="));
pass("Sample sign-in establishes a cookie session");
const originalBalance = fan.body.state.me.balance;
const originalPending = fan.body.state.me.pending;
const originalLedger = fan.body.state.ledger;
for (const provider of [
  "spotify",
  "youtube",
  "youtube-music",
  "amazon-music",
]) {
  for (let retry = 0; retry < 2; retry++) {
    const claimed = await request(
      "claim-external-reward",
      {
        provider,
        verified: true,
        completed: true,
        count: 10,
        points: 1000,
        eventId: "same-event",
        user: "mira",
      },
      fan.cookie,
    );
    assert.equal(claimed.status, 404);
  }
}
const afterClaims = await (
  await fetch(base + "/api/app", {
    headers: { Cookie: fan.cookie },
  })
).json();
assert.equal(afterClaims.me.balance, originalBalance);
assert.equal(afterClaims.me.pending, originalPending);
assert.deepEqual(afterClaims.ledger, originalLedger);
pass(
  "Forged external playback claims and retries cannot credit persisted points",
);
assert.equal(
  (
    await request("claim-external-reward", {
      provider: "spotify",
      verified: true,
      points: 1000,
    })
  ).status,
  401,
);
assert.equal(
  (
    await request(
      "campaign",
      {
        title: "Unauthorized",
        rule: "Ten listens",
        status: "active",
      },
      fan.cookie,
    )
  ).status,
  403,
);
pass(
  "External reward requests require authentication and campaign drafts require creator access",
);
const scope = await fetch(base + "/api/app?scope=creator", {
  headers: { Cookie: fan.cookie },
});
assert.equal(scope.status, 403);
assert.equal((await request("opportunity", {}, fan.cookie)).status, 403);
assert.equal(
  (await request("switch", { view: "admin" }, fan.cookie)).status,
  403,
);
pass("Server blocks private access and role escalation");
const csrf = await fetch(base + "/api/app", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://other.example",
    Cookie: fan.cookie,
  },
  body: JSON.stringify({ action: "favorite", data: { id: "mira" } }),
});
assert.equal(csrf.status, 403);
pass("Cross-origin writes are rejected");
assert.equal(
  (await request("login", { account: "admin", key: "wrong" })).status,
  403,
);
pass("Administrator cannot sign in without a provisioned key");
const creator = await request("login", { account: "mira" });
assert.equal(creator.status, 200);
assert.ok(creator.body.state.opportunities.length);
const demoTitle = `HTTP click simulation ${Date.now()}`;
const demo = await request(
  "campaign",
  {
    title: demoTitle,
    rule: "Demo request, not playback",
    demo: true,
    link: `https://open.spotify.com/album/${"C".repeat(22)}`,
    demoPoints: 10,
  },
  creator.cookie,
);
assert.equal(demo.status, 200);
const campaign = demo.body.state.campaigns.find(
  (c: { title: string }) => c.title === demoTitle,
);
assert.ok(campaign);
const publishedState = await (
  await fetch(base + "/api/app", { headers: { Cookie: fan.cookie } })
).json();
const spotifyPost = publishedState.posts.find(
  (p: { demoCampaignId?: string }) => p.demoCampaignId === campaign.id,
);
assert.ok(spotifyPost);
assert.equal(
  spotifyPost.spotifyUrl,
  `https://open.spotify.com/album/${"C".repeat(22)}`,
);
assert.equal(spotifyPost.title, demoTitle);
pass(
  "Published Spotify campaign becomes a feed post with the same reward identity",
);
const clickResults = await Promise.all(
  Array.from({ length: 4 }, () =>
    request("demo-link-open", { id: campaign.id, points: 999999 }, fan.cookie),
  ),
);
assert.ok(clickResults.every((r) => r.status === 200));
assert.equal(
  clickResults.filter((r) => r.body.result.awarded === 10).length,
  1,
);
const clickedState = await (
  await fetch(base + "/api/app", { headers: { Cookie: fan.cookie } })
).json();
assert.equal(clickedState.me.balance, originalBalance + 10);
assert.equal(
  clickedState.ledger.filter(
    (l: { demoCampaign?: string }) => l.demoCampaign === campaign.id,
  ).length,
  1,
);
pass(
  "Concurrent HTTP demo link requests credit only the server-defined amount once",
);
const spotifyStatus = await fetch(base + "/api/integrations/spotify");
assert.equal(spotifyStatus.status, 401);
for (const role of ["audience", "creator", "both"]) {
  const start = await fetch(base + "/api/integrations/spotify", {
    method: "POST",
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      Cookie: privateAccount.cookie,
    },
    body: JSON.stringify({ action: "connect", role }),
  });
  assert.equal(start.status, 200);
  const cookie = start.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  const auth = new URL((await start.json()).url);
  assert.equal(auth.origin, "https://accounts.spotify.com");
  assert.equal(auth.searchParams.get("code_challenge_method"), "S256");
  const callback = new URL("/api/integrations/spotify/callback", base);
  assert.equal(auth.searchParams.get("redirect_uri"), callback.href);
  callback.searchParams.set("state", auth.searchParams.get("state")!);
  callback.searchParams.set("error", "access_denied");
  const denied = await fetch(callback, {
    headers: { Cookie: cookie.split(";")[0] + "; " + privateAccount.cookie },
    redirect: "manual",
  });
  assert.equal(denied.status, 303);
  const target = new URL(denied.headers.get("location")!);
  assert.equal(target.origin, base);
  assert.equal(target.pathname, "/settings");
  assert.match(target.searchParams.get("spotifyError")!, /cancelled/);
}
pass(
  "Both roles can start PKCE OAuth; provider denial returns a safe local error",
);
const wrongOrigin = await fetch(base + "/api/integrations/spotify", {
  method: "POST",
  headers: {
    Origin: "https://other.example",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ action: "connect", role: "audience" }),
});
assert.equal(wrongOrigin.status, 403);
const privateTracks = await fetch(base + "/api/integrations/spotify", {
  method: "POST",
  headers: {
    Origin: base,
    "Content-Type": "application/json",
    Cookie: fan.cookie,
  },
  body: JSON.stringify({ action: "recent" }),
});
assert.equal(privateTracks.status, 401);
pass(
  "Spotify routes reject cross-origin writes and shared-demo access to private tracks",
);
const audienceView = await request(
  "switch",
  { view: "audience" },
  creator.cookie,
);
assert.equal(audienceView.status, 200);
assert.equal("messages" in audienceView.body.state, false);
pass("Dual-role audience view excludes private collaboration data");
await request("logout", {}, creator.cookie);
assert.equal(
  (
    await request(
      "community",
      { text: "Denied", category: "Discussion" },
      creator.cookie,
    )
  ).status,
  401,
);
pass("Signing out invalidates the server session");
for (const route of [
  "/",
  "/signin",
  "/onboarding",
  "/feed",
  "/discover",
  "/creators/mira-rao",
  "/events/color-after-hours",
  "/cart",
  "/loyalty",
  "/orders",
  "/notifications",
  "/settings",
  "/studio",
  "/studio/setup",
  "/studio/profile",
  "/studio/publish",
  "/studio/insights",
  "/studio/orders",
  "/studio/loyalty",
  "/studio/community",
  "/studio/collaborate",
  "/studio/collaborate/new",
  "/studio/collaborate/launch-reel",
  "/studio/collaborations",
  "/studio/messages",
  "/studio/menu",
  "/admin",
]) {
  const anonymous = await fetch(base + route, { redirect: "manual" });
  if (route !== "/" && route !== "/signin") {
    assert.equal(anonymous.status, 307, route);
    assert.equal(anonymous.headers.get("location"), "/signin", route);
  }
  const r = await fetch(base + route, { headers: { Cookie: fan.cookie } });
  assert.equal(r.status, 200, route);
  assert.ok((await r.text()).includes("AStra"), route);
}
pass(
  "All 27 routes render with a session; every feature route rejects anonymous navigation",
);
assert.equal((await fetch(base + "/not-a-route")).status, 404);
pass("Unknown routes return 404");
for (const path of [
  "/fonts/Unbounded.woff2",
  "/fonts/SchibstedGrotesk.woff2",
  "/fonts/IBMPlexMono-400.woff2",
  "/media/mascot/astra-mascot-wave-1x1.webm",
  "/media/motion/astra-hero-loop-16x9.webm",
  "/media/motion/astra-collab-poster-16x9.jpg",
  "/media/motion/astra-loyalty-loop-16x9.mp4",
])
  assert.equal(
    (await fetch(base + path, { method: "HEAD" })).status,
    200,
    path,
  );
pass("Local font, mascot and motion assets load");
const ytStatus = await fetch(base + "/api/integrations/youtube");
assert.equal(ytStatus.status, 401);
for (const role of ["audience", "creator", "both"]) {
  const start = await fetch(base + "/api/integrations/youtube", {
    method: "POST",
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      Cookie: privateAccount.cookie,
    },
    body: JSON.stringify({ action: "connect", role }),
  });
  assert.equal(start.status, 200);
  const cookie = start.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  const auth = new URL((await start.json()).url);
  assert.equal(auth.origin, "https://accounts.google.com");
  assert.equal(auth.searchParams.get("code_challenge_method"), "S256");
  assert.ok(auth.searchParams.get("nonce"));
  assert.ok(!auth.searchParams.has("client_secret"));
  const callback = new URL("/api/integrations/youtube/callback", base);
  assert.equal(auth.searchParams.get("redirect_uri"), callback.href);
  callback.searchParams.set("state", auth.searchParams.get("state")!);
  callback.searchParams.set("error", "access_denied");
  const denied = await fetch(callback, {
    headers: { Cookie: cookie.split(";")[0] + "; " + privateAccount.cookie },
    redirect: "manual",
  });
  assert.equal(denied.status, 303);
  const target = new URL(denied.headers.get("location")!);
  assert.equal(target.origin, base);
  assert.match(target.searchParams.get("youtubeError")!, /cancelled/);
  assert.equal(denied.headers.get("referrer-policy"), "no-referrer");
  const replay = await fetch(callback, {
    headers: { Cookie: cookie.split(";")[0] + "; " + privateAccount.cookie },
    redirect: "manual",
  });
  assert.match(
    new URL(replay.headers.get("location")!).searchParams.get("youtubeError")!,
    /expired/,
  );
}
pass(
  "YouTube OAuth starts for every role, binds browser/state and safely handles cancellation/replay",
);
assert.equal(
  (
    await fetch(base + "/api/integrations/youtube", {
      method: "POST",
      headers: {
        Origin: "https://other.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "connect", role: "audience" }),
    })
  ).status,
  403,
);
assert.equal(
  (
    await fetch(base + "/api/integrations/youtube", {
      method: "POST",
      headers: {
        Origin: base,
        "Content-Type": "application/json",
        Cookie: fan.cookie,
      },
      body: JSON.stringify({ action: "channels" }),
    })
  ).status,
  401,
);
assert.equal(
  (
    await fetch(
      base + "/api/integrations/youtube/video?url=https://youtu.be/abcdefghijk",
    )
  ).status,
  401,
);
assert.equal(
  (
    await fetch(
      base + "/api/integrations/youtube/video?url=https://evil.test",
      { headers: { Cookie: fan.cookie } },
    )
  ).status,
  400,
);
pass(
  "YouTube endpoints reject cross-origin writes, shared-account private reads, anonymous previews and unsafe URLs",
);
const ytCreator = await request("login", { account: "mira" });
const ytTitle = "HTTP YouTube " + Date.now();
const published = await request(
  "campaign",
  {
    demo: true,
    title: ytTitle,
    rule: "Demo only",
    link: "https://youtu.be/abcdefghijk",
    demoPoints: 2,
  },
  ytCreator.cookie,
);
assert.equal(published.status, 200);
const ytCampaign = published.body.state.campaigns.find(
  (c: { title: string }) => c.title === ytTitle,
);
const ytFeed = await (
  await fetch(base + "/api/app", { headers: { Cookie: fan.cookie } })
).json();
assert.equal(
  ytFeed.posts.find(
    (p: { demoCampaignId?: string }) => p.demoCampaignId === ytCampaign.id,
  )?.youtubeUrl,
  "https://www.youtube.com/watch?v=abcdefghijk",
);
const ytClicks = await Promise.all(
  Array.from({ length: 4 }, () =>
    request("demo-link-open", { id: ytCampaign.id, points: 999 }, fan.cookie),
  ),
);
assert.equal(ytClicks.filter((r) => r.body.result.awarded === 2).length, 1);
assert.ok(ytClicks.every((r) => r.status === 200));
pass(
  "YouTube publishes into feed and concurrent demo clicks award once across feed/Loyalty",
);
console.log(`${checks} HTTP integration groups passed.`);
