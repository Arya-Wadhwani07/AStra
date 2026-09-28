"use client";
import { useEffect, useState } from "react";
import { useApp } from "./app-context";
import { Button, SelectField, StatusBadge } from "./ui";
export function YouTubeConnection() {
  const { state } = useApp();
  const [role, setRole] = useState(
    state?.view === "creator" ? "creator" : "audience",
  );
  const [status, setStatus] = useState<{
    configured?: boolean;
    connected?: boolean;
    privateAccount?: boolean;
  } | null>(null);
  const [channels, setChannels] = useState<
    { title: string; url: string }[] | null
  >(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    setChannels(null);
    const query = new URLSearchParams(window.location.search);
    setError(query.get("youtubeError")?.slice(0, 200) || "");
    if (query.get("youtube") === "connected")
      setNotice("YouTube connected. Your private AStra account is ready.");
    fetch("/api/integrations/youtube", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) {
          setStatus({ configured: false });
          setError(
            "YouTube connection is unavailable. Check the local server configuration.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [state?.me?.id]);
  async function action(kind: "connect" | "channels" | "disconnect") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/integrations/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: kind, role }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "YouTube request failed.");
      if (kind === "connect") {
        const url = new URL(data.url);
        if (
          url.origin !== "https://accounts.google.com" ||
          url.pathname !== "/o/oauth2/v2/auth"
        )
          throw new Error("Invalid Google authorization address.");
        window.location.assign(url.href);
      } else if (kind === "channels") setChannels(data.channels);
      else {
        setStatus({ configured: true, privateAccount: true, connected: false });
        setChannels(null);
        setNotice(
          data.revoked
            ? "YouTube tokens deleted from AStra and Google access revoked. Your AStra sign-in identity and account remain."
            : "YouTube tokens deleted locally. Google could not confirm revocation; remove access using Google permissions below. Your AStra account remains.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube request failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="stack" aria-label="YouTube account connection">
      <div className="spread">
        <h2>YouTube</h2>
        <StatusBadge tone={status?.connected ? "success" : "neutral"}>
          {status?.connected
            ? "Connected"
            : status
              ? "Not connected"
              : "Checking connection"}
        </StatusBadge>
      </div>
      <p className="muted">
        Connect through Google as an audience member or creator. You can check
        the YouTube channels associated with your account. This does not give
        AStra your watch history or YouTube Music listening history.
      </p>
      {!status?.privateAccount ? (
        <>
          <p className="as-caption">
            Creates or reopens a private AStra account. Sample profiles and
            balances are not transferred. New accounts start at zero points.
            Your Google display name becomes your AStra name; creator names are
            public.
          </p>
          <SelectField
            label="For a new YouTube-connected account, I’m here as"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="audience">Audience</option>
            <option value="creator">Creator</option>
            <option value="both">Both</option>
          </SelectField>
          <p className="as-caption">
            Returning accounts keep their existing roles. To link Spotify and
            YouTube to one account, sign in with one first, then connect the
            other from Settings.
          </p>
        </>
      ) : (
        <p className="as-caption">
          Connects to your current private AStra account, keeping its roles and
          points. Accounts already registered separately cannot be merged here.
        </p>
      )}
      <p className="as-caption">
        Google asks for basic profile and read-only YouTube access. AStra
        encrypts tokens on this local server and reads channel names only when
        you ask; it does not save a channel list. Connection does not verify
        ownership of a posted video or award points.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="actions">
        <Button
          busy={busy}
          disabled={!status?.configured}
          onClick={() => void action("connect")}
        >
          {status?.connected ? "Reconnect YouTube" : "Connect YouTube"}
        </Button>
        {status?.connected && (
          <>
            <Button
              variant="secondary"
              busy={busy}
              onClick={() => void action("channels")}
            >
              Check my YouTube channels
            </Button>
            <Button
              variant="quiet"
              busy={busy}
              onClick={() => void action("disconnect")}
            >
              Disconnect YouTube
            </Button>
          </>
        )}
      </div>
      {channels && (
        <div className="stack">
          <h3>Your YouTube channels</h3>
          {!channels.length && (
            <p>
              No channel was returned. Audience accounts do not need to publish
              a channel to connect.
            </p>
          )}
          {channels.map((c) => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.title} · Open on YouTube
            </a>
          ))}
        </div>
      )}
      <a
        className="as-caption"
        href="https://myaccount.google.com/connections"
        target="_blank"
        rel="noopener noreferrer"
      >
        Manage access in Google permissions
      </a>
    </section>
  );
}
