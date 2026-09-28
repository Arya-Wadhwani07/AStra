import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { testAccountsEnabled } from "@/lib/test-access";
import { passwordAccount } from "@/lib/password-auth";
import {
  snapshot,
  mutate,
  register,
  AppError,
  type Session,
} from "@/lib/model";
import {
  read,
  transaction,
  createSession,
  getSession,
  deleteSession,
  switchView,
} from "@/lib/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
function errorResponse(error: unknown) {
  if (error instanceof AppError)
    return reply({ error: error.message }, error.status);
  console.error(
    "AStra request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return reply(
    { error: "The request could not be completed. Please try again." },
    500,
  );
}
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.cookies.get("astra-session")?.value);
    if (!session) throw new AppError("Sign in to continue.", 401);
    if (
      req.nextUrl.searchParams.get("scope") === "creator" &&
      session?.view !== "creator"
    )
      throw new AppError("Creator access required.", 403);
    if (
      req.nextUrl.searchParams.get("scope") === "admin" &&
      session?.view !== "admin"
    )
      throw new AppError("Admin access required.", 403);
    return reply(snapshot(await read(), session));
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || new URL(origin).host !== req.headers.get("host"))
      throw new AppError("Same-origin requests only.", 403);
    if (!req.headers.get("content-type")?.startsWith("application/json"))
      throw new AppError("JSON requests only.", 415);
    const raw = await req.text();
    if (raw.length > 20000)
      throw new AppError("This request is too large.", 413);
    let body: { action?: unknown; data?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      throw new AppError("Invalid request.");
    }
    if (
      !body ||
      typeof body.action !== "string" ||
      !body.data ||
      typeof body.data !== "object" ||
      Array.isArray(body.data)
    )
      throw new AppError("Invalid action data.");
    const action = body.action;
    const data = body.data as Record<string, unknown>;
    const oldToken = req.cookies.get("astra-session")?.value;
    if (action === "signup" || action === "signin") {
      const session = await passwordAccount(action, data);
      const token = await createSession(session);
      await deleteSession(oldToken);
      const response = reply({ state: snapshot(await read(), session) });
      response.cookies.set("astra-session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: req.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 86400,
      });
      return response;
    }
    if (action === "login" || action === "register") {
      if (!testAccountsEnabled())
        throw new AppError(
          "Sign in with Google or Spotify to access your own account.",
          403,
        );
      let session: Session;
      if (action === "register")
        session = await transaction((s) => register(s, data));
      else {
        if (
          !["alex", "mira", "eli", "sam", "jonah", "admin"].includes(
            String(data.account),
          )
        )
          throw new AppError("Choose a sample account.");
        if (data.account === "admin") {
          let expected: string;
          try {
            expected = readFileSync(
              join(process.cwd(), ".environment/config/admin-key"),
              "utf8",
            ).trim();
          } catch {
            throw new AppError(
              "Provision a local administrator key first.",
              403,
            );
          }
          const supplied = typeof data.key === "string" ? data.key : "";
          if (
            Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
            !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
          )
            throw new AppError("Invalid administrator key.", 403);
        }
        session = {
          user: String(data.account),
          view:
            data.account === "admin"
              ? "admin"
              : data.account === "alex"
                ? "audience"
                : "creator",
        };
      }
      await deleteSession(oldToken);
      const token = await createSession(session);
      const response = reply({ state: snapshot(await read(), session) });
      response.cookies.set("astra-session", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: req.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 86400,
      });
      return response;
    }
    const session = await getSession(oldToken);
    if (!session) throw new AppError("Sign in to continue.", 401);
    if (action === "logout") {
      await deleteSession(oldToken);
      const response = reply({ state: null });
      response.cookies.delete("astra-session");
      return response;
    }
    if (action === "switch") {
      await switchView(oldToken!, String(data.view));
      return reply({
        state: snapshot(await read(), await getSession(oldToken)),
      });
    }
    const result = await transaction((s) => mutate(s, session, action, data));
    return reply({ result, state: snapshot(await read(), session) });
  } catch (error) {
    return errorResponse(error);
  }
}
