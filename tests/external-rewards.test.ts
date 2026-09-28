import test from "node:test";
import assert from "node:assert/strict";
import {
  AppError,
  mutate,
  seed,
  snapshot,
  type Session,
} from "../src/lib/model";

// Current safety contract, NOT tests of live provider integrations.
// Replace these gates only after provider permission, verifiable evidence,
// real account authentication and approved earning rules are implemented.
const fan: Session = { user: "alex", view: "audience" };
const creator: Session = { user: "mira", view: "creator" };
const providers = ["spotify", "youtube", "youtube-music", "amazon-music"];
const draft = {
  title: "Album launch",
  rule: "Proposed: ten listens for one point",
};

for (const provider of providers) {
  test(`${provider}: self-reported playback cannot credit points`, () => {
    const state = seed();
    const before = structuredClone(state);
    for (let retry = 0; retry < 3; retry++) {
      assert.throws(
        () =>
          mutate(state, fan, "claim-external-reward", {
            provider,
            campaign: "album-launch",
            user: "mira",
            points: 1000,
            verified: true,
            approved: true,
            count: 10,
            eventId: "same-event",
            playedAt: new Date().toISOString(),
          }),
        (error: unknown) => error instanceof AppError && error.status === 404,
      );
      assert.deepEqual(state, before);
    }
  });
  test(`${provider}: a campaign stays draft despite supplied activation flags`, () => {
    const state = seed();
    const before = structuredClone(state);
    mutate(state, creator, "campaign", {
      ...draft,
      provider,
      status: "active",
      enabled: true,
      verified: true,
      points: 1000,
      owner: "eli",
      approval: "client-supplied",
    });
    assert.equal(state.campaigns[0].owner, "mira");
    assert.equal(state.campaigns[0].status, "Draft. Earning not enabled.");
    assert.deepEqual(state.users, before.users);
    assert.deepEqual(state.ledger, before.ledger);
    assert.equal("enabled" in state.campaigns[0], false);
    assert.equal("approval" in state.campaigns[0], false);
  });
}

test("link clicks, timers, player-ended events and screenshots are not reward evidence", () => {
  for (const evidence of [
    "link-click",
    "timer",
    "player-ended",
    "screenshot",
    "recently-played-json",
  ]) {
    const state = seed();
    const before = structuredClone(state);
    assert.throws(
      () =>
        mutate(state, fan, "claim-external-reward", {
          evidence,
          completed: true,
          points: 1,
        }),
      AppError,
    );
    assert.deepEqual(state, before);
  }
});

test("a client cannot mark its provider account connected or save tokens through settings", () => {
  const state = seed();
  const before = structuredClone(state);
  mutate(state, fan, "settings", {
    spotifyConnected: true,
    youtubeConnected: true,
    amazonConnected: true,
    accessToken: "test-only-not-a-real-token",
    refreshToken: "test-only",
    balance: 999999,
    pending: 999999,
  });
  assert.deepEqual(state, before);
  assert.ok(!JSON.stringify(snapshot(state, fan)).includes("test-only"));
});

test("fans and dual-role accounts in audience view cannot create earning campaigns", () => {
  for (const session of [fan, { user: "mira", view: "audience" } as Session]) {
    const state = seed();
    const before = structuredClone(state);
    assert.throws(
      () => mutate(state, session, "campaign", draft),
      (error: unknown) => error instanceof AppError && error.status === 403,
    );
    assert.deepEqual(state, before);
  }
});

test("campaign drafts remain private to their creator", () => {
  const state = seed();
  mutate(state, creator, "campaign", draft);
  assert.equal(snapshot(state, creator).campaigns?.length, 1);
  assert.deepEqual(
    snapshot(state, { user: "eli", view: "creator" }).campaigns,
    [],
  );
  assert.equal("campaigns" in snapshot(state, fan), false);
  assert.equal("campaigns" in snapshot(state), false);
});

test("even an administrator cannot inject a listening credit through an unsupported action", () => {
  const state = seed();
  const before = structuredClone(state);
  assert.throws(
    () =>
      mutate(state, { user: "admin", view: "admin" }, "claim-external-reward", {
        provider: "spotify",
        user: "alex",
        points: 1000,
        verified: true,
      }),
    AppError,
  );
  assert.deepEqual(state, before);
});
