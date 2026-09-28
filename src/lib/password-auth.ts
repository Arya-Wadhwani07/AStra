import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { AppError, register, type Session } from "./model";
import { db, read, transaction } from "./store";

export function normalizeEmail(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  )
    throw new AppError("Enter a valid email address.");
  return value.trim().toLowerCase();
}
export function validatePassword(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length < 15 || value.length > 128)
    throw new AppError("Use a password between 15 and 128 characters.");
}
let hashing = 0;
async function derive(password: string, salt: string): Promise<Buffer> {
  if (hashing >= 2)
    throw new AppError("Sign-in is busy. Please try again shortly.", 429);
  hashing++;
  try {
    return await new Promise((resolve, reject) =>
      scrypt(
        password,
        salt,
        64,
        { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 },
        (error, key) => (error ? reject(error) : resolve(key)),
      ),
    );
  } finally {
    hashing--;
  }
}
export async function hashPassword(password: string) {
  validatePassword(password);
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, stored?: string) {
  // Unknown accounts still perform the same expensive hash.
  const [, salt, digest] = stored?.split("$") || [];
  const valid =
    /^[a-f0-9]{32}$/.test(salt || "") && /^[a-f0-9]{128}$/.test(digest || "");
  const actual = await derive(password, valid ? salt : "0".repeat(32));
  const expected = Buffer.from(valid ? digest : "0".repeat(128), "hex");
  return timingSafeEqual(actual, expected) && Boolean(stored) && valid;
}
export async function passwordAccount(
  action: "signup" | "signin",
  data: Record<string, unknown>,
): Promise<Session> {
  const email = normalizeEmail(data.email);
  validatePassword(data.password);
  const emailKey = createHash("sha256").update(email).digest("hex");
  const { database } = await db();
  const attempts = database.collection<{
    _id: string;
    count: number;
    expires: Date;
  }>("auth_attempts");
  await attempts.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  const window = Math.floor(Date.now() / 900000);
  const attempt = await attempts.findOneAndUpdate(
    { _id: `${emailKey}:${window}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expires: new Date((window + 2) * 900000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!attempt || attempt.count > 10)
    throw new AppError(
      "Too many attempts. Please try again in 15 minutes.",
      429,
    );
  if (action === "signup") {
    const passwordHash = await hashPassword(data.password);
    return transaction((s) => {
      if (s.users.some((u) => u.emailLoginHash === emailKey))
        throw new AppError(
          "Unable to create this account. Try signing in instead.",
          409,
        );
      const session = register(s, data);
      const user = s.users.find((u) => u.id === session.user)!;
      Object.assign(user, {
        authProvider: "password",
        email,
        emailLoginHash: emailKey,
        passwordHash,
        settings: { email: false, motion: true, privateProfile: true },
        location: "",
        timezone: "",
        languages: "",
        experience: "",
        audienceSize: "",
      });
      return session;
    });
  }
  const user = (await read()).users.find(
    (u) => u.emailLoginHash === emailKey && u.authProvider === "password",
  );
  if (!(await verifyPassword(data.password, user?.passwordHash)) || !user)
    throw new AppError("Email or password is incorrect.", 401);
  return {
    user: user.id,
    view: user.roles.includes("creator") ? "creator" : "audience",
  };
}
