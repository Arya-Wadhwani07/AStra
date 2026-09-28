"use client";
import { useEffect, useState } from "react";
import { useApp } from "./app-context";
import { Button, SelectField, StatusBadge } from "./ui";
type Track = {
  name: string;
  album: string;
  artists: string;
  playedAt: string;
  url: string;
};
export function SpotifyConnection({ signIn = false }: { signIn?: boolean }) {
  const { state } = useApp();
  const [role, setRole] = useState(
    state?.view === "creator" ? "creator" : "audience",
  );
  const [status, setStatus] = useState<{
    configured?: boolean;
    connected?: boolean;
    privateAccount?: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const callbackError = params.get("spotifyError");
    if (callbackError) setError(callbackError.slice(0, 200));
    if (params.get("spotify") === "connected")
      setNotice("Spotify connected. Your private AStra account is ready.");
    fetch("/api/integrations/spotify", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) {
          setStatus({ configured: false });
          setError(
            "Spotify is unavailable. Check the local server configuration.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [state?.me?.id]);
  async function action(kind: "connect" | "disconnect" | "recent") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/integrations/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: kind, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Spotify request failed.");
      if (kind === "connect") {
        const url = new URL(data.url);
        if (url.origin !== "https://accounts.spotify.com")
          throw new Error("Invalid Spotify authorization address.");
        window.location.assign(url.href);
      }
      if (kind === "disconnect") {
        setStatus({ configured: true, privateAccount: true, connected: false });
        setTracks(null);
        setNotice(
          "Spotify tokens removed from AStra. Your AStra account remains. You can also remove AStra access in Spotify's Apps settings.",
        );
      }
      if (kind === "recent") setTracks(data.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Spotify request failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="stack" aria-label="Spotify account connection">
      <div className="spread">
        <h2>{signIn ? "Your private AStra account" : "Spotify"}</h2>
        <StatusBadge tone={status?.connected ? "success" : "neutral"}>
          {status?.connected
            ? "Connected"
            : status
              ? "Not connected"
              : "Checking connection"}
        </StatusBadge>
      </div>
      <p className="muted">
        Connect with Spotify to see your recent tracks privately. Available to
        audience members and creators. Connecting and listening do not earn
        points; labeled hackathon link-open simulations are separate.
      </p>
      {!status?.privateAccount && (
        <>
          <p className="as-caption">
            Spotify sign-in creates or reopens your own AStra account. Shared
            demo profiles and their sample balances are not transferred. New
            accounts start with zero points. Your Spotify display name becomes
            your AStra name; creator names are public.
          </p>
          <SelectField
            label="For a new account, I’m here as"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="audience">Audience</option>
            <option value="creator">Creator</option>
            <option value="both">Both</option>
          </SelectField>
          <p className="as-caption">
            Returning accounts keep their existing roles. This does not verify
            artist identity or ownership of any Spotify release.
          </p>
        </>
      )}
      {status?.privateAccount && (
        <p className="as-caption">
          Connects to your current private AStra account, keeping its roles and
          points. Separately registered accounts cannot be merged here.
        </p>
      )}
      <p className="as-caption">
        With your permission, AStra receives your Spotify account identity and
        recent tracks. Tokens are encrypted on this server. Track history is
        fetched only when requested, displayed in this tab, and not saved to
        AStra’s database.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="actions">
        <Button
          onClick={() => void action("connect")}
          busy={busy}
          disabled={!status?.configured}
        >
          {status?.connected ? "Reconnect Spotify" : "Connect Spotify"}
        </Button>
        {status?.connected && (
          <>
            <Button
              variant="secondary"
              onClick={() => void action("recent")}
              busy={busy}
            >
              Show recent tracks
            </Button>
            <Button
              variant="quiet"
              onClick={() => void action("disconnect")}
              busy={busy}
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
      {tracks && (
        <div className="stack">
          <h3>Recent tracks · from Spotify</h3>
          <p className="as-caption">
            Recent activity is not proof of full playback or a complete album
            listen. No points are awarded.
          </p>
          {!tracks.length && <p>No recent tracks were returned by Spotify.</p>}
          {tracks.map((track, i) => (
            <div className="content-item" key={track.url + track.playedAt + i}>
              <a href={track.url} target="_blank" rel="noopener noreferrer">
                {track.name} · Open in Spotify
              </a>
              <p className="muted">
                {track.artists} · {track.album}
              </p>
              <time className="as-caption" dateTime={track.playedAt}>
                {new Date(track.playedAt).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
      <a
        className="as-caption"
        href="https://www.spotify.com/account/apps/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Manage permissions in Spotify
      </a>
    </section>
  );
}
