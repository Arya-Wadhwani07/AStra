"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-context";
import {
  Logo,
  Ambient,
  AuroraText,
  MediaFrame,
  CreatorSummary,
  Card,
  Heading,
  Button,
  Go,
  Field,
  SelectField,
  Feedback,
  Form,
  OrbitingCircles,
  disciplines,
  disciplineNames,
  Tabs,
} from "./ui";
import { Icon } from "./icons";
import { Mascot } from "./motion";
import { ParticleHero } from "./particle-hero";
import { AccountForm } from "./account-form";

function Stage({
  kind,
  title,
  children,
}: {
  kind: "hero" | "collab" | "loyalty";
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`cinema-stage cinema-stage--${kind}`}
      data-theme="cinema"
    >
      <div className="stage-scrim" />
      <div className="stage-copy">
        <p className="as-eyebrow">
          <span className="as-eyebrow__sq" />
          {kind === "hero"
            ? "For creators and the people who back them"
            : kind === "collab"
              ? "Different disciplines. Shared possibilities."
              : "Your support goes further"}
        </p>
        {kind === "hero" ? <h1>{title}</h1> : <h2>{title}</h2>}
        {children}
      </div>
      <p className="stage-credit">
        {kind === "hero"
          ? "Original AStra particle sculpture"
          : kind === "collab"
            ? "Creative strands, one shared form"
            : "Different orbits, one shared balance"}
      </p>
    </section>
  );
}
export function Landing() {
  const { state } = useApp();
  return (
    <div className="landing as-app--glass" data-theme="glass">
      <ParticleHero continuous />
      <header className="public-nav" data-theme="cinema">
        <Link href="/" aria-label="AStra home">
          <Logo />
        </Link>
        <nav aria-label="Public navigation">
          <Link href="/discover">Discover</Link>
          <Link href="#collaborate">Collaborate</Link>
          <Link href="#loyalty">Loyalty</Link>
          <Link href="/signin">Sign in</Link>
          <Go href="/signin">Join AStra</Go>
        </nav>
      </header>
      <Stage
        kind="hero"
        title={
          <>
            Where creative <AuroraText>worlds</AuroraText> meet.
          </>
        }
      >
        <p>
          Follow painters, musicians, dancers and filmmakers in one feed. Buy
          tickets and prints directly. Use one loyalty balance with every
          participating creator.
        </p>
        <div className="actions">
          <Go href="/signin">Join AStra</Go>
          <Go href="/discover" secondary>
            Explore creators
          </Go>
        </div>
      </Stage>
      <section className="landing-section">
        <h2 className="display-title">
          One place for the work, the fans and the people you make it with.
        </h2>
        <div className="editorial-grid">
          <div className="stack">
            <figure className="landing-album">
              <iframe
                title="A Matter of Time by Laufey — official Spotify album preview"
                src="https://open.spotify.com/embed/album/5rMOCuiWWbEBcHaKM69Hmv?utm_source=generator&theme=0"
                loading="lazy"
                allow="encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </figure>
            <h3>Follow creators, not algorithms</h3>
            <p className="muted">
              Posts, events and merchandise from the creators you favorite,
              newest first. A little less noise. A little more connection.
            </p>
            <Link href="/feed">
              Explore the feed <Icon name="arrow-right" />
            </Link>
          </div>
          <div className="feature-list">
            {[
              [
                "star-four",
                "One balance, every creator",
                "Points from different creators add up. 100 points = $1 off, up to the limit each creator sets.",
              ],
              [
                "handshake",
                "Good work starts with good people",
                "A painter meets a filmmaker. A writer finds a dancer. Find collaborators beyond your own discipline.",
              ],
              [
                "ticket",
                "Get closer to the work",
                "Small shows, signed prints and new releases. Support the person behind the things you love.",
              ],
            ].map(([icon, title, body]) => (
              <div key={title}>
                <Icon name={icon} size={28} />
                <h3>{title}</h3>
                <p className="muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {Boolean(state?.me) && (
        <section className="landing-section">
          <Heading
            title="A few worlds to explore"
            text="Explore creative disciplines through these illustrative profiles."
          />
          <div className="creator-grid">
            {(state?.creators || []).slice(0, 4).map((c, i) => (
              <Link
                key={c.id}
                href={`/creators/${c.id}`}
                className="creator-tile"
              >
                <MediaFrame
                  art={["painting", "chrome", "reel", "prism"][i]}
                  ratio="4:5"
                  credit="Placeholder art"
                />
                <CreatorSummary
                  name={c.name}
                  discipline={c.discipline}
                  location={c.location}
                  compact
                />
              </Link>
            ))}
          </div>
        </section>
      )}
      <div id="collaborate">
        <Stage
          kind="collab"
          title={<>Make something neither of you could make alone.</>}
        >
          <p>
            A private space for creators to share opportunities, find a
            different perspective and build a shared plan. Fans never see your
            collaboration workspace.
          </p>
          <Go href="/studio/collaborate">Find your people</Go>
        </Stage>
      </div>
      <section className="landing-section">
        <div className="steps">
          {[
            [
              "01",
              "Share what you’re making",
              "Post a specific opportunity. Set the arrangement, profile requirements and response limit.",
            ],
            [
              "02",
              "Find the right fit",
              "Hear from a small, relevant group of creators. Start a private conversation.",
            ],
            [
              "03",
              "Get on the same page",
              "Agree on roles, deliverables, credit and timing in a versioned shared brief.",
            ],
          ].map(([n, title, body]) => (
            <div key={n}>
              <span className="step-number">{n}</span>
              <h3>{title}</h3>
              <p className="muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div id="loyalty">
        <Stage
          kind="loyalty"
          title={
            <>
              Different creators.
              <br />
              One loyalty balance.
            </>
          }
        >
          <p>
            Choose how many points to use at checkout. Each creator sets a
            maximum discount, and you pay the rest. Always your choice.
          </p>
          <div className="loyalty-equation">
            <strong>100</strong>
            <span>points</span>
            <span>=</span>
            <strong>$1</strong>
            <span>off</span>
          </div>
          <p className="as-caption">
            Not cash. Not transferable. Earning mechanisms are still under
            review.
          </p>
          <Go href="/loyalty" secondary>
            See how it works
          </Go>
        </Stage>
      </div>
      <section className="landing-section">
        <div className="footer-cta">
          <Mascot />
          <div>
            <h2 className="display-title">
              Bring your work.
              <br />
              Meet your people.
            </h2>
            <p className="muted">
              Your next creative chapter might start with a hello.
            </p>
            <Go href="/signin">Join AStra</Go>
          </div>
        </div>
      </section>
      <footer className="public-footer">
        <Logo />
        <span>Multiverse for creators</span>
        <Link href="/signin">Sign in</Link>
      </footer>
    </div>
  );
}

export function SignIn({ testAccounts = false }: { testAccounts?: boolean }) {
  const [tab, setTab] = useState("Sign in");
  const [account, setAccount] = useState("alex");
  const [key, setKey] = useState("");
  const { act, busy } = useApp();
  const router = useRouter();
  const login = async () => {
    const r = await act("login", { account, key });
    if (r.ok)
      router.push(
        r.state?.view === "admin"
          ? "/admin"
          : r.state?.view === "creator"
            ? "/studio"
            : "/feed",
      );
  };
  return (
    <div className="auth-page as-app--glass" data-theme="glass">
      <Ambient />
      <div className="auth-left">
        <Link href="/" className="brand">
          <Logo />
        </Link>
        <div className="auth-form">
          <h1>Your creative world starts here.</h1>
          <p className="muted">
            Create your own AStra account. A home for your work, the people you
            follow and what you make together.
          </p>
          <Feedback />
          <AccountForm />
          {testAccounts && (
            <>
              <Tabs values={["Sign in", "Join"]} active={tab} change={setTab} />
              <Card>
                <h1>
                  {tab === "Join" ? "Find your place in AStra" : "Welcome back"}
                </h1>
                <p className="muted">
                  Local working demo. Use fictional details only. No password,
                  identity document or email is collected.
                </p>
                {tab === "Sign in" ? (
                  <form
                    className="stack"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void login();
                    }}
                  >
                    <SelectField
                      label="Sample account"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                    >
                      <option value="alex">Alex Morgan · Audience</option>
                      <option value="mira">
                        Mira Rao · Creator and audience
                      </option>
                      <option value="eli">Eli Chen · Collaborator</option>
                      <option value="sam">Sam Ortiz · Photographer</option>
                      <option value="jonah">Jonah Lee · Musician</option>
                      <option value="admin">
                        Review team · Administrator key required
                      </option>
                    </SelectField>
                    {account === "admin" && (
                      <Field
                        label="Local administrator key"
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                        helper="Provisioned separately with npm run admin:key inside the sandbox."
                      />
                    )}
                    <Button type="submit" busy={busy} icon="arrow-right">
                      Continue to demo
                    </Button>
                  </form>
                ) : (
                  <Form
                    action="register"
                    success="Sample account created. Email verification is not connected."
                    onDone={() => {
                      router.push("/onboarding");
                    }}
                  >
                    <Field
                      label="Sample display name"
                      name="name"
                      required
                      maxLength={80}
                      placeholder="Your creative name"
                    />
                    <SelectField label="I’m here as" name="role">
                      <option value="audience">Audience</option>
                      <option value="creator">Creator</option>
                      <option value="both">Both</option>
                    </SelectField>
                    <Button type="submit" busy={busy}>
                      Create sample account
                    </Button>
                  </Form>
                )}
              </Card>
            </>
          )}
          <p className="as-caption">
            Your account is yours. Music and video connections are always your
            choice.
          </p>
        </div>
      </div>
      <aside className="auth-art" data-theme="cinema">
        <OrbitingCircles
          static
          radius={150}
          iconSize={52}
          center={<Logo markOnly />}
          label="Creative disciplines connecting"
        >
          {[
            "palette",
            "music-notes",
            "pen-nib",
            "camera",
            "video-camera",
            "person-simple-tai-chi",
          ].map((name) => (
            <span key={name} className="as-orbit-node">
              <Icon name={name} size={28} />
            </span>
          ))}
        </OrbitingCircles>
        <h2>Creators, collaborators and fans in one place.</h2>
        <p>Bring your work. Find your people. Build something that’s yours.</p>
      </aside>
    </div>
  );
}
export function Onboarding() {
  const { state, act, busy } = useApp();
  const [filter, setFilter] = useState("All");
  if (!state?.me)
    return (
      <Card>
        <Heading title="Sign in to get started" />
        <Go href="/signin">Join AStra</Go>
      </Card>
    );
  return (
    <div className="onboarding as-app--glass" data-theme="glass">
      <Ambient />
      <Link href="/" className="brand">
        <Logo />
      </Link>
      <Feedback />
      <div className="onboarding-heading">
        <Mascot />
        <div>
          <p className="as-eyebrow-sm">Make it your own</p>
          <h1 className="display-title">
            Pick a few creators to start your feed
          </h1>
          <p className="muted">
            Different creative worlds, all in one place. You can change your
            favorites anytime.
          </p>
        </div>
      </div>
      <Tabs
        values={["All", ...disciplines.map((d) => disciplineNames[d])]}
        active={filter}
        change={setFilter}
      />
      <div className="creator-grid">
        {state.creators
          .filter(
            (c) => filter === "All" || disciplineNames[c.discipline] === filter,
          )
          .map((c, i) => (
            <Card key={c.id}>
              <MediaFrame
                art={["painting", "chrome", "reel", "prism"][i % 4]}
                ratio="3:2"
                credit="Placeholder art"
              />
              <CreatorSummary name={c.name} discipline={c.discipline} compact />
              <Button
                variant={
                  state.me!.favorites.includes(c.id) ? "primary" : "secondary"
                }
                icon="heart"
                busy={busy}
                onClick={() => void act("favorite", { id: c.id })}
              >
                {state.me!.favorites.includes(c.id)
                  ? "Favorited"
                  : "Add favorite"}
              </Button>
            </Card>
          ))}
      </div>
      <div className="actions onboarding-actions">
        <span>{state.me.favorites.length} creators selected</span>
        <Go href={state.view === "creator" ? "/studio/setup" : "/feed"}>
          {state.view === "creator"
            ? "Set up creator profile"
            : "Continue to feed"}
        </Go>
      </div>
    </div>
  );
}
