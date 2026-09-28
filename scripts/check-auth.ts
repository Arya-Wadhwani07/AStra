import assert from "node:assert/strict";
import { passwordAccount } from "../src/lib/password-auth";
import {
  createSession,
  getSession,
  deleteSession,
  read,
  db,
  transaction,
} from "../src/lib/store";
import { snapshot } from "../src/lib/model";
process.env.ASTRA_DB_NAME = `astra_auth_test_${Date.now()}`;
process.env.ASTRA_TEST_ACCOUNTS = "0";
let checks = 0;
const pass = (s: string) => {
  checks++;
  console.log("PASS " + s);
};
try {
  const sample = await createSession({ user: "alex", view: "audience" });
  assert.equal(await getSession(sample), undefined);
  pass(
    "Normal mode rejects old sample sessions even when the cookie is genuine",
  );
  const credentials = {
    name: "Private QA user",
    email: "QA@example.test",
    password: "Private AStra passphrase!",
    role: "both",
  };
  const account = await passwordAccount("signup", credentials);
  const token = await createSession(account);
  assert.deepEqual(await getSession(token), account);
  const user = (await read()).users.find((u) => u.id === account.user)!;
  assert.equal(user.balance, 0);
  assert.equal(user.pending, 0);
  assert.equal(user.authProvider, "password");
  assert.ok(
    user.passwordHash && !user.passwordHash.includes(credentials.password),
  );
  assert.doesNotMatch(
    JSON.stringify(snapshot(await read(), account)),
    /passwordHash|emailLoginHash|Private AStra passphrase/,
  );
  pass(
    "Real password account persists, starts at zero and never exposes its credentials",
  );
  assert.equal(
    (
      await passwordAccount("signin", {
        ...credentials,
        email: "qa@EXAMPLE.TEST",
      })
    ).user,
    account.user,
  );
  pass("Email normalization signs back into exactly the same AStra identity");
  const results = await Promise.allSettled(
    [0, 1].map(() =>
      passwordAccount("signup", {
        ...credentials,
        email: "concurrent@example.test",
      }),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    (await read()).users.filter((u) => u.email === "concurrent@example.test")
      .length,
    1,
  );
  pass("Concurrent duplicate signups create exactly one account");
  await assert.rejects(
    passwordAccount("signin", {
      ...credentials,
      password: "An incorrect passphrase!",
    }),
    /Email or password is incorrect/,
  );
  const attempts = (await db()).database.collection<{
    _id: string;
    count: number;
  }>("auth_attempts");
  const { createHash } = await import("node:crypto");
  const key = createHash("sha256").update("qa@example.test").digest("hex");
  await attempts.updateOne(
    { _id: `${key}:${Math.floor(Date.now() / 900000)}` },
    { $set: { count: 10 } },
  );
  await assert.rejects(
    passwordAccount("signin", credentials),
    /Too many attempts/,
  );
  pass(
    "Incorrect passwords fail and the persisted per-email attempt limit is enforced",
  );
  await deleteSession(token);
  assert.equal(await getSession(token), undefined);
  pass("Logout invalidates a real account session on the server");
  await transaction((s) => {
    const u = s.users.find((u) => u.id === account.user)!;
    u.authProvider = "google";
  });
  const providerOnly = await createSession(account);
  assert.equal(await getSession(providerOnly), undefined);
  pass(
    "Legacy provider-only identities cannot bypass mandatory AStra authentication",
  );
  console.log(
    `${checks} authentication integration groups passed; isolated local data retained.`,
  );
} finally {
  const { client } = await db();
  await client.close();
}
