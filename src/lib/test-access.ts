/** Shared identities are never enabled by ASTRA_DEMO or in the normal database. */
export function testAccountsEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.ASTRA_TEST_ACCOUNTS === "1" &&
    /^astra_(?:browser_|http_|spotify_|youtube_)?test(?:_\d+)?$/.test(
      env.ASTRA_DB_NAME || "",
    )
  );
}
