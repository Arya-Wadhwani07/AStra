// URL parsing only. A valid URL does not prove the video exists or is owned by its poster.
export function youtubeContent(value: unknown) {
  if (typeof value !== "string" || value.length > 1000) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return null;
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
              u.hostname,
            )
          ? u.pathname === "/watch"
            ? u.searchParams.get("v")
            : u.pathname.startsWith("/shorts/")
              ? u.pathname.slice(8)
              : null
          : null;
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return {
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      embed: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  } catch {
    return null;
  }
}
