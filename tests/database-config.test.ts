import test from "node:test";
import assert from "node:assert/strict";
import { databaseConfig } from "../src/lib/database-config";

test("local database defaults are unchanged", () => {
  assert.deepEqual(databaseConfig({}), {
    uri: "mongodb://127.0.0.1:27018/?replicaSet=astra",
    name: "astra",
    local: true,
  });
});
test("hosting uses the configured URI and database without exposing credentials", () => {
  const uri = "mongodb+srv://fixture:password@cluster.example.net/?appName=AStra";
  assert.deepEqual(databaseConfig({ MONGODB_URI: ` ${uri} `, ASTRA_DB_NAME: "astra_hosted", ASTRA_HOSTED: "1" }), {
    uri, name: "astra_hosted", local: false,
  });
  assert.throws(() => databaseConfig({ MONGODB_URI: "https://fixture:secret@example.net" }), {
    message: "MONGODB_URI must be a MongoDB connection string.",
  });
});
test("hosting fails explicitly without a URI instead of trying localhost", () => {
  for (const value of [undefined, "", "  "])
    assert.throws(() => databaseConfig({ ASTRA_HOSTED: "1", MONGODB_URI: value }), /Set MONGODB_URI/);
});
test("test runs cannot reset an Atlas database through inherited credentials", () => {
  const MONGODB_URI = "mongodb+srv://fixture:password@cluster.example.net/";
  for (const ASTRA_DB_NAME of ["astra_test", "astra_browser_test_123", "astra_http_test_123", "astra_spotify_test", "astra_youtube_test"])
    assert.throws(() => databaseConfig({ MONGODB_URI, ASTRA_DB_NAME }), /must use the local/);
  assert.throws(() => databaseConfig({ MONGODB_URI, ASTRA_TEST_ACCOUNTS: "1" }), /must use the local/);
  assert.equal(databaseConfig({ ASTRA_DB_NAME: "astra_browser_test_123" }).local, true);
});
test("invalid database names are still rejected", () => {
  for (const ASTRA_DB_NAME of ["admin", "other", "astra/other", "astra bad"])
    assert.throws(() => databaseConfig({ ASTRA_DB_NAME }), /astra-prefixed/);
});
