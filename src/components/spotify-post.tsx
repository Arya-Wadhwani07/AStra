"use client";
import { useState } from "react";
import { spotifyContent } from "../lib/spotify-content";
import { useApp } from "./app-context";
import { Button, Field, Form, Go, StatusBadge } from "./ui";

export function SpotifyPreview({ url, title }: { url: string; title: string }) {
  const content = spotifyContent(url);
  if (!content) return null;
  return (
    <div className="spotify-preview">
      <iframe
        className="spotify-preview__frame"
        src={content.embed}
        width="100%"
        height={content.kind === "album" ? 352 : 152}
        title={`Spotify ${content.kind} preview: ${title}`}
        loading="lazy"
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <p className="as-caption">
        Preview provided by Spotify. Loading the player connects to Spotify. If
        it is unavailable, use the link below.
      </p>
    </div>
  );
}

export function SpotifyFeedReward({
  campaignId,
  url,
  title,
}: {
  campaignId: string;
  url: string;
  title: string;
}) {
  const { state, act, busy } = useApp();
  const campaign = state?.demoCampaigns.find((c) => c.id === campaignId);
  const content = spotifyContent(url);
  if (!content || !campaign) return null;
  const own = campaign.owner === state?.me?.id;
  return (
    <section
      className="spotify-feed-reward"
      aria-label="Spotify preview and demo reward"
    >
      <SpotifyPreview url={url} title={title} />
      <div className="spread">
        <StatusBadge tone={campaign.claimed ? "success" : "points"}>
          {campaign.claimed
            ? "Demo points received"
            : `+${campaign.demoPoints} demo points`}
        </StatusBadge>
        <span className="as-caption">Once per account</span>
      </div>
      <p className="as-caption">
        Use the button below for the hackathon link-open reward. Playing the
        preview does not award points. Not a verified listen; simulated checkout
        only.
      </p>
      {!state?.me ? (
        <Go href="/signin">Sign in for the demo reward</Go>
      ) : own ? (
        <>
          <a
            className="as-btn as-btn--secondary as-btn--md"
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Spotify
          </a>
          <p className="as-caption">
            Creators cannot claim their own campaign.
          </p>
        </>
      ) : (
        <Button
          icon="arrow-up-right"
          variant="secondary"
          busy={busy}
          onClick={async () => {
            const result = await act(
              "demo-link-open",
              { id: campaignId },
              "Demo points updated. No listening verified.",
            );
            const destination = spotifyContent(
              (result.result as { url?: string } | undefined)?.url,
            );
            if (result.ok && destination)
              window.location.assign(destination.url);
          }}
        >
          {campaign.claimed
            ? "Open in Spotify · already rewarded"
            : `Open in Spotify · +${campaign.demoPoints} demo points`}
        </Button>
      )}
    </section>
  );
}

export function SpotifyPostForm() {
  const [link, setLink] = useState("");
  const [published, setPublished] = useState(false);
  const content = spotifyContent(link);
  return (
    <div className="stack">
      <h2>Share a Spotify song</h2>
      <p className="muted">
        Paste a song or album link. Your followers will see its Spotify preview
        in their feed.
      </p>
      <Form
        action="campaign"
        transform={(data) => ({ ...data, demo: true })}
        success="Spotify post published to followers’ feeds. Demo click reward enabled."
        onDone={() => setPublished(true)}
      >
        <Field
          label="Spotify song or album link"
          name="link"
          type="url"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setPublished(false);
          }}
          required
          maxLength={1000}
          placeholder="https://open.spotify.com/track/…"
          helper="Use Copy Song Link in Spotify. Short spotify.link URLs are not supported."
        />
        <Field
          label="Post title"
          name="title"
          required
          maxLength={100}
          placeholder="My new song is here"
        />
        <Field
          label="A message for your audience"
          name="rule"
          multiline
          required
          maxLength={500}
          placeholder="Tell people about this release."
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
          Hackathon simulation: one award per account per campaign, no
          self-claims. Points apply only to simulated checkout. Posting a link
          does not verify that you own the song.
        </p>
        <Button type="submit" disabled={!content || published}>
          {published ? "Published" : "Publish Spotify post"}
        </Button>
      </Form>
      {content && <SpotifyPreview url={content.url} title="Your release" />}
      {link && !content && (
        <p role="status" className="as-caption">
          Enter a full open.spotify.com track or album link to see the preview.
        </p>
      )}
      {published && (
        <p role="status">
          Published. Audience members who favorite your creator profile will see
          this in All, Posts and Music. It is also listed on your creator
          profile and the Loyalty page.
        </p>
      )}
    </div>
  );
}
