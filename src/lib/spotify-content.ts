/** Shared URL parsing only: no OAuth tokens or server configuration in the browser. */
export function spotifyContent(value: unknown) {
  if (typeof value !== "string" || value.length > 1000) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "open.spotify.com" ||
    url.username ||
    url.password ||
    url.port
  )
    return null;
  const match = url.pathname.match(
    /^\/(?:intl-[a-zA-Z-]+\/)?(track|album)\/([a-zA-Z0-9]{22})\/?$/,
  );
  if (!match) return null;
  const [, kind, id] = match;
  return {
    kind,
    id,
    url: `https://open.spotify.com/${kind}/${id}`,
    embed: `https://open.spotify.com/embed/${kind}/${id}?theme=0`,
  };
}
