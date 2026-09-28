import assert from "node:assert/strict";
import { MongoClient } from "mongodb";
import {
  db,
  read,
  transaction,
  createSession,
  getSession,
  switchView,
  deleteSession,
} from "../src/lib/store";
import { mutate, type Session } from "../src/lib/model";
process.env.ASTRA_DB_NAME = "astra_test_" + Date.now();
process.env.ASTRA_TEST_ACCOUNTS = "1";
const fan: Session = { user: "alex", view: "audience" };
let checks = 0;
const check = (label: string) => {
  checks++;
  console.log("PASS " + label);
};
try {
  const { database } = await db();
  assert.equal((await read()).users.length, 9);
  check("MongoDB seeded normalized collections");
  const initial = (await read()).users[0].name;
  await assert.rejects(
    transaction((s) => {
      s.users[0].name = "Should roll back";
      throw new Error("Intentional test failure");
    }),
  );
  assert.equal((await read()).users[0].name, initial);
  check("Failed transaction leaves no partial writes");
  await transaction((s) =>
    mutate(s, fan, "cart", { id: "color-after-hours", quantity: 1 }),
  );
  const checkout = () =>
    transaction((s) =>
      mutate(s, fan, "checkout", {
        key: "mongo-concurrent-checkout",
        points: { "color-after-hours": 500 },
        outcome: "success",
      }),
    );
  const receipts = await Promise.all([checkout(), checkout(), checkout()]);
  assert.deepEqual(receipts[0], receipts[1]);
  assert.deepEqual(receipts[1], receipts[2]);
  let s = await read();
  assert.equal(s.users.find((u) => u.id === "alex")!.balance, 100);
  assert.equal(s.orders.length, 2);
  assert.equal(s.posts.find((p) => p.id === "color-after-hours")!.stock, 33);
  check("Concurrent payment retries debit once and return the same order");
  await transaction((s) => {
    s.opportunities[0].seedCount = 8;
    for (const uid of ["sam", "rae", "jonah"]) {
      const u = s.users.find((u) => u.id === uid)!;
      u.discipline = "video";
      u.skills = ["Video editing", "Short-form video"];
    }
  });
  const responses = await Promise.allSettled(
    ["sam", "rae", "jonah"].map((user) =>
      transaction((s) =>
        mutate(s, { user, view: "creator" }, "respond", {
          id: "launch-reel",
          message: "Concurrent final-slot test",
        }),
      ),
    ),
  );
  assert.equal(responses.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(responses.filter((r) => r.status === "rejected").length, 2);
  s = await read();
  assert.equal(
    s.responses.filter((r) => r.opportunity === "launch-reel").length,
    2,
  );
  check("Simultaneous responses cannot exceed the opportunity limit");
  const responseIndexes = await database.collection("responses").indexes();
  assert.ok(
    responseIndexes.some(
      (i) => i.unique && i.key.opportunity === 1 && i.key.user === 1,
    ),
  );
  check("Unique creator/opportunity response index exists");
  const token = await createSession(fan);
  assert.equal((await getSession(token))?.view, "audience");
  await assert.rejects(switchView(token, "creator"));
  await deleteSession(token);
  assert.equal(await getSession(token), undefined);
  check("MongoDB sessions expire and cannot escalate roles");
  const second = new MongoClient("mongodb://127.0.0.1:27018/?replicaSet=astra");
  try {
    await second.connect();
    const user = await second
      .db(database.databaseName)
      .collection<{ _id: string; balance: number }>("users")
      .findOne({ _id: "alex" });
    assert.equal(user?.balance, 100);
  } finally {
    await second.close();
  }
  check("Persisted data is visible through an independent MongoDB connection");
  await transaction((s) => {
    s.posts.push({
      ...s.posts[0],
      id: "scarce-test-ticket",
      owner: "jonah",
      stock: 1,
      price: 1000,
    });
    for (const user of ["alex", "mira"])
      mutate(s, { user, view: "audience" }, "cart", {
        id: "scarce-test-ticket",
        quantity: 1,
      });
  });
  const lastTicket = await Promise.allSettled(
    ["alex", "mira"].map((user) =>
      transaction((s) =>
        mutate(s, { user, view: "audience" }, "checkout", {
          key: "last-ticket-" + user,
          points: {},
          outcome: "success",
        }),
      ),
    ),
  );
  assert.equal(lastTicket.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(lastTicket.filter((r) => r.status === "rejected").length, 1);
  assert.equal(
    (await read()).posts.find((p) => p.id === "scarce-test-ticket")!.stock,
    0,
  );
  check("Two buyers competing for the last ticket cannot oversell inventory");
  const beforeInvalid = await read();
  await assert.rejects(
    transaction((s) =>
      mutate(s, { user: "mira", view: "creator" }, "profile", {
        name: "Must not persist",
        bio: "Changed before later field fails",
        discipline: "invalid",
      }),
    ),
  );
  assert.deepEqual((await read()).users, beforeInvalid.users);
  check("Late validation failures roll back earlier profile field mutations");
  const expiring = await createSession(fan);
  const { createHash } = await import("node:crypto");
  await database
    .collection("sessions")
    .updateOne(
      { _id: createHash("sha256").update(expiring).digest("hex") as never },
      { $set: { expires: new Date(0) } },
    );
  assert.equal(await getSession(expiring), undefined);
  check(
    "Expired sessions are rejected immediately without waiting for MongoDB TTL cleanup",
  );
  console.log(
    `${checks} MongoDB integration checks passed. Test database retained locally: ${database.databaseName}`,
  );
} finally {
  const { client } = await db();
  await client.close();
}
