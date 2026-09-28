"use client";
import { useState } from "react";
import { youtubeContent } from "../lib/youtube-content";
import { useApp } from "./app-context";
import { Button, Field, Form, Go, StatusBadge } from "./ui";
export function YouTubePreview({ url }: { url: string }) {
  const [video, setVideo] = useState<{
    title: string;
    channel: string;
    embeddable: boolean;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const content = youtubeContent(url);
  if (!content) return null;
  return (
    <div className="spotify-preview">
      {!video && (
        <Button
          variant="secondary"
          busy={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const r = await fetch(
                `/api/integrations/youtube/video?url=${encodeURIComponent(content.url)}`,
                { cache: "no-store" },
              );
              const data = await r.json();
              if (!r.ok) throw new Error(data.error);
              setVideo(data);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Preview unavailable.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Load YouTube preview
        </Button>
      )}
      <p className="as-caption">
        Optional preview: loading connects to Google and, if permitted, loads
        YouTube’s player. No autoplay, viewing verification or playback rewards.
      </p>
      {error && <p role="alert">{error}</p>}
      {video && (
        <>
          <strong>{video.title}</strong>
          <p className="as-caption">{video.channel} · YouTube</p>
          {video.embeddable ? (
            <iframe
              className="spotify-preview__frame"
              src={content.embed}
              width="100%"
              height="315"
              title={`YouTube: ${video.title}`}
              loading="lazy"
              allow="encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <p>{video.message}</p>
          )}
        </>
      )}
      <a href={content.url} target="_blank" rel="noopener noreferrer">
        Open video on YouTube (no demo claim)
      </a>
    </div>
  );
}
export function YouTubeFeedReward({
  campaignId,
  url,
}: {
  campaignId: string;
  url: string;
}) {
  const { state, act, busy } = useApp();
  const campaign = state?.demoCampaigns.find((c) => c.id === campaignId);
  const content = youtubeContent(url);
  if (!campaign || !content) return null;
  return (
    <section
      className="spotify-feed-reward"
      aria-label="YouTube video and demo reward"
    >
      <YouTubePreview key={content.id} url={content.url} />
      <StatusBadge tone={campaign.claimed ? "success" : "points"}>
        {campaign.claimed
          ? "Demo points received"
          : `+${campaign.demoPoints} demo points`}
      </StatusBadge>
      <p className="as-caption">
        Hackathon link-open simulation, once per account. Not a verified view or
        a reward for watching. Points apply to simulated checkout only.
      </p>
      {!state?.me ? (
        <Go href="/signin">Sign in for the demo reward</Go>
      ) : campaign.owner === state.me.id ? (
        <p className="as-caption">Creators cannot claim their own campaign.</p>
      ) : (
        <Button
          variant="secondary"
          busy={busy}
          icon="arrow-up-right"
          onClick={async () => {
            const result = await act(
              "demo-link-open",
              { id: campaignId },
              "Demo points updated. No viewing verified.",
            );
            const destination = youtubeContent(
              (result.result as { url?: string } | undefined)?.url,
            );
            if (result.ok && destination)
              window.location.assign(destination.url);
          }}
        >
          {campaign.claimed
            ? "Open in YouTube · already rewarded"
            : `Open in YouTube · +${campaign.demoPoints} demo points`}
        </Button>
      )}
    </section>
  );
}
export function YouTubePostForm() {
  const [link, setLink] = useState(""),
    [published, setPublished] = useState(false);
  const content = youtubeContent(link);
  return (
    <div className="stack">
      <h2>Share a YouTube video</h2>
      <p className="muted">
        Paste a public video or Shorts link. Followers will see it in their
        feed; account connection is optional for sharing a public link.
      </p>
      <Form
        action="campaign"
        transform={(data) => ({ ...data, demo: true })}
        success="YouTube post published. Demo click reward enabled."
        onDone={() => setPublished(true)}
      >
        <Field
          label="YouTube video or Shorts link"
          name="link"
          type="url"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setPublished(false);
          }}
          required
          maxLength={1000}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <Field label="Post title" name="title" required maxLength={100} />
        <Field
          label="A message for your audience"
          name="rule"
          multiline
          required
          maxLength={500}
        />
        <Field
          label="Demo points for opening the link once"
          name="demoPoints"
          type="number"
          min={1}
          max={100}
          step={1}
          defaultValue={1}
          required
        />
        <p className="as-caption">
          One simulated award per account per campaign. No self-claims, viewing
          verification or real-world rewards. Posting a link does not verify
          ownership. Private, unavailable or restricted videos may not play
          here.
        </p>
        <Button type="submit" disabled={!content || published}>
          {published ? "Published" : "Publish YouTube post"}
        </Button>
      </Form>
      {content && <YouTubePreview key={content.id} url={content.url} />}
      {link && !content && (
        <p role="status">Use a YouTube watch, Shorts or youtu.be video link.</p>
      )}
      {published && (
        <p role="status">
          Published to your creator profile, followers’ All / Posts / Videos
          feeds, and Loyalty. Feed and Loyalty use the same one-time reward.
        </p>
      )}
    </div>
  );
}
