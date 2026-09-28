import { db, transaction, createSession, deleteSession } from "./store";
import { AppError } from "./model";
import {
  nonce,
  digest,
  seal,
  unseal,
  authorizationUrl,
  exchangeCode,
  spotifyGet,
  spotifyIdentity,
  refreshAccess,
  recentTracks,
  spotifyScope,
} from "./spotify";

type Attempt = {
  _id: string;
  browser: string;
  verifier: string;
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
async function tables() {
  const { database } = await db();
  const attempts = database.collection<Attempt>("spotify_oauth");
  await attempts.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  return {
    attempts,
    connections: database.collection<Connection>("spotify_connections"),
  };
}
export async function startSpotify(role: unknown, expectedUser?: string) {
  if (!["audience", "creator", "both"].includes(String(role)))
    throw new AppError("Choose an audience or creator account.");
  const state = nonce(),
    browser = nonce(),
    verifier = nonce();
  const url = authorizationUrl(state, verifier);
  const encrypted = seal(verifier, state);
  const { attempts } = await tables();
  await attempts.insertOne({
    _id: digest(state),
    browser: digest(browser),
    verifier: encrypted,
    role: String(role),
    expectedUser,
    expires: new Date(Date.now() + 600000),
  });
  return { url, browser };
}
export async function finishSpotify(
  input: {
    state: string;
    browser: string;
    code?: string;
    denied: boolean;
    currentUser?: string;
    oldSession?: string;
  },
  fetcher = fetch,
) {
  if (
    !/^[A-Za-z0-9_-]{43}$/.test(input.state) ||
    !/^[A-Za-z0-9_-]{43}$/.test(input.browser)
  )
    throw new AppError(
      "Spotify sign-in expired or could not be verified. Start again.",
    );
  const { attempts, connections } = await tables();
  // Atomic consumption prevents callback replay, including parallel requests.
  const attempt = await attempts.findOneAndDelete({
    _id: digest(input.state),
    browser: digest(input.browser),
    expires: { $gt: new Date() },
  });
  if (!attempt)
    throw new AppError(
      "Spotify sign-in expired or could not be verified. Start again.",
    );
  if (attempt.expectedUser && attempt.expectedUser !== input.currentUser)
    throw new AppError(
      "Your AStra session changed. Start connecting again.",
      403,
    );
  if (input.denied)
    throw new AppError(
      "Spotify permission was cancelled. Nothing was connected.",
    );
  if (!input.code || input.code.length > 2048)
    throw new AppError("Spotify did not return an authorization code.");
  const tokens = await exchangeCode(
    input.code,
    unseal(attempt.verifier, input.state),
    fetcher,
  );
  if (!tokens.scope.split(" ").includes(spotifyScope))
    throw new AppError(
      "Recent-listening permission was not granted. Nothing was connected.",
      403,
    );
  const profile = await spotifyGet("/me", tokens.access, fetcher);
  const session = await transaction((s) =>
    spotifyIdentity(s, profile, attempt.role, attempt.expectedUser),
  );
  await connections.replaceOne(
    { _id: session.user },
    {
      access: seal(tokens.access, session.user),
      refresh: tokens.refresh ? seal(tokens.refresh, session.user) : undefined,
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
export async function connectionStatus(user: string) {
  const { connections } = await tables();
  const connection = await connections.findOne(
    { _id: user },
    { projection: { _id: 1 } },
  );
  return Boolean(connection);
}
export async function disconnectSpotify(user: string) {
  const { connections, attempts } = await tables();
  await connections.deleteOne({ _id: user });
  await attempts.deleteMany({ expectedUser: user });
}
export async function readRecentSpotify(user: string, fetcher = fetch) {
  const { connections } = await tables();
  let connection = await connections.findOne({ _id: user });
  if (!connection) throw new AppError("Connect Spotify first.", 409);
  if (connection.expires <= Date.now() + 60000) {
    if (!connection.refresh)
      throw new AppError("Reconnect Spotify to renew access.", 401);
    const fresh = await refreshAccess(
      unseal(connection.refresh, user),
      fetcher,
    );
    if (fresh.scope && !fresh.scope.split(" ").includes(spotifyScope))
      throw new AppError(
        "Spotify listening permission is missing. Reconnect.",
        403,
      );
    const next: Connection = {
      ...connection,
      access: seal(fresh.access, user),
      refresh: fresh.refresh ? seal(fresh.refresh, user) : connection.refresh,
      expires: fresh.expires,
      scope: fresh.scope || connection.scope,
      version: nonce(),
    };
    const saved = await connections.replaceOne(
      { _id: user, version: connection.version },
      next,
    );
    if (!saved.matchedCount)
      throw new AppError("The connection changed. Please try again.", 409);
    connection = next;
  }
  const tracks = recentTracks(
    await spotifyGet(
      "/me/player/recently-played?limit=20",
      unseal(connection.access, user),
      fetcher,
    ),
  );
  if (
    !(await connections.findOne(
      { _id: user, version: connection.version },
      { projection: { _id: 1 } },
    ))
  )
    throw new AppError("The connection changed. Please try again.", 409);
  return tracks;
}
