const localUri = "mongodb://127.0.0.1:27018/?replicaSet=astra";

/** Server-only deployment settings; never log or send the URI to a client. */
export function databaseConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const name = env.ASTRA_DB_NAME || "astra";
  if (!/^astra(?:_[a-zA-Z0-9_]+)?$/.test(name))
    throw new Error("Use an astra-prefixed MongoDB database name.");
  const configured = env.MONGODB_URI?.trim();
  if (env.ASTRA_HOSTED === "1" && !configured)
    throw new Error("Set MONGODB_URI in the hosting environment's Secrets.");
  const uri = configured || localUri;
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri))
    throw new Error("MONGODB_URI must be a MongoDB connection string.");
  const local = uri === localUri;
  // Test scripts reset their database. Never let inherited Atlas secrets send
  // those operations to a hosted database, even with a test database name.
  if (
    !local &&
    (env.ASTRA_TEST_ACCOUNTS === "1" ||
      /^astra_(?:browser_|http_|spotify_|youtube_)?test(?:_\d+)?$/.test(name))
  )
    throw new Error("Automated test databases must use the local MongoDB server.");
  return { uri, name, local };
}
