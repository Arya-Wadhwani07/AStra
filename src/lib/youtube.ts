import { createHash } from "node:crypto";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { AppError } from "./model";
import { youtubeContent } from "./youtube-content";

export const youtubeScope = "https://www.googleapis.com/auth/youtube.readonly";
export function youtubeConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri)
    throw new AppError(
      "Google account connection is not configured on this server.",
      503,
    );
  let u: URL;
  try {
    u = new URL(redirectUri);
  } catch {
    throw new AppError("Google callback configuration is invalid.", 503);
  }
  if (
    (u.protocol !== "https:" &&
      !(u.protocol === "http:" && u.hostname === "127.0.0.1")) ||
    u.username ||
    u.password ||
    u.search ||
    u.hash ||
    u.pathname !== "/api/integrations/youtube/callback"
  )
    throw new AppError("Google callback configuration is invalid.", 503);
  return { clientId, clientSecret, redirectUri, origin: u.origin };
}
export function youtubeAuthorizationUrl(
  state: string,
  verifier: string,
  oidcNonce: string,
) {
  const c = youtubeConfig();
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    response_type: "code",
    scope: `openid profile ${youtubeScope}`,
    state,
    nonce: oidcNonce,
    code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    access_type: "offline",
    prompt: "consent select_account",
  }).toString();
  return u.toString();
}
async function googleRequest(url: string, init: RequestInit, fetcher = fetch) {
  let response: Response;
  try {
    response = await fetcher(url, {
      ...init,
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new AppError("Google could not be reached. Please try again.", 502);
  }
  if (!response.ok)
    throw new AppError(
      response.status === 403
        ? "Google denied access. Check YouTube Data API v3, test users and permissions."
        : response.status === 429
          ? "Google rate limit reached. Please wait before retrying."
          : "Google access was refused or expired. Try connecting again.",
      [401, 403, 429].includes(response.status) ? response.status : 502,
    );
  try {
    return await response.json();
  } catch {
    throw new AppError("Google returned an invalid response.", 502);
  }
}
async function requestToken(params: Record<string, string>, fetcher = fetch) {
  const c = youtubeConfig();
  const data = await googleRequest(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.clientId,
        client_secret: c.clientSecret,
        ...params,
      }),
    },
    fetcher,
  );
  if (
    typeof data.access_token !== "string" ||
    !data.access_token ||
    data.token_type?.toLowerCase() !== "bearer" ||
    !Number.isFinite(data.expires_in) ||
    data.expires_in <= 0
  )
    throw new AppError(
      "Google returned an invalid authorization response.",
      502,
    );
  return {
    access: data.access_token as string,
    refresh:
      typeof data.refresh_token === "string" ? data.refresh_token : undefined,
    idToken: typeof data.id_token === "string" ? data.id_token : undefined,
    expires: Date.now() + data.expires_in * 1000,
    scope: typeof data.scope === "string" ? data.scope : "",
  };
}
export const exchangeYouTubeCode = (
  code: string,
  verifier: string,
  fetcher = fetch,
) =>
  requestToken(
    {
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: youtubeConfig().redirectUri,
    },
    fetcher,
  );
export const refreshYouTube = (refresh: string, fetcher = fetch) =>
  requestToken(
    { grant_type: "refresh_token", refresh_token: refresh },
    fetcher,
  );

const verifierClient = new OAuth2Client();
export async function verifyGoogleIdentity(
  idToken: string,
): Promise<TokenPayload> {
  try {
    const ticket = await verifierClient.verifyIdToken({
      idToken,
      audience: youtubeConfig().clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error("Empty identity");
    return payload;
  } catch {
    throw new AppError(
      "Google identity could not be verified. Connect again.",
      401,
    );
  }
}
export function validateGoogleClaims(
  profile: TokenPayload,
  expectedNonce: string,
) {
  if (
    !["accounts.google.com", "https://accounts.google.com"].includes(
      profile.iss,
    ) ||
    profile.aud !== youtubeConfig().clientId ||
    !Number.isFinite(profile.exp) ||
    profile.exp * 1000 <= Date.now() ||
    !profile.sub ||
    (profile as TokenPayload & { nonce?: string }).nonce !== expectedNonce
  )
    throw new AppError(
      "Google identity could not be verified. Connect again.",
      401,
    );
}
export async function youtubeChannels(token: string, fetcher = fetch) {
  const data = await googleRequest(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&maxResults=50",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
    fetcher,
  );
  if (!Array.isArray(data.items))
    throw new AppError("YouTube returned invalid channel data.", 502);
  return data.items
    .slice(0, 50)
    .flatMap((item: { id?: unknown; snippet?: { title?: unknown } }) =>
      typeof item?.id === "string" &&
      /^UC[A-Za-z0-9_-]{22}$/.test(item.id) &&
      typeof item.snippet?.title === "string"
        ? [
            {
              title: item.snippet.title.slice(0, 200),
              url: `https://www.youtube.com/channel/${item.id}`,
            },
          ]
        : [],
    );
}
export async function revokeGoogle(token: string, fetcher = fetch) {
  try {
    const response = await fetcher("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      signal: AbortSignal.timeout(12000),
      redirect: "error",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function youtubeVideo(value: unknown, fetcher = fetch) {
  const content = youtubeContent(value);
  if (!content) throw new AppError("Enter a YouTube video or Shorts link.");
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key)
    throw new AppError(
      "YouTube previews are not configured. Use Open in YouTube.",
      503,
    );
  const u = new URL("https://www.googleapis.com/youtube/v3/videos");
  // Keep the API key in a header, never in a client URL or a logged query string.
  u.search = new URLSearchParams({
    part: "snippet,status",
    id: content.id,
    fields:
      "items(id,snippet(title,channelTitle),status(privacyStatus,embeddable,madeForKids))",
  }).toString();
  const data = await googleRequest(
    u.href,
    { headers: { "X-Goog-Api-Key": key } },
    fetcher,
  );
  const item = Array.isArray(data.items) ? data.items[0] : undefined;
  if (
    !item ||
    item.id !== content.id ||
    item.status?.privacyStatus !== "public"
  )
    throw new AppError(
      "This video is private, unavailable or not public. Use a public YouTube link.",
      404,
    );
  // Fail closed when age/kids status is unavailable. Never load a tracking player for kids' content.
  const embeddable =
    item.status.embeddable === true && item.status.madeForKids === false;
  return {
    url: content.url,
    title:
      typeof item.snippet?.title === "string"
        ? item.snippet.title.slice(0, 300)
        : "YouTube video",
    channel:
      typeof item.snippet?.channelTitle === "string"
        ? item.snippet.channelTitle.slice(0, 200)
        : "",
    embeddable,
    message: embeddable
      ? "Preview available"
      : "Open on YouTube; an embedded preview is not available here.",
  };
}
