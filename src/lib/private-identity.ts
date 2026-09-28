import { createHash } from "node:crypto";
import { AppError, register, type State, type Session } from "./model";

// Only identities obtained by the server from the provider may reach this function.
// Never merge by email or attach private identities to selectable demo accounts.
export function privateIdentity(
  state: State,
  provider: "spotify" | "google",
  subject: unknown,
  displayName: unknown,
  role: unknown,
  expectedUser?: string,
): Session {
  const label = provider === "spotify" ? "Spotify" : "Google";
  if (typeof subject !== "string" || !subject || subject.length > 256)
    throw new AppError(`${label} did not return an account identity.`, 502);
  if (!["audience", "creator", "both"].includes(String(role)))
    throw new AppError("Choose an audience or creator account.");
  const field =
    provider === "spotify" ? "spotifySubjectHash" : "googleSubjectHash";
  const hash = createHash("sha256").update(subject).digest("hex");
  let user = state.users.find((u) => u[field] === hash && u.authProvider);
  if (expectedUser) {
    const current = state.users.find((u) => u.id === expectedUser);
    if (
      !current?.authProvider ||
      (user && user.id !== current.id) ||
      (current[field] && current[field] !== hash)
    )
      throw new AppError(
        `That ${label} account does not match your signed-in AStra account.`,
        409,
      );
    user = current;
  }
  if (!user) {
    const name =
      typeof displayName === "string" && displayName.trim()
        ? displayName.trim().slice(0, 80)
        : `${label} member`;
    const session = register(state, { name, role });
    user = state.users.find((u) => u.id === session.user)!;
    user.authProvider = provider;
    user.settings = { email: false, motion: true, privateProfile: true };
    user.location =
      user.timezone =
      user.languages =
      user.experience =
      user.audienceSize =
        "";
  }
  user[field] = hash;
  return {
    user: user.id,
    view:
      role !== "audience" && user.roles.includes("creator")
        ? "creator"
        : user.roles.includes("audience")
          ? "audience"
          : "creator",
  };
}
