import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/model";
import { getSession } from "@/lib/store";
import { spotifyConfig } from "@/lib/spotify";
import { finishSpotify } from "@/lib/spotify-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  let origin: string;
  try {
    origin = spotifyConfig().origin;
  } catch {
    return new NextResponse("Spotify is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  let response: NextResponse;
  try {
    const oldSession = req.cookies.get("astra-session")?.value;
    const current = await getSession(oldSession);
    const result = await finishSpotify({
      state: req.nextUrl.searchParams.get("state") || "",
      browser: req.cookies.get("astra-spotify-flow")?.value || "",
      code: req.nextUrl.searchParams.get("code") || undefined,
      denied: req.nextUrl.searchParams.has("error"),
      currentUser: current?.user,
      oldSession,
    });
    response = NextResponse.redirect(
      new URL("/settings?spotify=connected", origin),
      303,
    );
    response.cookies.set("astra-session", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https:"),
      path: "/",
      maxAge: 86400,
    });
  } catch (error) {
    // Never echo provider bodies, authorization codes or tokens.
    const url = new URL("/signin", origin);
    url.searchParams.set(
      "spotifyError",
      error instanceof AppError
        ? error.message
        : "Spotify connection failed. Please try again.",
    );
    response = NextResponse.redirect(url, 303);
  }
  response.cookies.set("astra-spotify-flow", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https:"),
    path: "/api/integrations/spotify",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
