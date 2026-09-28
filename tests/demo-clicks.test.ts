import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  mutate,
  demoContentLink,
  snapshot,
  type State,
} from "../src/lib/model";
const creator = { user: "mira", view: "creator" as const };
const fan = { user: "alex", view: "audience" as const };
const link = `https://open.spotify.com/album/${"A".repeat(22)}?si=tracking`;
function demo(fn: () => void) {
  const previous = process.env.ASTRA_DEMO;
  process.env.ASTRA_DEMO = "1";
  try {
    fn();
  } finally {
    if (previous === undefined) delete process.env.ASTRA_DEMO;
    else process.env.ASTRA_DEMO = previous;
  }
}
function campaign(state: State) {
  mutate(state, creator, "campaign", {
    title: "Click demo",
    rule: "Not listening verification",
    demo: true,
    link,
    demoPoints: 10,
  });
  return state.campaigns[0].id;
}
test("demo link requests award exactly once and never trust client points or recipient", () =>
  demo(() => {
    const state = seed();
    const id = campaign(state);
    const balance = state.users[0].balance;
    assert.deepEqual(
      mutate(state, fan, "demo-link-open", { id, points: 100000, user: "eli" }),
      { url: link.split("?")[0], awarded: 10 },
    );
    for (let i = 0; i < 5; i++)
      assert.deepEqual(mutate(state, fan, "demo-link-open", { id }), {
        url: link.split("?")[0],
        awarded: 0,
      });
    assert.equal(state.users[0].balance, balance + 10);
    assert.equal(state.ledger.filter((l) => l.demoCampaign === id).length, 1);
    assert.match(state.ledger[0].activity, /not a verified listen/);
    assert.equal(snapshot(state, fan).demoCampaigns[0].claimed, true);
  }));
test("creators cannot award themselves and draft campaigns cannot award anyone", () =>
  demo(() => {
    const state = seed();
    const id = campaign(state);
    assert.throws(
      () => mutate(state, creator, "demo-link-open", { id }),
      /own demo/,
    );
    mutate(state, creator, "campaign", {
      title: "Draft",
      rule: "Proposed only",
    });
    assert.throws(() =>
      mutate(state, fan, "demo-link-open", { id: state.campaigns[0].id }),
    );
  }));
test("demo campaign creation and claims are disabled without ASTRA_DEMO", () =>
  demo(() => {
    const state = seed();
    const id = campaign(state);
    process.env.ASTRA_DEMO = "0";
    assert.throws(() => campaign(state), /disabled/);
    assert.throws(
      () => mutate(state, fan, "demo-link-open", { id }),
      /disabled/,
    );
    assert.deepEqual(snapshot(state, fan).demoCampaigns, []);
  }));
test("unsupported or deceptive content links cannot become external redirects", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://open.spotify.com/album/" + "A".repeat(22),
    "https://open.spotify.com.evil.test/album/" + "A".repeat(22),
    "https://open.spotify.com@evil.test/album/" + "A".repeat(22),
    "https://127.0.0.1/admin",
    "https://spotify.link/short",
    "https://www.youtube.com/redirect?q=evil",
  ])
    assert.throws(() => demoContentLink(url));
  assert.equal(
    demoContentLink("https://youtu.be/abcdefghijk?si=tracking"),
    "https://www.youtube.com/watch?v=abcdefghijk",
  );
  assert.equal(
    demoContentLink("https://www.youtube.com/shorts/abcdefghijk"),
    "https://www.youtube.com/watch?v=abcdefghijk",
  );
});
test("demo points are capped, integer-only and creator-controlled", () =>
  demo(() => {
    for (const value of [0, 101, 1.5, "10", NaN]) {
      const state = seed();
      assert.throws(() =>
        mutate(state, creator, "campaign", {
          title: "Bad",
          rule: "Demo",
          demo: true,
          link,
          demoPoints: value,
        }),
      );
      assert.equal(state.campaigns.length, 0);
    }
  }));
