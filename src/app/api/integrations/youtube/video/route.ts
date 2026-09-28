import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/model";
import { getSession } from "@/lib/store";
import { youtubeVideo } from "@/lib/youtube";
import { youtubeContent } from "@/lib/youtube-content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cache = new Map<
  string,
  { expires: number; value: Awaited<ReturnType<typeof youtubeVideo>> }
>();
const limits = new Map<string, { expires: number; count: number }>();
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.cookies.get("astra-session")?.value);
    if (!session) throw new AppError("Sign in to load a YouTube preview.", 401);
    const content = youtubeContent(req.nextUrl.searchParams.get("url"));
    if (!content) throw new AppError("Enter a YouTube video or Shorts link.");
    const cached = cache.get(content.id);
    let video =
      cached && cached.expires > Date.now() ? cached.value : undefined;
    if (!video) {
      for (const [id, limit] of limits)
        if (limit.expires <= Date.now()) limits.delete(id);
      const limit = limits.get(session.user) || {
        expires: Date.now() + 60000,
        count: 0,
      };
      if (limit.count >= 20 || limits.size >= 1000)
        throw new AppError(
          "Too many previews. Wait a minute before trying again.",
          429,
        );
      limit.count++;
      limits.set(session.user, limit);
      video = await youtubeVideo(content.url);
      if (cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(content.id, { value: video, expires: Date.now() + 300000 });
    }
    return NextResponse.json(video, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof AppError
            ? e.message
            : "YouTube preview unavailable. Open the video on YouTube.",
      },
      {
        status: e instanceof AppError ? e.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
