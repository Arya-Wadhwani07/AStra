import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/model";
import { getSession, read } from "@/lib/store";
import { spotifyConfig, tokenKey } from "@/lib/spotify";
import {
  startSpotify,
  connectionStatus,
  disconnectSpotify,
  readRecentSpotify,
} from "@/lib/spotify-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const failure = (error: unknown) =>
  reply(
    {
      error:
        error instanceof AppError
          ? error.message
          : "Spotify connection unavailable. Check local server configuration.",
    },
    error instanceof AppError ? error.status : 503,
  );
async function account(req: NextRequest) {
  const session = await getSession(req.cookies.get("astra-session")?.value);
  const user = session
    ? (await read()).users.find((u) => u.id === session.user)
    : undefined;
  return { session, user };
}
export async function GET(req: NextRequest) {
  try {
    spotifyConfig();
    tokenKey();
    const { user } = await account(req);
    if (!user) throw new AppError("Sign in to AStra first.", 401);
    return reply({
      configured: true,
      privateAccount: Boolean(user?.authProvider),
      connected: user?.authProvider ? await connectionStatus(user.id) : false,
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(req: NextRequest) {
  try {
    const config = spotifyConfig();
    if (
      req.headers.get("origin") !== config.origin ||
      req.headers.get("host") !== new URL(config.origin).host
    )
      throw new AppError(
        "Use the configured AStra address to connect Spotify.",
        403,
      );
    if (!req.headers.get("content-type")?.startsWith("application/json"))
      throw new AppError("JSON requests only.", 415);
    const raw = await req.text();
    if (raw.length > 2000) throw new AppError("Request too large.", 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new AppError("Invalid request.");
    }
    if (!body || typeof body !== "object")
      throw new AppError("Invalid request.");
    const { user } = await account(req);
    if (!user?.authProvider)
      throw new AppError("Sign in to your own AStra account first.", 401);
    if (body.action === "connect") {
      const started = await startSpotify(
        body.role,
        user?.authProvider ? user.id : undefined,
      );
      const response = reply({ url: started.url });
      response.cookies.set("astra-spotify-flow", started.browser, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.origin.startsWith("https:"),
        path: "/api/integrations/spotify",
        maxAge: 600,
      });
      return response;
    }
    if (!user?.authProvider)
      throw new AppError(
        "Sign in to your private Spotify-backed AStra account first.",
        401,
      );
    if (body.action === "disconnect") {
      await disconnectSpotify(user.id);
      return reply({ connected: false });
    }
    if (body.action === "recent")
      return reply({
        tracks: await readRecentSpotify(user.id),
        pointsAwarded: 0,
      });
    throw new AppError("Unknown Spotify action.", 404);
  } catch (error) {
    return failure(error);
  }
}
