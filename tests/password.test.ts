import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  normalizeEmail,
  validatePassword,
} from "../src/lib/password-auth";
import { testAccountsEnabled } from "../src/lib/test-access";
import { seed, snapshot, register } from "../src/lib/model";

test("passwords are salted, one-way hashed and constant-length verified", async () => {
  const password = "A long private passphrase!";
  const a = await hashPassword(password),
    b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.ok(!a.includes(password));
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("Wrong but lengthy password", a), false);
  assert.equal(await verifyPassword(password), false);
});
test("email normalization and password boundaries reject malformed input", () => {
  assert.equal(normalizeEmail(" Arya@Example.com "), "arya@example.com");
  for (const email of [null, {}, "missing", "a@b", "a b@example.com"])
    assert.throws(() => normalizeEmail(email));
  for (const password of [null, {}, "short", "a".repeat(129)])
    assert.throws(() => validatePassword(password));
  validatePassword("a".repeat(15));
  validatePassword("a".repeat(128));
});
test("shared account access needs both explicit test flag and isolated test database", () => {
  for (const env of [
    {},
    { ASTRA_DEMO: "1" },
    { ASTRA_TEST_ACCOUNTS: "1", ASTRA_DB_NAME: "astra" },
    { ASTRA_TEST_ACCOUNTS: "1", ASTRA_DB_NAME: "astra_production" },
    { ASTRA_DB_NAME: "astra_http_test" },
  ])
    assert.equal(testAccountsEnabled(env), false);
  assert.equal(
    testAccountsEnabled({
      ASTRA_TEST_ACCOUNTS: "1",
      ASTRA_DB_NAME: "astra_browser_test_123",
    }),
    true,
  );
});
test("snapshots never expose credential hashes and new accounts never inherit them", () => {
  const s = seed();
  s.users[0].passwordHash = "secret-hash";
  s.users[0].emailLoginHash = "private-lookup";
  const json = JSON.stringify(
    snapshot(s, { user: s.users[0].id, view: "audience" }),
  );
  assert.doesNotMatch(
    json,
    /secret-hash|private-lookup|passwordHash|emailLoginHash/,
  );
  const session = register(s, { name: "New creator", role: "creator" });
  const user = s.users.find((u) => u.id === session.user)!;
  assert.equal(user.passwordHash, undefined);
  assert.equal(user.emailLoginHash, undefined);
});
