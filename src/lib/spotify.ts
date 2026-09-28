import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { AppError, type State, type Session } from "./model";
import { privateIdentity } from "./private-identity";

export const spotifyScope = "user-read-recently-played";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const nonce = () => randomBytes(32).toString("base64url");
export function spotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (!clientId || !redirectUri)
    throw new AppError("Spotify is not configured on this server.", 503);
  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    throw new AppError("Spotify callback configuration is invalid.", 503);
  }
  if (
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && url.hostname === "127.0.0.1")) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/api/integrations/spotify/callback"
  )
    throw new AppError("Spotify callback configuration is invalid.", 503);
  return { clientId, redirectUri, origin: url.origin };
}
export function tokenKey() {
  const configured = process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY;
  let value = configured;
  if (!value) {
    const root = realpathSync(process.cwd());
    const file = realpathSync(
      join(root, ".environment/config/spotify-token-key"),
    );
    if (!file.startsWith(root + "/"))
      throw new Error("Token key outside project");
    value = readFileSync(file, "utf8").trim();
  }
  if (!/^[a-f0-9]{64}$/i.test(value))
    throw new Error("Invalid token encryption key");
  return Buffer.from(value, "hex");
}
export function seal(value: string, owner: string, key = tokenKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(owner));
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((v) => v.toString("base64url"))
    .join(".");
}
export function unseal(value: string, owner: string, key = tokenKey()) {
  const [iv, tag, data] = value
    .split(".")
    .map((v) => Buffer.from(v, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from(owner));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
export function authorizationUrl(state: string, verifier: string) {
  const config = spotifyConfig();
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: spotifyScope,
    state,
    code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    show_dialog: "true",
  }).toString();
  return url.toString();
}
type Tokens = {
  access: string;
  refresh?: string;
  expires: number;
  scope: string;
};
async function requestToken(
  body: URLSearchParams,
  fetcher = fetch,
): Promise<Tokens> {
  let response: Response;
  try {
    response = await fetcher("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new AppError("Spotify could not be reached. Please try again.", 502);
  }
  if (!response.ok)
    throw new AppError(
      response.status === 429
        ? "Spotify is busy. Wait before trying again."
        : "Spotify authorization expired or was refused. Connect again.",
      response.status === 429 ? 429 : 401,
    );
  const data = await response.json();
  if (
    typeof data.access_token !== "string" ||
    !data.access_token ||
    !Number.isFinite(data.expires_in) ||
    data.expires_in <= 0 ||
    data.token_type?.toLowerCase() !== "bearer"
  )
    throw new AppError(
      "Spotify returned an invalid authorization response.",
      502,
    );
  return {
    access: data.access_token,
    refresh:
      typeof data.refresh_token === "string" ? data.refresh_token : undefined,
    expires: Date.now() + data.expires_in * 1000,
    scope: typeof data.scope === "string" ? data.scope : "",
  };
}
export function exchangeCode(code: string, verifier: string, fetcher = fetch) {
  const config = spotifyConfig();
  return requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      code_verifier: verifier,
    }),
    fetcher,
  );
}
export function refreshAccess(refresh: string, fetcher = fetch) {
  return requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: spotifyConfig().clientId,
    }),
    fetcher,
  );
}
export async function spotifyGet(
  path: "/me" | "/me/player/recently-played?limit=20",
  token: string,
  fetcher = fetch,
) {
  let response: Response;
  try {
    response = await fetcher("https://api.spotify.com/v1" + path, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new AppError("Spotify could not be reached. Please try again.", 502);
  }
  if (!response.ok)
    throw new AppError(
      response.status === 403
        ? "Spotify denied access. Check the app's allowed test users and permissions."
        : response.status === 429
          ? "Spotify rate limit reached. Wait before trying again."
          : "Spotify access is unavailable. Try reconnecting.",
      [401, 403, 429].includes(response.status) ? response.status : 502,
    );
  return response.json();
}
export function spotifyIdentity(
  state: State,
  profile: { id?: unknown; display_name?: unknown },
  role: unknown,
  expectedUser?: string,
): Session {
  return privateIdentity(
    state,
    "spotify",
    profile.id,
    profile.display_name,
    role,
    expectedUser,
  );
}
export function recentTracks(data: unknown) {
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as { items?: unknown }).items)
  )
    throw new AppError(
      "Spotify returned an invalid recent-listening response.",
      502,
    );
  return (data as { items: Record<string, unknown>[] }).items
    .slice(0, 20)
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const track = item.track as {
        id?: unknown;
        name?: unknown;
        album?: { name?: unknown };
        artists?: { name?: unknown }[];
      } | null;
      if (
        !track ||
        typeof track.id !== "string" ||
        !/^[a-zA-Z0-9]{22}$/.test(track.id) ||
        typeof track.name !== "string" ||
        typeof item.played_at !== "string" ||
        !Number.isFinite(Date.parse(item.played_at))
      )
        return [];
      return [
        {
          name: track.name.slice(0, 300),
          album:
            typeof track.album?.name === "string"
              ? track.album.name.slice(0, 300)
              : "",
          artists: Array.isArray(track.artists)
            ? track.artists
                .map((a) =>
                  typeof a?.name === "string" ? a.name.slice(0, 100) : "",
                )
                .filter(Boolean)
                .join(", ")
            : "",
          playedAt: item.played_at,
          url: `https://open.spotify.com/track/${track.id}`,
        },
      ];
    });
}
