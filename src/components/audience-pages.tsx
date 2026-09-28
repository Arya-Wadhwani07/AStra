"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Post } from "@/lib/model";
import { useApp } from "./app-context";
import { Icon } from "./icons";
import { SpotifyConnection } from "./spotify-connection";
import { YouTubeConnection } from "./youtube-connection";
import { YouTubeFeedReward } from "./youtube-post";
import { SpotifyFeedReward } from "./spotify-post";
import {
  Avatar,
  MediaFrame,
  CreatorSummary,
  PointsBalance,
  StatusBadge,
  Banner,
  Card,
  Heading,
  Empty,
  Button,
  Go,
  Field,
  SelectField,
  Tabs,
  Check,
  Form,
  money,
  disciplineNames,
  disciplines,
} from "./ui";

export function Favorite({ creator }: { creator: string }) {
  const { state, act, busy } = useApp();
  const active = state?.me?.favorites.includes(creator);
  return (
    <Button
      variant={active ? "primary" : "secondary"}
      icon="heart"
      aria-pressed={active}
      disabled={!state?.me}
      busy={busy}
      onClick={() =>
        void act(
          "favorite",
          { id: creator },
          active ? "Removed from favorites." : "Added to favorites.",
        )
      }
    >
      {active ? "Favorited" : "Favorite"}
    </Button>
  );
}
export function PostCard({ post }: { post: Post }) {
  const { state, act } = useApp();
  const creator = state?.creators.find((c) => c.id === post.owner);
  const [expanded, setExpanded] = useState(false);
  const [report, setReport] = useState(false);
  const router = useRouter();
  return (
    <article
      className={`as-card as-feedcard ${!post.art ? "as-feedcard--text" : ""}`}
    >
      <header className="as-feedcard__head">
        <Link href={`/creators/${post.owner}`} className="clean-link">
          <CreatorSummary
            name={creator?.name || "Creator"}
            discipline={creator?.discipline}
            compact
            verified={creator?.verification === "verified"}
          />
        </Link>
        <span className="as-caption">
          {post.spotifyUrl
            ? "Spotify release"
            : post.youtubeUrl
              ? "YouTube video"
              : post.type === "post"
                ? "Post"
                : post.type === "event"
                  ? "Event"
                  : "Merchandise"}
        </span>
      </header>
      {post.art && (
        <MediaFrame
          ratio={post.type === "merch" ? "1:1" : "16:9"}
          art={post.art}
          credit="Placeholder art"
        />
      )}
      <div className="as-feedcard__body">
        {post.type === "event" && (
          <p className="muted">
            <Icon name="calendar-blank" /> {post.date.replace("T", " ")} PT
          </p>
        )}
        <h2 className="as-feedcard__title">{post.title}</h2>
        <p className="as-feedcard__text">{post.body}</p>
        {post.spotifyUrl && post.demoCampaignId && (
          <SpotifyFeedReward
            campaignId={post.demoCampaignId}
            url={post.spotifyUrl}
            title={post.title}
          />
        )}
        {post.youtubeUrl && post.demoCampaignId && (
          <YouTubeFeedReward
            campaignId={post.demoCampaignId}
            url={post.youtubeUrl}
          />
        )}
        {expanded && (
          <div className="post-expanded">
            <p>{post.rights}</p>
            <p className="as-caption">
              This is the full sample post. No external media is connected.
            </p>
          </div>
        )}
        {post.type !== "post" && (
          <div className="spread">
            <strong>{money(post.price)}</strong>
            <StatusBadge tone={post.stock ? "success" : "warning"}>
              {post.stock ? `${post.stock} available` : "Sold out"}
            </StatusBadge>
          </div>
        )}
      </div>
      <footer className="as-feedcard__foot">
        {!post.spotifyUrl && !post.youtubeUrl && (
          <Button
            variant="secondary"
            icon="arrow-right"
            disabled={post.type !== "post" && !post.stock}
            onClick={async () => {
              if (post.type === "post") setExpanded(!expanded);
              else if (post.type === "event") router.push(`/events/${post.id}`);
              else {
                const r = await act(
                  "cart",
                  { id: post.id, quantity: 1 },
                  "Added to your cart.",
                );
                if (r.ok) router.push("/cart");
              }
            }}
          >
            {post.type === "event"
              ? "View event"
              : post.type === "merch"
                ? "Add to cart"
                : expanded
                  ? "Close post"
                  : "Read post"}
          </Button>
        )}
        <button
          className="icon-button"
          onClick={() => setReport(!report)}
          aria-expanded={report}
          aria-label={`Report ${post.title}`}
        >
          <Icon name="flag" />
        </button>
      </footer>
      {report && (
        <div className="panel">
          <Form
            action="report"
            success="Report sent to the local review queue."
            transform={(d) => ({ title: `${post.title}: ${d.title}` })}
            onDone={() => setReport(false)}
          >
            <Field
              label="Tell us what needs review"
              name="title"
              required
              maxLength={300}
            />
            <Button type="submit">Send report</Button>
          </Form>
        </div>
      )}
    </article>
  );
}
export function Feed() {
  const { state } = useApp();
  const [filter, setFilter] = useState("All");
  if (!state?.me) return null;
  const posts = state.posts.filter(
    (p) =>
      state.me!.favorites.includes(p.owner) &&
      (filter === "All" ||
        (filter === "Music" && Boolean(p.spotifyUrl)) ||
        (filter === "Videos" && Boolean(p.youtubeUrl)) ||
        p.type ===
          (
            { Posts: "post", Events: "event", Merchandise: "merch" } as Record<
              string,
              string
            >
          )[filter]),
  );
  return (
    <div className="with-rail">
      <div className="stack">
        <Tabs
          values={["All", "Posts", "Music", "Videos", "Events", "Merchandise"]}
          active={filter}
          change={setFilter}
        />
        <p className="as-caption">
          From {state.me.favorites.length} favorite creators · newest first
        </p>
        {posts.length ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <Empty
            title="Make room for something new"
            text="Favorite a few creators to bring their work into your feed."
          >
            <Go href="/discover">Discover creators</Go>
          </Empty>
        )}
        <p className="caught-up">
          <Icon name="check-circle" /> You’re all caught up
        </p>
      </div>
      <aside className="rail">
        <PointsBalance
          available={state.me.balance}
          pending={state.me.pending}
          action={
            <Go href="/loyalty" secondary>
              View activity
            </Go>
          }
        />
        <Card>
          <Heading title="Explore another world" />
          {state.creators
            .filter((c) => !state.me!.favorites.includes(c.id))
            .slice(0, 3)
            .map((c) => (
              <Link
                key={c.id}
                href={`/creators/${c.id}`}
                className="clean-link"
              >
                <CreatorSummary
                  name={c.name}
                  discipline={c.discipline}
                  compact
                />
              </Link>
            ))}
          <Link href="/discover">
            Discover all creators <Icon name="arrow-right" />
          </Link>
        </Card>
        <Card>
          <h3>Meet the work in person</h3>
          <p className="muted">
            Small gatherings. New perspectives. See what your favorite creators
            are planning.
          </p>
          <Go href="/events/color-after-hours" secondary>
            Explore an event
          </Go>
        </Card>
      </aside>
    </div>
  );
}
export function Discover() {
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const creators =
    state?.creators.filter(
      (c) =>
        (filter === "All" || c.discipline === filter) &&
        `${c.name} ${c.bio} ${c.location}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) || [];
  return (
    <>
      <Heading
        title="Find your next favorite"
        text="Artists, storytellers and people making things worth your time."
      />
      <Field
        label="Search creators"
        type="search"
        placeholder="A name, city or something that moves you"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Tabs
        values={["All", ...disciplines]}
        active={filter}
        change={setFilter}
      />
      <div className="creator-grid">
        {creators.map((c, i) => (
          <Card key={c.id}>
            <Link href={`/creators/${c.id}`}>
              <MediaFrame
                art={["painting", "chrome", "reel", "prism", "dance"][i % 5]}
                ratio="3:2"
                credit="Placeholder art"
              />
            </Link>
            <CreatorSummary
              name={c.name}
              discipline={c.discipline}
              location={c.location}
              compact
            />
            <p className="muted">{c.bio}</p>
            <div className="spread">
              <Link href={`/creators/${c.id}`}>View profile</Link>
              <Favorite creator={c.id} />
            </div>
          </Card>
        ))}
      </div>
      {!creators.length && (
        <Empty
          title="No matches yet"
          text="Try another name, city or creative discipline."
        >
          <Button
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Clear filters
          </Button>
        </Empty>
      )}
    </>
  );
}
export function Profile({ creatorId }: { creatorId: string }) {
  const { state, act } = useApp();
  const [tab, setTab] = useState("Work");
  const router = useRouter();
  const c = state?.creators.find(
    (c) => c.id === (creatorId === "mira-rao" ? "mira" : creatorId),
  );
  if (!c)
    return (
      <Empty
        title="Creator not found"
        text="This profile may no longer be available."
      >
        <Go href="/discover">Discover creators</Go>
      </Empty>
    );
  const posts = state!.posts.filter(
    (p) =>
      p.owner === c.id &&
      (tab === "Work" || p.type === (tab === "Events" ? "event" : "merch")),
  );
  return (
    <>
      <MediaFrame
        art="painting"
        ratio="16:9"
        className="profile-cover"
        credit="Placeholder artwork"
      />
      <Card>
        <div className="profile-header">
          <Avatar
            name={c.name}
            size={80}
            verified={c.verification === "verified"}
          />
          <div>
            <h2>{c.name}</h2>
            <p className="muted">
              {disciplineNames[c.discipline]} · {c.location}
            </p>
          </div>
          <Favorite creator={c.id} />
        </div>
        <p>{c.bio}</p>
        <div className="actions">
          <StatusBadge
            tone={c.verification === "verified" ? "success" : "neutral"}
          >
            {c.verification === "verified"
              ? "Verified sample creator"
              : "Verification not complete"}
          </StatusBadge>
          {c.portfolio && (
            <a href={c.portfolio} target="_blank" rel="noreferrer">
              Portfolio <Icon name="arrow-square-out" />
            </a>
          )}
          {state?.view === "creator" && state.me?.id !== c.id && (
            <Button
              variant="secondary"
              icon="chat-circle-text"
              onClick={async () => {
                const r = await act("direct", { id: c.id });
                if (r.ok) router.push("/studio/messages?thread=" + r.result);
              }}
            >
              Message creator
            </Button>
          )}
        </div>
      </Card>
      <Tabs
        values={["Work", "Events", "Merchandise"]}
        active={tab}
        change={setTab}
      />
      <div className="content-grid">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {!posts.length && (
        <Empty
          title="More to come"
          text="There are no published items in this category yet."
        />
      )}
    </>
  );
}
export function EventDetail({ id }: { id: string }) {
  const { state, act, busy } = useApp();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const item = state?.posts.find((p) => p.id === id && p.type === "event");
  if (!item)
    return (
      <Empty
        title="Event unavailable"
        text="This event may have been unpublished."
      >
        <Go href="/feed">Back to feed</Go>
      </Empty>
    );
  const owner = state!.creators.find((c) => c.id === item.owner);
  return (
    <>
      <Link href="/feed">
        <Icon name="arrow-left" /> Back to your feed
      </Link>
      <MediaFrame art={item.art} ratio="16:9" credit="Placeholder art" />
      <div className="detail-columns">
        <div className="stack">
          <p className="as-eyebrow-sm">An evening with {owner?.name}</p>
          <h2 className="event-title">{item.title}</h2>
          <CreatorSummary
            name={owner?.name}
            discipline={owner?.discipline}
            compact
          />
          <div className="event-facts">
            <p>
              <Icon name="calendar-blank" />
              {item.date.replace("T", " ")} PT
            </p>
            <p>
              <Icon name="map-pin" />
              {item.location}
            </p>
          </div>
          <h3>About the event</h3>
          <p className="muted">{item.body}</p>
          <h3>Before you come</h3>
          <p className="muted">
            This is a fictional event for the AStra demo. Purchases issue sample
            tickets only. Accessibility and venue details would be provided by
            the creator before a real sale.
          </p>
          <p className="as-caption">{item.rights}</p>
        </div>
        <Card className="purchase-card">
          <StatusBadge tone={item.stock ? "success" : "warning"}>
            {item.stock ? `${item.stock} tickets available` : "Sold out"}
          </StatusBadge>
          <strong className="price-large">
            {money(item.price)} <small>per ticket</small>
          </strong>
          <Field
            label="Tickets"
            type="number"
            min={1}
            max={Math.min(10, item.stock)}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <p className="points-note">
            <Icon name="star-four" /> Points can cover up to {owner?.cap}% of
            eligible item value.
          </p>
          <Button
            busy={busy}
            disabled={!item.stock}
            icon="shopping-cart"
            onClick={async () => {
              if (!state?.me) return router.push("/signin");
              const r = await act("cart", { id: item.id, quantity });
              if (r.ok) router.push("/cart");
            }}
          >
            Add to cart
          </Button>
          <p className="as-caption">
            Creator-set discount. You choose points at checkout.
          </p>
        </Card>
      </div>
    </>
  );
}
export function Checkout() {
  const { state, act, busy } = useApp();
  const [points, setPoints] = useState<Record<string, number>>({});
  const [address, setAddress] = useState("");
  const [key] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : "",
  );
  const [receipt, setReceipt] = useState<string[]>([]);
  if (!state?.me) return null;
  if (receipt.length)
    return (
      <Card className="receipt">
        <Icon name="check-circle" size={56} />
        <h2>Thanks for backing the work</h2>
        <p>
          Your sample order is confirmed. No money was charged and no email was
          sent.
        </p>
        {receipt.map((r) => (
          <code key={r}>{r}</code>
        ))}
        <div className="actions">
          <Go href="/orders">View your orders</Go>
          <Go href="/loyalty" secondary>
            View points activity
          </Go>
        </div>
      </Card>
    );
  const rows = state.cart.map((row) => ({
    ...row,
    post: state.posts.find((p) => p.id === row.item),
  }));
  if (!rows.length)
    return (
      <Empty
        title="Your cart is waiting for a little inspiration"
        text="Find a show to attend or a piece to make your own."
      >
        <Go href="/feed">Explore your feed</Go>
      </Empty>
    );
  const total = rows.reduce((n, r) => n + (r.post?.price || 0) * r.quantity, 0);
  const spent = Object.values(points).reduce(
    (a, b) => a + (Number.isFinite(b) ? b : 0),
    0,
  );
  const unavailable = rows.some((r) => !r.post);
  const hasMerch = rows.some((r) => r.post?.type === "merch");
  return (
    <>
      <Banner tone="info" title="Demo checkout. No real payment.">
        One point reduces an eligible item by one cent. Demo assumption: whole
        points and item-price-only discounts. Shipping, taxes, fees and seller
        settlement are not calculated.
      </Banner>
      <div className="detail-columns">
        <div className="stack">
          {rows.map((row) => {
            const p = row.post;
            const seller = state.creators.find((c) => c.id === p?.owner);
            const max =
              p &&
              seller &&
              (p.type === "event"
                ? seller.ticketsEligible
                : seller.merchEligible)
                ? Math.min(
                    state.me!.balance,
                    Math.floor((p.price * row.quantity * seller.cap) / 100),
                  )
                : 0;
            return (
              <Card key={row.item}>
                <div className="cart-product">
                  {p && <MediaFrame art={p.art} ratio="1:1" />}
                  <div>
                    <h3>{p?.title || "Unavailable item"}</h3>
                    <p className="muted">{seller?.name}</p>
                    <strong>{money((p?.price || 0) * row.quantity)}</strong>
                  </div>
                  <Button
                    variant="quiet"
                    icon="trash"
                    onClick={() =>
                      void act("cart", { id: row.item, quantity: 0 }).then(
                        (r) => {
                          if (r.ok)
                            setPoints((old) => ({ ...old, [row.item]: 0 }));
                        },
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
                {p && (
                  <>
                    <Field
                      label="Quantity"
                      type="number"
                      min={1}
                      max={Math.min(p.stock, 10)}
                      value={row.quantity}
                      onChange={(e) => {
                        void act("cart", {
                          id: p.id,
                          quantity: Number(e.target.value),
                        });
                        setPoints((old) => ({ ...old, [p.id]: 0 }));
                      }}
                    />
                    <div className="redemption">
                      <div className="spread">
                        <h3>
                          <Icon name="star-four" /> Use your points
                        </h3>
                        <span>{seller?.cap}% creator cap</span>
                      </div>
                      <p className="muted">
                        100 points = $1 off. Maximum for this item: {max}{" "}
                        points.
                      </p>
                      <Field
                        label={`Points for ${p.title}`}
                        type="number"
                        min={0}
                        max={max}
                        step={1}
                        value={points[p.id] || 0}
                        onChange={(e) =>
                          setPoints((old) => ({
                            ...old,
                            [p.id]: Number(e.target.value),
                          }))
                        }
                      />
                      <div className="actions">
                        <Button
                          variant="quiet"
                          onClick={() =>
                            setPoints((old) => ({ ...old, [p.id]: 0 }))
                          }
                        >
                          Use none
                        </Button>
                        <Button
                          variant="quiet"
                          onClick={() =>
                            setPoints((old) => ({
                              ...old,
                              [p.id]: Math.min(
                                max,
                                state.me!.balance - spent + (old[p.id] || 0),
                              ),
                            }))
                          }
                        >
                          Use available maximum
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
          {hasMerch && (
            <Card>
              <Field
                label="Sample delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                helper="Fictional address only. Nothing will be shipped."
              />
            </Card>
          )}
        </div>
        <aside className="stack">
          <PointsBalance
            available={state.me.balance}
            pending={state.me.pending}
          />
          <Card>
            <h2>Order summary</h2>
            <dl className="summary">
              <div>
                <dt>Item subtotal</dt>
                <dd>{money(total)}</dd>
              </div>
              <div>
                <dt>Selected points</dt>
                <dd>{spent}</dd>
              </div>
              <div>
                <dt>Points discount</dt>
                <dd>-{money(spent)}</dd>
              </div>
              <div className="summary-total">
                <dt>Sample amount due</dt>
                <dd>{money(total - spent)}</dd>
              </div>
              <div>
                <dt>Points after purchase</dt>
                <dd>{state.me.balance - spent}</dd>
              </div>
            </dl>
            <p className="as-caption">
              Pending points cannot be spent. Each creator’s limit is applied
              separately. Points are deducted only on simulated success.
            </p>
            <Button
              busy={busy}
              disabled={
                unavailable ||
                spent > state.me.balance ||
                total - spent <= 0 ||
                (hasMerch && !address.trim())
              }
              icon="lock-simple"
              onClick={async () => {
                const r = await act("checkout", {
                  points,
                  address,
                  key,
                  outcome: "success",
                });
                if (r.ok) setReceipt(r.result as string[]);
              }}
            >
              Confirm sample purchase
            </Button>
            <Go href="/feed" secondary>
              Keep exploring
            </Go>
          </Card>
        </aside>
      </div>
    </>
  );
}
export function Loyalty() {
  const { state, act, busy } = useApp();
  const [filter, setFilter] = useState("All");
  if (!state?.me) return null;
  return (
    <>
      <Heading
        title="Your support, all in one place"
        text="One shared balance across the creators you love."
      />
      <div className="detail-columns">
        <PointsBalance
          available={state.me.balance}
          pending={state.me.pending}
        />
        <Card>
          <h2>100 points = $1 off</h2>
          <p className="muted">
            Choose points at checkout, up to each creator’s maximum discount.
            Pay the rest normally.
          </p>
          <p className="as-caption">
            Points are not cash. No transfers, withdrawals or live listening
            rewards. Expiry and refund-restoration rules are not finalized.
          </p>
          <Go href="/feed" secondary>
            Find something you love
          </Go>
        </Card>
      </div>
      <Heading
        title="Points activity"
        text="Sample activity, not verified external listening."
      />
      {state.demoEnabled && (
        <Card>
          <Heading
            title="Hackathon click demo"
            text="One demo award per account per campaign. These are not verified Spotify listens or YouTube views."
          />
          <p className="as-caption">
            Points are credited when AStra accepts the link-open request, not
            when playback occurs. They can only reduce a simulated purchase
            total. No real reward or discount is issued.
          </p>
          {!state.demoCampaigns.length && (
            <p className="muted">
              A creator can publish a demo campaign in Creator workspace →
              Loyalty.
            </p>
          )}
          {state.demoCampaigns.map((c) => (
            <div className="content-item" key={c.id}>
              <h3>{c.title}</h3>
              <p className="muted">
                {state.creators.find((u) => u.id === c.owner)?.name ||
                  "Creator"}{" "}
                · {c.demoPoints} demo points
              </p>
              <p className="as-caption">{c.link}</p>
              <Button
                variant="secondary"
                busy={busy}
                disabled={c.owner === state.me?.id}
                onClick={async () => {
                  const result = await act(
                    "demo-link-open",
                    { id: c.id },
                    "Demo request recorded. No listening verified.",
                  );
                  const data = result.result as { url?: string } | undefined;
                  if (result.ok && data?.url) window.location.assign(data.url);
                }}
              >
                {c.claimed
                  ? "Open again · no extra points"
                  : "Open link · receive demo points"}
              </Button>
            </div>
          ))}
        </Card>
      )}
      <Tabs
        values={["All", "Approved", "Pending", "Redeemed"]}
        active={filter}
        change={setFilter}
      />
      <Card>
        {state.ledger
          .filter(
            (l) =>
              filter === "All" ||
              l.status.toLowerCase() === filter.toLowerCase(),
          )
          .map((l) => (
            <div className="ledger-row" key={l.id}>
              <div>
                <strong>{l.activity}</strong>
                <p className="muted">
                  {l.source} · {l.date}
                </p>
              </div>
              <StatusBadge tone={l.status === "pending" ? "warning" : "points"}>
                {l.status}
              </StatusBadge>
              <strong className="points-number">
                {l.change > 0 ? "+" : ""}
                {l.change}
              </strong>
            </div>
          ))}
        {!state.ledger.length && (
          <p className="muted">
            No activity yet. New demo accounts start at zero.
          </p>
        )}
      </Card>
    </>
  );
}
export function Orders({ seller = false }: { seller?: boolean }) {
  const { state, act } = useApp();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState("");
  const rows =
    state?.orders.filter(
      (o) =>
        filter === "All" ||
        (filter === "Tickets"
          ? o.type === "event"
          : filter === "Merchandise"
            ? o.type === "merch"
            : o.status === "Shipped"),
    ) || [];
  return (
    <>
      <Heading
        title={
          seller
            ? "From your work to their world"
            : "The things you’ve supported"
        }
        text={
          seller
            ? "Manage tickets and fulfilment. Buyer payment details are never shown."
            : "Sample purchases, tickets and merchandise."
        }
      />
      <Tabs
        values={["All", "Tickets", "Merchandise", "Shipped"]}
        active={filter}
        change={setFilter}
      />
      {rows.length ? (
        rows.map((o) => (
          <Card key={o.id}>
            <div className="spread">
              <div>
                <p className="as-caption mono">{o.id}</p>
                <h3>{o.title}</h3>
                <p className="muted">
                  {o.quantity} × item · {money(o.paid)} paid in simulation
                </p>
              </div>
              <StatusBadge
                tone={o.status === "Refund requested" ? "warning" : "success"}
              >
                {o.status}
              </StatusBadge>
            </div>
            <p>
              {o.points} points used.{" "}
              {new Date(o.created).toLocaleDateString("en-US")}
            </p>
            <Button
              variant="secondary"
              onClick={() => setSelected(selected === o.id ? "" : o.id)}
            >
              {selected === o.id ? "Close details" : "View details"}
            </Button>
            {selected === o.id && (
              <div className="stack order-detail">
                <dl className="summary">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{money(o.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Points discount</dt>
                    <dd>{money(o.points)}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>Simulated success</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>Not sent. Demo only.</dd>
                  </div>
                </dl>
                {o.type === "event" ? (
                  <div className="sample-ticket">
                    <Icon name="ticket" size={40} />
                    <strong>Sample admission ticket</strong>
                    <code>{o.id}</code>
                    <p>Not valid for a real event.</p>
                  </div>
                ) : (
                  <>
                    <p>{o.address}</p>
                    {o.tracking && <p>Tracking: {o.tracking}</p>}
                  </>
                )}
                {seller && o.type === "merch" && o.status === "Preparing" && (
                  <Form
                    action="fulfil"
                    transform={(d) => ({ ...d, id: o.id })}
                    success="Sample order marked shipped."
                  >
                    <Field
                      label="Sample tracking reference"
                      name="tracking"
                      required
                    />
                    <Button type="submit">Mark as shipped</Button>
                  </Form>
                )}
                {!seller && o.status !== "Refund requested" && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void act(
                        "refund",
                        { id: o.id },
                        "Refund request recorded. No money or points have been restored.",
                      )
                    }
                  >
                    Request refund review
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))
      ) : (
        <Empty
          title="No orders here yet"
          text="Your orders will appear after a successful sample purchase."
        >
          {!seller && <Go href="/feed">Explore your feed</Go>}
        </Empty>
      )}
    </>
  );
}
export function Notifications() {
  const { state, act } = useApp();
  return (
    <>
      <Heading title="You’re in the loop">
        <Button
          variant="secondary"
          onClick={() => void act("read", {}, "All notifications marked read.")}
        >
          Mark all read
        </Button>
      </Heading>
      {state?.notices.length ? (
        state.notices.map((n) => (
          <Card key={n.id}>
            <div className="spread">
              <h3>{n.title}</h3>
              {!n.read && <StatusBadge tone="info">New</StatusBadge>}
            </div>
            <p className="muted">{n.body}</p>
            <Link href={n.href} onClick={() => void act("read", { id: n.id })}>
              View update <Icon name="arrow-right" />
            </Link>
          </Card>
        ))
      ) : (
        <Empty
          title="Nothing new right now"
          text="Order updates and relevant account notices will appear here."
        />
      )}
    </>
  );
}
export function Settings() {
  const { state, act } = useApp();
  const [showExport, setShowExport] = useState(false);
  if (!state?.me) return null;
  return (
    <div className="form-width">
      <Heading title="Make AStra work for you" />
      <Card>
        <h2>Account</h2>
        <p>{state.me.name}</p>
        {!state.me.authProvider && <p className="muted">{state.me.email}</p>}
        <p className="as-caption">
          {state.me.authProvider
            ? "Private account authenticated through Spotify or Google. This does not verify creator or artist identity."
            : "Sample identity. This is a shared demonstration account."}
        </p>
        {state.me.roles.includes("creator") && (
          <Go href="/studio/profile" secondary>
            Edit creator profile
          </Go>
        )}
      </Card>
      <Card>
        <h2>Preferences</h2>
        <Form action="settings" success="Preferences saved.">
          <Check name="email" defaultChecked={state.me.settings.email}>
            Email updates (preference only; no emails sent)
          </Check>
          <Check name="motion" defaultChecked={state.me.settings.motion}>
            Allow ambient animation in the workspace
          </Check>
          <Check
            name="privateProfile"
            defaultChecked={state.me.settings.privateProfile}
          >
            Keep my audience activity private
          </Check>
          <p className="as-caption">
            Loyalty balances, purchases and conversations are always private.
            System reduced-motion preferences take priority.
          </p>
          <Button type="submit">Save preferences</Button>
        </Form>
      </Card>
      <Card>
        <h2>Connected services</h2>
        <SpotifyConnection />
        <YouTubeConnection />
        {["YouTube Music", "Amazon Music"].map((service) => (
          <div key={service} className="spread">
            <span>{service}</span>
            <StatusBadge tone="neutral">Not connected</StatusBadge>
          </div>
        ))}
        <p className="muted">
          YouTube Music and Amazon Music are not connected. Listening-based
          rewards are not enabled for any provider.
        </p>
      </Card>
      <Card>
        <h2>Your data</h2>
        <p className="muted">
          Preview the data available in your current account view. This export
          does not include other people’s private conversations or balances.
        </p>
        <Button
          variant="secondary"
          icon="download-simple"
          onClick={() => setShowExport(!showExport)}
        >
          {showExport ? "Close export preview" : "Preview account export"}
        </Button>
        {showExport && (
          <textarea
            className="as-control export-preview"
            readOnly
            aria-label="Account export JSON"
            value={JSON.stringify(
              {
                me: state.me,
                orders: state.orders,
                ledger: state.ledger,
                notices: state.notices,
              },
              null,
              2,
            )}
          />
        )}
        <p className="as-caption">
          Preview only. No file is downloaded outside AStra.
        </p>
        <Button variant="quiet" onClick={() => void act("logout")}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
