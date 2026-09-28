import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/model";
import { getSession } from "@/lib/store";
import { youtubeConfig } from "@/lib/youtube";
import { finishYouTube } from "@/lib/youtube-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  let origin: string;
  try {
    origin = youtubeConfig().origin;
  } catch {
    return new NextResponse("Google connection is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  let response: NextResponse;
  try {
    const oldSession = req.cookies.get("astra-session")?.value;
    const current = await getSession(oldSession);
    if (!current)
      throw new AppError("Sign in to AStra before connecting YouTube.", 401);
    const result = await finishYouTube({
      state: req.nextUrl.searchParams.get("state") || "",
      browser: req.cookies.get("astra-youtube-flow")?.value || "",
      code: req.nextUrl.searchParams.get("code") || undefined,
      denied: req.nextUrl.searchParams.has("error"),
      currentUser: current?.user,
      oldSession,
    });
    response = NextResponse.redirect(
      new URL("/settings?youtube=connected", origin),
      303,
    );
    response.cookies.set("astra-session", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https:"),
      path: "/",
      maxAge: 86400,
    });
  } catch (e) {
    const current = await getSession(req.cookies.get("astra-session")?.value);
    const url = new URL(current ? "/settings" : "/signin", origin);
    url.searchParams.set(
      "youtubeError",
      e instanceof AppError
        ? e.message
        : "YouTube connection failed. Please try again.",
    );
    response = NextResponse.redirect(url, 303);
  }
  response.cookies.set("astra-youtube-flow", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https:"),
    path: "/api/integrations/youtube",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
