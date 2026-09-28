import { db, transaction, createSession, deleteSession } from "./store";
import { AppError } from "./model";
import { digest, nonce, seal, unseal } from "./spotify";
import { privateIdentity } from "./private-identity";
import {
  youtubeAuthorizationUrl,
  exchangeYouTubeCode,
  verifyGoogleIdentity,
  validateGoogleClaims,
  youtubeScope,
  youtubeChannels,
  refreshYouTube,
  revokeGoogle,
} from "./youtube";
type Attempt = {
  _id: string;
  browser: string;
  verifier: string;
  oidcNonce: string;
  role: string;
  expectedUser?: string;
  expires: Date;
};
type Connection = {
  _id: string;
  access: string;
  refresh?: string;
  expires: number;
  scope: string;
  version: string;
};
const owner = (user: string) => `youtube:${user}`;
async function tables() {
  const { database } = await db();
  const attempts = database.collection<Attempt>("youtube_oauth");
  await attempts.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  return {
    attempts,
    connections: database.collection<Connection>("youtube_connections"),
  };
}
export async function startYouTube(role: unknown, expectedUser?: string) {
  if (!["audience", "creator", "both"].includes(String(role)))
    throw new AppError("Choose an audience or creator account.");
  const state = nonce(),
    browser = nonce(),
    verifier = nonce(),
    oidcNonce = nonce();
  const url = youtubeAuthorizationUrl(state, verifier, oidcNonce);
  const { attempts } = await tables();
  await attempts.insertOne({
    _id: digest(state),
    browser: digest(browser),
    verifier: seal(verifier, owner(state)),
    oidcNonce,
    role: String(role),
    expectedUser,
    expires: new Date(Date.now() + 600000),
  });
  return { url, browser };
}
export async function finishYouTube(
  input: {
    state: string;
    browser: string;
    code?: string;
    denied: boolean;
    currentUser?: string;
    oldSession?: string;
  },
  fetcher = fetch,
  verifyIdentity = verifyGoogleIdentity,
) {
  if (
    !/^[A-Za-z0-9_-]{43}$/.test(input.state) ||
    !/^[A-Za-z0-9_-]{43}$/.test(input.browser)
  )
    throw new AppError(
      "Google sign-in expired or could not be verified. Start again.",
    );
  const { attempts, connections } = await tables();
  const attempt = await attempts.findOneAndDelete({
    _id: digest(input.state),
    browser: digest(input.browser),
    expires: { $gt: new Date() },
  });
  if (!attempt)
    throw new AppError(
      "Google sign-in expired or could not be verified. Start again.",
    );
  if (input.currentUser && !attempt.expectedUser)
    throw new AppError("Start connecting again from AStra Settings.", 403);
  if (attempt.expectedUser && attempt.expectedUser !== input.currentUser)
    throw new AppError(
      "Your AStra session changed. Start connecting again.",
      403,
    );
  if (input.denied)
    throw new AppError(
      "Google permission was cancelled. Nothing was connected.",
    );
  if (!input.code || input.code.length > 4096)
    throw new AppError("Google did not return an authorization code.");
  const tokens = await exchangeYouTubeCode(
    input.code,
    unseal(attempt.verifier, owner(input.state)),
    fetcher,
  );
  if (!tokens.scope.split(" ").includes(youtubeScope) || !tokens.idToken)
    throw new AppError(
      "Google identity and read-only YouTube permission are required. Nothing was connected.",
      403,
    );
  const profile = await verifyIdentity(tokens.idToken);
  validateGoogleClaims(profile, attempt.oidcNonce);
  const session = await transaction((s) =>
    privateIdentity(
      s,
      "google",
      profile.sub,
      profile.name,
      attempt.role,
      attempt.expectedUser,
    ),
  );
  await connections.replaceOne(
    { _id: session.user },
    {
      access: seal(tokens.access, owner(session.user)),
      refresh: tokens.refresh
        ? seal(tokens.refresh, owner(session.user))
        : undefined,
      expires: tokens.expires,
      scope: tokens.scope,
      version: nonce(),
    },
    { upsert: true },
  );
  const token = await createSession(session);
  await deleteSession(input.oldSession);
  return { token, session };
}
export async function youtubeStatus(user: string) {
  const { connections } = await tables();
  return Boolean(
    await connections.findOne({ _id: user }, { projection: { _id: 1 } }),
  );
}
export async function readYouTubeChannels(user: string, fetcher = fetch) {
  const { connections } = await tables();
  let c = await connections.findOne({ _id: user });
  if (!c) throw new AppError("Connect YouTube first.", 409);
  if (c.expires <= Date.now() + 60000) {
    if (!c.refresh)
      throw new AppError("Reconnect YouTube to renew access.", 401);
    const fresh = await refreshYouTube(unseal(c.refresh, owner(user)), fetcher);
    if (fresh.scope && !fresh.scope.split(" ").includes(youtubeScope))
      throw new AppError("YouTube permission is missing. Reconnect.", 403);
    const next = {
      ...c,
      access: seal(fresh.access, owner(user)),
      refresh: fresh.refresh ? seal(fresh.refresh, owner(user)) : c.refresh,
      expires: fresh.expires,
      scope: fresh.scope || c.scope,
      version: nonce(),
    };
    if (
      !(await connections.replaceOne({ _id: user, version: c.version }, next))
        .matchedCount
    )
      throw new AppError("The connection changed. Try again.", 409);
    c = next;
  }
  const channels = await youtubeChannels(
    unseal(c.access, owner(user)),
    fetcher,
  );
  if (
    !(await connections.findOne(
      { _id: user, version: c.version },
      { projection: { _id: 1 } },
    ))
  )
    throw new AppError("The connection changed. Try again.", 409);
  return channels;
}
export async function disconnectYouTube(user: string, fetcher = fetch) {
  const { connections, attempts } = await tables();
  const c = await connections.findOneAndDelete({ _id: user });
  await attempts.deleteMany({ expectedUser: user });
  // Delete local tokens even when Google is unreachable; tell the user how to revoke manually.
  return {
    revoked: c
      ? await revokeGoogle(unseal(c.refresh || c.access, owner(user)), fetcher)
      : true,
  };
}
