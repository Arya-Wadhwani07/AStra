import test from "node:test";
import assert from "node:assert/strict";
import { seed, mutate, snapshot } from "../src/lib/model";
import { spotifyContent } from "../src/lib/spotify-content";
const creator = { user: "mira", view: "creator" as const };
const fan = { user: "alex", view: "audience" as const };
const track = "A".repeat(22);
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
test("publishing a song produces one canonical feed post tied to its reward campaign", () =>
  demo(() => {
    const state = seed();
    mutate(state, creator, "campaign", {
      demo: true,
      title: "My single",
      rule: "A new release",
      link: `https://open.spotify.com/intl-en/track/${track}?si=tracking`,
      demoPoints: 1,
    });
    const campaign = state.campaigns[0];
    const before = state.users[0].balance;
    const feed = snapshot(state, fan);
    const post = feed.posts.find((p) => p.demoCampaignId === campaign.id)!;
    assert.ok(post);
    assert.equal(post.spotifyUrl, `https://open.spotify.com/track/${track}`);
    assert.equal(post.body, "A new release");
    assert.equal(post.owner, "mira");
    assert.equal(post.created, campaign.created);
    assert.equal(post.published, true);
    assert.equal(
      state.users[0].balance,
      before,
      "Rendering must never credit points",
    );
    assert.equal(
      feed.posts.filter((p) => p.demoCampaignId === campaign.id).length,
      1,
    );
    assert.equal(
      state.posts.filter((p) => p.demoCampaignId === campaign.id).length,
      0,
      "No duplicate source of truth",
    );
    mutate(state, fan, "demo-link-open", { id: post.demoCampaignId });
    assert.equal(state.users[0].balance, before + 1);
    assert.equal(
      snapshot(state, fan).demoCampaigns.find((c) => c.id === campaign.id)
        ?.claimed,
      true,
    );
    assert.deepEqual(
      mutate(state, fan, "demo-link-open", { id: campaign.id }),
      { url: post.spotifyUrl, awarded: 0 },
    );
  }));
test("draft proposals and disabled demo mode do not leak reward posts to the feed", () =>
  demo(() => {
    const state = seed();
    mutate(state, creator, "campaign", {
      title: "Draft proposal",
      rule: "Draft only",
      link: `https://open.spotify.com/track/${track}`,
    });
    assert.ok(!snapshot(state, fan).posts.some((p) => p.demoCampaignId));
    mutate(state, creator, "campaign", {
      demo: true,
      title: "Published",
      rule: "Demo",
      link: `https://open.spotify.com/track/${track}`,
      demoPoints: 1,
    });
    process.env.ASTRA_DEMO = "0";
    assert.ok(!snapshot(state, fan).posts.some((p) => p.demoCampaignId));
  }));
test("albums render as albums, while YouTube campaigns never become Spotify players", () =>
  demo(() => {
    const state = seed();
    for (const link of [
      `https://open.spotify.com/album/${track}`,
      "https://youtu.be/abcdefghijk",
    ])
      mutate(state, creator, "campaign", {
        demo: true,
        title: "Release",
        rule: "Demo",
        link,
        demoPoints: 1,
      });
    const cards = snapshot(state, fan).posts.filter((p) => p.spotifyUrl);
    assert.equal(cards.length, 1);
    assert.equal(spotifyContent(cards[0].spotifyUrl)?.kind, "album");
  }));
test("embed URLs are constructed from Spotify content IDs, never arbitrary submitted HTML", () => {
  assert.equal(
    spotifyContent(
      `https://open.spotify.com/track/${track}?autoplay=1#anything`,
    )?.embed,
    `https://open.spotify.com/embed/track/${track}?theme=0`,
  );
  for (const input of [
    "<iframe src='https://evil.test'></iframe>",
    "javascript:alert(1)",
    `https://open.spotify.com.evil.test/track/${track}`,
    `https://open.spotify.com@evil.test/track/${track}`,
    `https://open.spotify.com/embed/track/${track}`,
    "https://spotify.link/short",
    `https://open.spotify.com/playlist/${track}`,
  ])
    assert.equal(spotifyContent(input), null);
});
