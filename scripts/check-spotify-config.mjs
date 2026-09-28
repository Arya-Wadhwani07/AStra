// Prints statuses only, never credentials or returned access tokens.
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
const env = {
  ...process.env,
  ...(existsSync(".env.local")
    ? parseEnv(readFileSync(".env.local", "utf8"))
    : {}),
};
for (const name of [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REDIRECT_URI",
]) {
  if (!env[name]?.trim()) throw new Error(`${name} is missing`);
  console.log(`${name}: present`);
}
if (
  env.SPOTIFY_REDIRECT_URI !==
  "http://127.0.0.1:3000/api/integrations/spotify/callback"
)
  throw new Error("Local callback does not match the expected URI");
const keyFile = ".environment/config/spotify-token-key";
if (!existsSync(keyFile)) {
  writeFileSync(keyFile, randomBytes(32).toString("hex"), {
    flag: "wx",
    mode: 0o600,
  });
  console.log("Local token encryption key provisioned (value not displayed).");
} else console.log("Local token encryption key already exists.");
try {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) {
    console.log(
      `Spotify application credential check failed (HTTP ${response.status}). No response body logged.`,
    );
    process.exitCode = 1;
  } else {
    const data = await response.json();
    if (!data.access_token) throw new Error("No application token");
    console.log(
      "Spotify accepted the application credentials. Temporary app token discarded; no user data accessed. User consent and dashboard redirect registration still need browser verification.",
    );
  }
} catch {
  console.log(
    "Spotify credential check could not complete. No credentials or provider response logged.",
  );
  process.exitCode = 1;
}
