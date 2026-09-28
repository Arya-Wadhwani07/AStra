import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/model";
import { getSession, read } from "@/lib/store";
import { tokenKey } from "@/lib/spotify";
import { youtubeConfig } from "@/lib/youtube";
import {
  startYouTube,
  youtubeStatus,
  readYouTubeChannels,
  disconnectYouTube,
} from "@/lib/youtube-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const failure = (e: unknown) =>
  reply(
    {
      error:
        e instanceof AppError
          ? e.message
          : "YouTube connection unavailable. Check local server configuration.",
    },
    e instanceof AppError ? e.status : 503,
  );
async function account(req: NextRequest) {
  const session = await getSession(req.cookies.get("astra-session")?.value);
  return session
    ? (await read()).users.find((u) => u.id === session.user)
    : undefined;
}
export async function GET(req: NextRequest) {
  try {
    youtubeConfig();
    tokenKey();
    const user = await account(req);
    if (!user) throw new AppError("Sign in to AStra first.", 401);
    return reply({
      configured: true,
      privateAccount: Boolean(user?.authProvider),
      connected: user?.authProvider ? await youtubeStatus(user.id) : false,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const config = youtubeConfig();
    if (
      req.headers.get("origin") !== config.origin ||
      req.headers.get("host") !== new URL(config.origin).host
    )
      throw new AppError(
        "Use the configured AStra address to connect YouTube.",
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
    const user = await account(req);
    if (!user?.authProvider)
      throw new AppError("Sign in to your own AStra account first.", 401);
    if (body.action === "connect") {
      const started = await startYouTube(
        body.role,
        user?.authProvider ? user.id : undefined,
      );
      const response = reply({ url: started.url });
      response.cookies.set("astra-youtube-flow", started.browser, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.origin.startsWith("https:"),
        path: "/api/integrations/youtube",
        maxAge: 600,
      });
      return response;
    }
    if (!user?.authProvider)
      throw new AppError("Sign in to your private AStra account first.", 401);
    if (body.action === "channels")
      return reply({
        channels: await readYouTubeChannels(user.id),
        pointsAwarded: 0,
      });
    if (body.action === "disconnect")
      return reply({ connected: false, ...(await disconnectYouTube(user.id)) });
    throw new AppError("Unknown YouTube action.", 404);
  } catch (e) {
    return failure(e);
  }
}
