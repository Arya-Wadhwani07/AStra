import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  mutate,
  snapshot,
  eligibility,
  register,
  type Session,
  type State,
} from "../src/lib/model";
const fan: Session = { user: "alex", view: "audience" };
const mira: Session = { user: "mira", view: "creator" };
const eli: Session = { user: "eli", view: "creator" };
const admin: Session = { user: "admin", view: "admin" };
function checkout(
  s: State,
  points: unknown = 500,
  outcome = "success",
  key = "checkout-1",
) {
  return mutate(s, fan, "checkout", {
    key,
    points: { "color-after-hours": points },
    outcome,
  });
}
function cart() {
  const s = seed();
  mutate(s, fan, "cart", { id: "color-after-hours", quantity: 1 });
  return s;
}
test("audience and guests never receive creator-private collections", () => {
  for (const session of [
    undefined,
    fan,
    { user: "mira", view: "audience" } as Session,
  ]) {
    const result = snapshot(seed(), session);
    for (const key of [
      "opportunities",
      "responses",
      "briefs",
      "threads",
      "messages",
      "community",
      "reviews",
      "audit",
    ])
      assert.equal(key in result, false, key);
  }
});
test("creator actions reject audience view, including dual-role accounts", () => {
  for (const session of [fan, { user: "mira", view: "audience" } as Session])
    for (const action of [
      "opportunity",
      "respond",
      "message",
      "community",
      "brief",
      "confirm-brief",
      "profile",
      "publish",
      "loyalty",
    ])
      assert.throws(
        () => mutate(seed(), session, action, {}),
        /authorized creator/,
      );
});
test("fake role escalation is rejected", () => {
  assert.throws(
    () => snapshot(seed(), { user: "alex", view: "admin" }),
    /authorized/,
  );
  assert.throws(() => mutate(seed(), mira, "review", {}), /authorized admin/);
});
test("private conversations only return participant messages", () => {
  const s = seed();
  const out = snapshot(s, eli);
  assert.equal(out.threads?.length, 1);
  assert.equal(out.messages?.length, 1);
  assert.throws(
    () => mutate(s, eli, "message", { thread: "thread-jonah", text: "Hello" }),
    /private/,
  );
});
test("a $25 ticket at 20% accepts 500 points and leaves $20", () => {
  const s = cart();
  checkout(s);
  assert.equal(s.users[0].balance, 100);
  assert.equal(s.users[0].pending, 50);
  assert.equal(s.orders[0].paid, 2000);
  assert.equal(s.posts[0].stock, 33);
  assert.equal(s.carts.alex.length, 0);
  assert.equal(s.ledger[0].change, -500);
});
test("checkout never auto-spends points", () => {
  const s = cart();
  checkout(s, 0);
  assert.equal(s.users[0].balance, 600);
  assert.equal(s.orders[0].paid, 2500);
});
test("over-cap, fractional, negative and nonnumeric points are rejected", () => {
  for (const value of [501, -1, 1.1, "500", NaN, Infinity]) {
    const s = cart();
    assert.throws(() => checkout(s, value));
    assert.equal(s.users[0].balance, 600);
    assert.equal(s.orders.length, 1);
  }
});
test("pending points cannot increase the approved budget", () => {
  const s = cart();
  s.users[0].balance = 100;
  s.users[0].pending = 900;
  assert.throws(() => checkout(s, 500), /approved balance/);
});
test("failed or cancelled payment preserves balance, cart and inventory", () => {
  for (const outcome of ["failed", "cancelled"]) {
    const s = cart();
    assert.throws(() => checkout(s, 500, outcome), /No money was charged/);
    assert.equal(s.users[0].balance, 600);
    assert.equal(s.posts[0].stock, 34);
    assert.equal(s.carts.alex.length, 1);
    assert.equal(s.orders.length, 1);
  }
});
test("retry with the same key returns the same order without another debit", () => {
  const s = cart();
  const first = checkout(s);
  const second = checkout(s);
  assert.deepEqual(first, second);
  assert.equal(s.orders.length, 2);
  assert.equal(s.users[0].balance, 100);
});
test("second checkout cannot overspend the remaining balance", () => {
  const s = cart();
  checkout(s);
  mutate(s, fan, "cart", { id: "color-after-hours", quantity: 1 });
  assert.throws(
    () => checkout(s, 500, "success", "another-key"),
    /approved balance/,
  );
  assert.equal(s.users[0].balance, 100);
});
test("each seller cap and shared wallet apply in a multi-seller cart", () => {
  const s = cart();
  s.posts.push({
    ...s.posts[0],
    id: "other-event",
    owner: "jonah",
    price: 1000,
  });
  mutate(s, fan, "cart", { id: "other-event", quantity: 1 });
  assert.throws(
    () =>
      mutate(s, fan, "checkout", {
        key: "multi",
        points: { "color-after-hours": 400, "other-event": 200 },
        outcome: "success",
      }),
    /Points for/,
  );
  mutate(s, fan, "checkout", {
    key: "multi",
    points: { "color-after-hours": 500, "other-event": 100 },
    outcome: "success",
  });
  assert.equal(s.users[0].balance, 0);
  assert.equal(s.orders.length, 3);
});
test("stock and verification are rechecked at checkout", () => {
  let s = cart();
  s.posts[0].stock = 0;
  assert.throws(() => checkout(s), /no longer available/);
  s = cart();
  s.users.find((u) => u.id === "mira")!.verification = "pending";
  assert.throws(() => checkout(s), /no longer available/);
});
test("disabled item loyalty rejects points", () => {
  const s = cart();
  s.users.find((u) => u.id === "mira")!.ticketsEligible = false;
  assert.throws(() => checkout(s, 1));
  checkout(s, 0);
});
test("unavailable deleted items can be removed from cart", () => {
  const s = cart();
  s.posts = [];
  mutate(s, fan, "cart", { id: "color-after-hours", quantity: 0 });
  assert.equal(s.carts.alex.length, 0);
});
test("creator cannot respond twice or to their own opportunity", () => {
  assert.throws(
    () =>
      mutate(seed(), eli, "respond", {
        id: "launch-reel",
        message: "Another response",
      }),
    /already responded/,
  );
  assert.throws(
    () =>
      mutate(seed(), mira, "respond", {
        id: "launch-reel",
        message: "My response",
      }),
    /own opportunity/,
  );
});
test("required criteria block, preferred criteria do not", () => {
  const s = seed();
  const op = s.opportunities[0];
  const sam = s.users.find((u) => u.id === "sam")!;
  assert.ok(eligibility(op, sam).length);
  assert.throws(
    () =>
      mutate(s, { user: "sam", view: "creator" }, "respond", {
        id: op.id,
        message: "Hello",
      }),
    /Required/,
  );
  const jonah = s.users.find((u) => u.id === "jonah")!;
  jonah.discipline = "video";
  jonah.skills = ["Video editing", "Short-form video"];
  assert.deepEqual(eligibility(op, jonah), []);
  mutate(s, { user: "jonah", view: "creator" }, "respond", {
    id: op.id,
    message: "Hello",
  });
  assert.equal(s.responses.length, 2);
});
test("final slot pauses responses and reopening preserves count", () => {
  const s = seed();
  s.opportunities[0].seedCount = 9;
  assert.throws(
    () =>
      mutate(s, { user: "rae", view: "creator" }, "respond", {
        id: "launch-reel",
        message: "Hello",
      }),
    /limit/,
  );
  mutate(s, mira, "opportunity-status", { id: "launch-reel", closed: true });
  mutate(s, mira, "opportunity-status", { id: "launch-reel", closed: false });
  assert.equal(s.opportunities[0].seedCount, 9);
});
test("all latest-version confirmations are required for an active brief", () => {
  const s = seed();
  mutate(s, eli, "confirm-brief", { id: "brief-reel", version: 2 });
  assert.equal(s.briefs[0].confirmed.length, 2);
  mutate(s, mira, "brief", {
    opportunity: "launch-reel",
    text: "Updated complete plan with changed deliverable",
  });
  assert.equal(s.briefs[0].version, 3);
  assert.deepEqual(s.briefs[0].confirmed, []);
  assert.throws(
    () => mutate(s, eli, "confirm-brief", { id: "brief-reel", version: 2 }),
    /changed/,
  );
  assert.throws(
    () =>
      mutate(s, { user: "jonah", view: "creator" }, "confirm-brief", {
        id: "brief-reel",
        version: 3,
      }),
    /participants/,
  );
});
test("only opportunity owner may shortlist or edit the brief", () => {
  assert.throws(
    () =>
      mutate(seed(), eli, "response-status", {
        id: "response-eli",
        status: "declined",
      }),
    /owner/,
  );
  assert.throws(
    () =>
      mutate(seed(), eli, "brief", {
        opportunity: "launch-reel",
        text: "Change",
      }),
    /owner/,
  );
});
test("new accounts start with zero points and cannot register as admin", () => {
  const s = seed();
  const session = register(s, { role: "both", name: "Sample artist" });
  const u = s.users.find((u) => u.id === session.user)!;
  assert.equal(u.balance, 0);
  assert.equal(u.verification, "not submitted");
  assert.deepEqual(u.roles, ["audience", "creator"]);
  assert.throws(() => register(s, { role: "admin", name: "Invalid" }));
});
test("verification gates sales and accepting discounts, not posts", () => {
  const s = seed();
  s.users.find((u) => u.id === "mira")!.verification = "pending";
  const data = {
    type: "post",
    title: "A new piece",
    body: "In progress",
    rights: "Original work",
    published: true,
  };
  mutate(s, mira, "publish", data);
  assert.throws(
    () => mutate(s, mira, "publish", { ...data, type: "event" }),
    /Verify/,
  );
  assert.throws(() => mutate(s, mira, "loyalty", { cap: 20 }), /verification/);
});
test("admin decisions leave a reason, audit trail and user notice", () => {
  const s = seed();
  mutate(s, admin, "review", {
    id: "CASE-311",
    decision: "action needed",
    reason: "Add a portfolio link for this sample review.",
  });
  assert.equal(s.audit.length, 1);
  assert.equal(s.audit[0].reason, s.reviews[0].reason);
  assert.ok(s.notices.some((n) => n.user === "sam"));
});
test("refund requests do not silently restore points", () => {
  const s = cart();
  checkout(s);
  mutate(s, fan, "refund", { id: s.orders[0].id });
  assert.equal(s.users[0].balance, 100);
  assert.throws(
    () =>
      mutate(s, admin, "review", {
        id: s.reviews[0].id,
        decision: "approved",
        reason: "Refund",
      }),
    /unresolved/,
  );
});
test("limits only permit five, ten or twenty responses", () => {
  assert.throws(
    () => mutate(seed(), mira, "opportunity", { limit: 7 }),
    /5, 10 or 20/,
  );
});
