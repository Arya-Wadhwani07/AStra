import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  mutate,
  snapshot,
  register,
  type Session,
} from "../src/lib/model";
const creator: Session = { user: "mira", view: "creator" },
  collaborator: Session = { user: "eli", view: "creator" },
  fan: Session = { user: "alex", view: "audience" };
const post = {
  type: "post",
  title: "New artwork",
  body: "Original painting",
  rights: "Original work",
  published: true,
};
test("creator-to-audience happy path: publish merchandise, redeem, fulfil, request refund", () => {
  const s = seed();
  mutate(s, creator, "loyalty", {
    cap: 20,
    ticketsEligible: true,
    merchEligible: true,
  });
  const item = mutate(s, creator, "publish", {
    ...post,
    type: "merch",
    price: 1000,
    stock: 2,
  });
  assert.ok(snapshot(s, fan).posts.some((p) => p.id === item));
  mutate(s, fan, "cart", { id: item, quantity: 2 });
  const ids = mutate(s, fan, "checkout", {
    key: "journey",
    points: { [String(item)]: 400 },
    outcome: "success",
    address: "123 Example Lane, Fiction City",
  }) as string[];
  const order = s.orders.find((o) => o.id === ids[0])!;
  assert.equal(order.paid, 1600);
  assert.equal(order.quantity, 2);
  assert.equal(s.users[0].balance, 200);
  assert.ok(snapshot(s, creator).orders.some((o) => o.id === order.id));
  mutate(s, creator, "fulfil", {
    id: order.id,
    tracking: "SIMULATED-TRACKING",
  });
  assert.equal(
    snapshot(s, fan).orders.find((o) => o.id === order.id)?.status,
    "Shipped",
  );
  mutate(s, fan, "refund", { id: order.id });
  assert.equal(order.status, "Refund requested");
  assert.equal(s.users[0].balance, 200);
  assert.throws(() => mutate(s, fan, "refund", { id: order.id }), /already/);
});
test("creator collaboration happy path: opportunity, response, shortlist, brief, mutual confirmation", () => {
  const s = seed();
  const op = mutate(s, creator, "opportunity", {
    title: "Painting film",
    description: "Cross-genre project",
    discipline: "video",
    requiredSkills: "Video editing",
    preferredSkills: "Animation",
    remote: true,
    arrangement: "paid",
    budget: "$50 demo",
    deliverable: "One film",
    timing: "Next month",
    limit: 5,
  });
  const thread = mutate(s, collaborator, "respond", {
    id: op,
    message: "I can edit the film.",
  });
  const response = s.responses.find((r) => r.opportunity === op)!;
  mutate(s, creator, "response-status", {
    id: response.id,
    status: "shortlisted",
  });
  const id = mutate(s, creator, "brief", {
    opportunity: op,
    text: "Roles, one video, credit both artists, approve before release, $50 proposed fee.",
  });
  for (const session of [creator, collaborator])
    mutate(s, session, "confirm-brief", { id, version: 1 });
  const brief = s.briefs.find((b) => b.id === id)!;
  assert.deepEqual(brief.confirmed.sort(), ["eli", "mira"]);
  mutate(s, collaborator, "message", { thread, text: "Ready to start." });
  assert.ok(
    snapshot(s, creator).messages?.some(
      (m) => m.thread === thread && m.text === "Ready to start.",
    ),
  );
  assert.equal(snapshot(s, fan).messages, undefined);
  assert.equal(snapshot(s, fan).briefs, undefined);
  mutate(s, creator, "brief", {
    opportunity: op,
    text: "Updated deliverable: two films. Needs fresh consent.",
  });
  assert.deepEqual(brief.confirmed, []);
  assert.equal(brief.version, 2);
  assert.throws(
    () => mutate(s, collaborator, "confirm-brief", { id, version: 1 }),
    /changed/,
  );
});
test("draft lifecycle: save, edit, publish, unpublish and delete without another creator editing it", () => {
  const s = seed(),
    id = mutate(s, creator, "publish", { ...post, published: false });
  assert.ok(!snapshot(s, fan).posts.some((p) => p.id === id));
  assert.throws(
    () => mutate(s, collaborator, "publish", { ...post, id }),
    /owner/,
  );
  mutate(s, creator, "publish", {
    ...post,
    id,
    title: "Edited",
    published: false,
  });
  mutate(s, creator, "content-status", { id, status: "publish" });
  assert.ok(
    snapshot(s, fan).posts.some((p) => p.id === id && p.title === "Edited"),
  );
  assert.throws(
    () => mutate(s, creator, "content-status", { id, status: "delete" }),
    /Unpublish/,
  );
  mutate(s, creator, "content-status", { id, status: "unpublish" });
  mutate(s, creator, "content-status", { id, status: "delete" });
  assert.ok(!s.posts.some((p) => p.id === id));
});
test("unknown publication commands must not silently unpublish content", () => {
  const s = seed(),
    id = s.posts[0].id;
  for (const status of [undefined, null, "typo", "", true]) {
    assert.throws(() => mutate(s, creator, "content-status", { id, status }));
    assert.equal(s.posts[0].published, true);
  }
});
test("malformed opportunity commands cannot silently reopen a closed opportunity", () => {
  const s = seed();
  s.opportunities[0].closed = true;
  for (const closed of [undefined, null, "false", 0]) {
    assert.throws(() =>
      mutate(s, creator, "opportunity-status", { id: "launch-reel", closed }),
    );
    assert.equal(s.opportunities[0].closed, true);
  }
});
test("shipping cannot erase a pending refund request", () => {
  const s = seed();
  const o = s.orders[0];
  o.type = "merch";
  o.seller = "mira";
  o.status = "Refund requested";
  assert.throws(() =>
    mutate(s, creator, "fulfil", { id: o.id, tracking: "TRACK" }),
  );
  assert.equal(o.status, "Refund requested");
});
test("duplicate fulfilment does not produce duplicate shipping notifications", () => {
  const s = seed(),
    o = s.orders[0];
  o.type = "merch";
  o.seller = "mira";
  o.status = "Preparing";
  mutate(s, creator, "fulfil", { id: o.id, tracking: "TRACK" });
  const count = s.notices.length;
  mutate(s, creator, "fulfil", { id: o.id, tracking: "TRACK" });
  assert.equal(s.notices.length, count);
});
test("cart rejects fractional, negative, oversized, draft, post and sold-out selections", () => {
  for (const quantity of [-1, 0.5, 11, "1", NaN, Infinity])
    assert.throws(() =>
      mutate(seed(), fan, "cart", { id: "color-after-hours", quantity }),
    );
  for (const patch of [
    { published: false },
    { type: "post" as const },
    { stock: 0 },
  ]) {
    const s = seed();
    Object.assign(s.posts[0], patch);
    assert.throws(() =>
      mutate(s, fan, "cart", { id: s.posts[0].id, quantity: 1 }),
    );
  }
});
test("changed creator cap after adding to cart is checked at payment", () => {
  const s = seed();
  mutate(s, fan, "cart", { id: s.posts[0].id, quantity: 1 });
  mutate(s, creator, "loyalty", {
    cap: 5,
    ticketsEligible: true,
    merchEligible: true,
  });
  assert.throws(() =>
    mutate(s, fan, "checkout", {
      key: "cap-change",
      points: { [s.posts[0].id]: 500 },
      outcome: "success",
    }),
  );
  assert.equal(s.users[0].balance, 600);
  assert.equal(s.posts[0].stock, 34);
});
test("merchandise checkout requires delivery details and rejects failed payment without debit", () => {
  const s = seed(),
    id = mutate(s, creator, "publish", {
      ...post,
      type: "merch",
      price: 1000,
      stock: 2,
    });
  mutate(s, fan, "cart", { id, quantity: 1 });
  for (const data of [
    { outcome: "success" },
    { outcome: "failed", address: "Fictional address" },
    { outcome: "cancelled", address: "Fictional address" },
  ]) {
    assert.throws(() =>
      mutate(s, fan, "checkout", {
        key: "failed",
        points: { [String(id)]: 100 },
        ...data,
      }),
    );
    assert.equal(s.users[0].balance, 600);
    assert.equal(s.posts.find((p) => p.id === id)!.stock, 2);
  }
});
test("direct outreach is creator-only, idempotent and inaccessible to outsiders", () => {
  const s = seed(),
    id = mutate(s, creator, "direct", { id: "sam" });
  assert.equal(mutate(s, creator, "direct", { id: "sam" }), id);
  assert.throws(() => mutate(s, creator, "direct", { id: "mira" }));
  assert.throws(() => mutate(s, fan, "direct", { id: "mira" }));
  assert.throws(
    () => mutate(s, collaborator, "message", { thread: id, text: "Intrusion" }),
    /private/,
  );
  assert.ok(!snapshot(s, collaborator).threads?.some((t) => t.id === id));
});
test("only recipient can mark notices read; settings cannot inject identities or balances", () => {
  const s = seed();
  const other = {
    ...s.notices[0],
    id: "private-notice",
    user: "mira",
    read: false,
  };
  s.notices.push(other);
  const before = structuredClone(other);
  mutate(s, fan, "read", { id: other.id });
  assert.deepEqual(other, before);
  mutate(s, fan, "settings", {
    balance: 999999,
    authProvider: "google",
    googleSubjectHash: "fake",
    motion: false,
  });
  assert.equal(s.users[0].balance, 600);
  assert.equal(s.users[0].authProvider, undefined);
  assert.equal(s.users[0].settings.motion, false);
});
test("registration enforces lengths and roles, and creates no private inherited data", () => {
  for (const data of [
    { name: " ", role: "audience" },
    { name: "A".repeat(81), role: "creator" },
    { name: "Name", role: "admin" },
  ])
    assert.throws(() => register(seed(), data));
  const s = seed(),
    session = register(s, { name: "A new artist", role: "both" });
  const u = snapshot(s, session).me!;
  assert.equal(u.balance, 0);
  assert.equal(u.pending, 0);
  assert.deepEqual(u.favorites, []);
});
test("owner and buyer access checks protect order fulfilment and refund actions", () => {
  const s = seed(),
    o = s.orders[0];
  assert.throws(
    () => mutate(s, collaborator, "fulfil", { id: o.id, tracking: "NO" }),
    /cannot be shipped/,
  );
  assert.throws(
    () => mutate(s, collaborator, "refund", { id: o.id }),
    /another account/,
  );
});
