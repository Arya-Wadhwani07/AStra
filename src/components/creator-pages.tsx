"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-context";
import { Icon } from "./icons";
import {
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
  disciplines,
  disciplineNames,
  Banner,
  StatusBadge,
  CreatorSummary,
} from "./ui";
import { creatorNav } from "./shell";
import { SpotifyPostForm } from "./spotify-post";
import { YouTubePostForm } from "./youtube-post";

export function Dashboard() {
  const { state } = useApp();
  if (!state?.me) return null;
  const revenue = state.orders.reduce((n, o) => n + o.paid, 0);
  return (
    <>
      <Heading
        title={`Good to see you, ${state.me.name.split(" ")[0]}`}
        text="Your work, your people and your next creative chapter."
      >
        <Go href="/studio/publish" icon="plus">
          Create something
        </Go>
      </Heading>
      {state.me.verification !== "verified" && (
        <Banner
          tone="warning"
          title="Finish setting up your creator profile"
          action={
            <Go href="/studio/setup" secondary>
              Continue setup
            </Go>
          }
        >
          You can post and collaborate now. Selling and accepting discounts
          require verification.
        </Banner>
      )}
      <div className="metric-grid">
        {[
          ["Sample order revenue", money(revenue), "credit-card"],
          [
            "Published items",
            String(state.myPosts.filter((p) => p.published).length),
            "article",
          ],
          [
            "Orders to prepare",
            String(state.orders.filter((o) => o.status === "Preparing").length),
            "package",
          ],
          [
            "Collaboration responses",
            String(state.responses?.length || 0),
            "handshake",
          ],
        ].map(([label, value, icon]) => (
          <Card key={label}>
            <Icon name={icon} />
            <span className="muted">{label}</span>
            <strong className="metric">{value}</strong>
          </Card>
        ))}
      </div>
      <div className="detail-columns">
        <Card>
          <Heading title="Keep things moving" />
          <Link className="task-row" href="/studio/orders">
            <Icon name="package" />
            <div>
              <strong>Get your work out into the world</strong>
              <p className="muted">Review orders and update fulfilment</p>
            </div>
            <Icon name="arrow-right" />
          </Link>
          <Link className="task-row" href="/studio/collaborations">
            <Icon name="handshake" />
            <div>
              <strong>Your next collaboration</strong>
              <p className="muted">
                Review responses and confirm the shared plan
              </p>
            </div>
            <Icon name="arrow-right" />
          </Link>
          <Link className="task-row" href="/studio/loyalty">
            <Icon name="star-four" />
            <div>
              <strong>Set a limit that works for you</strong>
              <p className="muted">Choose your maximum points discount</p>
            </div>
            <Icon name="arrow-right" />
          </Link>
        </Card>
        <Card>
          <h2>Your public profile</h2>
          <CreatorSummary
            name={state.me.name}
            discipline={state.me.discipline}
            location={state.me.location}
            bio={state.me.bio}
          />
          <div className="actions">
            <Go href={`/creators/${state.me.id}`} secondary>
              Preview profile
            </Go>
            <Link href="/studio/profile">Edit profile</Link>
          </div>
        </Card>
      </div>
      <Card>
        <Heading title="Your latest work">
          <Link href="/studio/publish">Manage content</Link>
        </Heading>
        {state.myPosts.slice(0, 4).map((p) => (
          <div className="spread" key={p.id}>
            <div>
              <h3>{p.title}</h3>
              <p className="muted">{p.type}</p>
            </div>
            <StatusBadge tone={p.published ? "success" : "neutral"}>
              {p.published ? "Published" : "Draft"}
            </StatusBadge>
          </div>
        ))}
        {!state.myPosts.length && (
          <p className="muted">
            Start with an introduction, a piece in progress or an upcoming
            event.
          </p>
        )}
      </Card>
    </>
  );
}
export function ProfileEdit({ setup = false }: { setup?: boolean }) {
  const { state, act, busy } = useApp();
  if (!state?.me) return null;
  const me = state.me;
  return (
    <div className="form-width">
      <Heading
        title={
          setup
            ? "Let people meet the person behind the work"
            : "Your creative identity"
        }
        text="Your profile also helps match you with relevant collaboration opportunities."
      />
      <Card>
        <Form key={me.id} action="profile" success="Creator profile saved.">
          <div className="field-grid">
            <Field
              label="Display name"
              name="name"
              defaultValue={me.name}
              required
              maxLength={80}
            />
            <SelectField
              label="Main discipline"
              name="discipline"
              defaultValue={me.discipline}
            >
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {disciplineNames[d]}
                </option>
              ))}
            </SelectField>
          </div>
          <Field
            label="About your work"
            name="bio"
            defaultValue={me.bio}
            multiline
            maxLength={600}
          />
          <div className="field-grid">
            <Field
              label="Location"
              name="location"
              defaultValue={me.location}
              required
            />
            <Field
              label="Time zone"
              name="timezone"
              defaultValue={me.timezone}
              required
            />
          </div>
          <Field
            label="Skills, separated by commas"
            name="skills"
            defaultValue={me.skills.join(", ")}
            helper="Required opportunity filters use these profile details. Be specific and accurate."
          />
          <Field
            label="Portfolio link"
            name="portfolio"
            type="url"
            defaultValue={me.portfolio}
            placeholder="https://your-portfolio.example"
          />
          <div className="field-grid">
            <Field
              label="Languages"
              name="languages"
              defaultValue={me.languages}
              required
            />
            <SelectField
              label="Availability"
              name="availability"
              defaultValue={me.availability}
            >
              <option>Available now</option>
              <option>Next month</option>
              <option>Not available</option>
            </SelectField>
            <SelectField
              label="Experience"
              name="experience"
              defaultValue={me.experience}
            >
              {["Just starting", "1-2 years", "3-5 years", "5+ years"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </SelectField>
            <SelectField
              label="Audience size range"
              name="audienceSize"
              defaultValue={me.audienceSize}
            >
              {[
                "Under 1,000",
                "1,000-10,000",
                "10,000-100,000",
                "100,000+",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </SelectField>
          </div>
          <Check name="remote" defaultChecked={me.remote}>
            Available for remote collaborations
          </Check>
          <Button type="submit" busy={busy}>
            Save profile
          </Button>
        </Form>
      </Card>
      <Card>
        <Heading title="Creator verification">
          <StatusBadge
            tone={me.verification === "verified" ? "success" : "warning"}
          >
            {me.verification}
          </StatusBadge>
        </Heading>
        <p className="muted">
          Verification gates ticket sales, merchandise sales and points
          discounts. It does not gate posting or collaboration.
        </p>
        <Banner tone="info" title="Simulated verification only">
          No identity provider is connected. Do not upload identity documents.
          This request goes to the local demo review queue.
        </Banner>
        {!["verified", "pending"].includes(me.verification) && (
          <Button
            onClick={() =>
              void act("verification", {}, "Sample verification request sent.")
            }
            busy={busy}
          >
            Request sample review
          </Button>
        )}
        {setup && (
          <Go href="/studio" secondary>
            Continue to overview
          </Go>
        )}
      </Card>
    </div>
  );
}
export function Publish() {
  const { state, act, busy } = useApp();
  const [type, setType] = useState("post");
  const [editing, setEditing] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revision, setRevision] = useState(0);
  const selected = state?.myPosts.find((p) => p.id === editing);
  const [preview, setPreview] = useState(false);
  if (!state?.me) return null;
  const submit = (data: Record<string, unknown>) => ({
    ...data,
    id: editing || undefined,
    type,
    price: Math.round(Number(data.price || 0) * 100),
    published: data.publication === "publish",
  });
  return (
    <>
      <Heading
        title="Bring your work into the world"
        text="Posts, events and merchandise live together in your audience’s feed."
      />
      <div className="detail-columns">
        <Card>
          <Tabs
            values={
              state.demoEnabled
                ? ["post", "Spotify", "YouTube", "event", "merch"]
                : ["post", "event", "merch"]
            }
            active={type}
            change={(v) => {
              setType(v);
              setEditing("");
              setRevision((n) => n + 1);
            }}
          />
          {type === "Spotify" ? (
            <SpotifyPostForm />
          ) : type === "YouTube" ? (
            <YouTubePostForm />
          ) : (
            <Form
              key={editing + revision + type}
              action="publish"
              transform={submit}
              success="Content saved. Its current status is shown in Your content."
              onDone={() => setRevision((n) => n + 1)}
            >
              <Field
                label="Title"
                name="title"
                defaultValue={selected?.title}
                required
                maxLength={140}
              />
              <Field
                label="Description"
                name="body"
                defaultValue={selected?.body}
                multiline
                required
              />
              <Banner tone="info" title="Approved placeholder artwork">
                This build uses the supplied art treatments. File uploads and
                media storage are not connected.
              </Banner>
              {type !== "post" && (
                <div className="field-grid">
                  <Field
                    label="Price (USD)"
                    name="price"
                    type="number"
                    min={1}
                    max={10000}
                    step={0.01}
                    defaultValue={selected ? selected.price / 100 : 25}
                    required
                  />
                  <Field
                    label={
                      type === "event"
                        ? "Ticket capacity remaining"
                        : "Inventory remaining"
                    }
                    name="stock"
                    type="number"
                    min={0}
                    max={10000}
                    defaultValue={selected?.stock ?? 10}
                    required
                  />
                </div>
              )}
              {type === "event" && (
                <>
                  <Field
                    label="Event date and time (Pacific Time)"
                    type="datetime-local"
                    name="date"
                    defaultValue={selected?.date || "2026-10-10T18:00"}
                    required
                  />
                  <Field
                    label="Venue or location"
                    name="location"
                    defaultValue={selected?.location}
                    required
                  />
                </>
              )}
              <details>
                <summary>Rights, credits and intended use</summary>
                <p className="as-caption">
                  These fields record your statement. They are not copyright
                  registration or legal advice.
                </p>
              </details>
              <Field
                label="Rights and credits"
                name="rights"
                defaultValue={
                  selected?.rights ||
                  "Original work. Credit the creator; reuse requires permission."
                }
                multiline
                required
              />
              <div className="actions">
                <Button
                  type="submit"
                  variant="secondary"
                  name="publication"
                  value="draft"
                >
                  Save draft
                </Button>
                <Button
                  type="submit"
                  disabled={
                    type !== "post" && state.me.verification !== "verified"
                  }
                  name="publication"
                  value="publish"
                >
                  Publish {type === "merch" ? "item" : type}
                </Button>
              </div>
              {type !== "post" && state.me.verification !== "verified" && (
                <p className="error-text">
                  Complete verification before publishing sales. You can still
                  save a draft.
                </p>
              )}
            </Form>
          )}
        </Card>
        <div className="stack">
          <Card>
            <Heading title="Your content" />
            {state.demoEnabled && (
              <p className="as-caption">
                Spotify and YouTube releases are listed under{" "}
                <Link href="/studio/loyalty">Loyalty campaigns</Link> and appear
                on your creator profile.
              </p>
            )}
            {state.myPosts.length ? (
              state.myPosts.map((p) => (
                <div className="content-item" key={p.id}>
                  <h3>{p.title}</h3>
                  <div className="spread">
                    <StatusBadge tone={p.published ? "success" : "neutral"}>
                      {p.published ? "Published" : "Draft"}
                    </StatusBadge>
                    <span className="as-caption">{p.type}</span>
                  </div>
                  <div className="actions">
                    <Button
                      variant="quiet"
                      onClick={() => {
                        setEditing(p.id);
                        setType(p.type);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="quiet"
                      busy={busy}
                      onClick={() =>
                        void act(
                          "content-status",
                          {
                            id: p.id,
                            status: p.published ? "unpublish" : "publish",
                          },
                          p.published ? "Unpublished." : "Published.",
                        )
                      }
                    >
                      {p.published ? "Unpublish" : "Publish"}
                    </Button>
                    {!p.published && (
                      <Button variant="quiet" onClick={() => setConfirm(p.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                  {confirm === p.id && (
                    <div className="confirmation">
                      <p>Delete this draft permanently?</p>
                      <div className="actions">
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const r = await act(
                              "content-status",
                              { id: p.id, status: "delete" },
                              "Draft deleted.",
                            );
                            if (r.ok) {
                              setConfirm("");
                              if (editing === p.id) setEditing("");
                            }
                          }}
                        >
                          Delete draft
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setConfirm("")}
                        >
                          Keep it
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">
                Your saved drafts and published work appear here.
              </p>
            )}
          </Card>
          <Card>
            <h3>Before you publish</h3>
            <p className="muted">
              Use clear titles, credit everyone involved and check event dates
              and stock. Selling is simulated in this build.
            </p>
            <Button variant="secondary" onClick={() => setPreview(!preview)}>
              {preview ? "Close preview notes" : "View preview notes"}
            </Button>
            {preview && (
              <p className="as-caption">
                After publishing, open your public profile to see the exact live
                card. Drafts stay visible only to you.
              </p>
            )}
            <Go href={`/creators/${state.me.id}`} secondary>
              View public profile
            </Go>
          </Card>
        </div>
      </div>
    </>
  );
}
export function CreatorLoyalty() {
  const { state, busy } = useApp();
  const [cap, setCap] = useState(state?.me?.cap || 0);
  if (!state?.me) return null;
  return (
    <div className="form-width">
      <Heading
        title="Reward support on your terms"
        text="Fans bring one shared balance. You decide the maximum discount on your work."
      />
      <Banner tone="info" title="Discount policies are still being finalized">
        Demo assumption: whole-number caps from 0 to 99%, whole-point
        redemption, item prices only. Funding, settlement, expiry, fees,
        shipping, taxes and refund rules are unresolved.
      </Banner>
      <Card>
        <Form action="loyalty" success="Maximum discount saved.">
          <Field
            label="Maximum points discount (%)"
            name="cap"
            type="number"
            min={0}
            max={99}
            step={1}
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
            required
          />
          <Check
            name="ticketsEligible"
            defaultChecked={state.me.ticketsEligible}
          >
            Accept points on tickets
          </Check>
          <Check name="merchEligible" defaultChecked={state.me.merchEligible}>
            Accept points on merchandise
          </Check>
          <div className="redemption">
            <h3>A $50 purchase at {cap}%</h3>
            <p>
              Up to {Math.floor((5000 * cap) / 100)} points for{" "}
              {money(Math.floor((5000 * cap) / 100))} off. The fan pays at least{" "}
              {money(5000 - Math.floor((5000 * cap) / 100))}, before any
              charges.
            </p>
          </div>
          <Button
            type="submit"
            busy={busy}
            disabled={state.me.verification !== "verified"}
          >
            Save limit
          </Button>
          {state.me.verification !== "verified" && (
            <Go href="/studio/setup" secondary>
              Complete verification
            </Go>
          )}
        </Form>
      </Card>
      <Card>
        <Heading
          title="Explore an earning campaign"
          text="Keep an earning proposal as a draft, or publish a clearly labeled hackathon click simulation."
        />
        <Form
          action="campaign"
          success="Campaign saved. Any demo points are for simulated checkout only."
        >
          <Field label="Campaign name" name="title" required maxLength={100} />
          <Field
            label="Proposed earning rule"
            name="rule"
            multiline
            required
            maxLength={500}
          />
          <Banner tone="warning" title="Listening rewards are not enabled">
            Spotify connection in Settings can show your own recent tracks, but
            does not verify fan listens or award points. YouTube Music and
            Amazon Music are not connected. Earning rules remain unapproved.
          </Banner>
          {state.demoEnabled && (
            <>
              <Field
                label="Demo Spotify album/track or YouTube link"
                name="link"
                type="url"
                helper="A content link is not proof of ownership or a verified listen."
              />
              <Field
                label="Demo points for one link-open request"
                name="demoPoints"
                type="number"
                min={1}
                max={100}
                step={1}
                defaultValue={10}
              />
              <Check name="demo">
                Publish as a hackathon click simulation (one award per account)
              </Check>
              <p className="as-caption">
                Demo points only reduce simulated checkout totals. No actual
                discount, money or verified playback. Leaving this unchecked
                saves a non-earning draft.
              </p>
            </>
          )}
          <Button type="submit" variant="secondary">
            Save campaign
          </Button>
        </Form>
        {state.campaigns?.map((c) => (
          <div key={c.id} className="content-item">
            <h3>{c.title}</h3>
            <p>{c.rule}</p>
            <StatusBadge tone="warning">{c.status}</StatusBadge>
          </div>
        ))}
      </Card>
    </div>
  );
}
export function Insights() {
  const { state } = useApp();
  const [period, setPeriod] = useState("30 days");
  if (!state?.me) return null;
  const days = period === "7 days" ? 7 : 30;
  const rows = state.orders.filter(
    (o) => Date.now() - Date.parse(o.created) < days * 86400000,
  );
  const total = rows.reduce((n, o) => n + o.paid, 0);
  const points = rows.reduce((n, o) => n + o.points, 0);
  const merchandise = rows.filter((o) => o.type === "merch").length;
  return (
    <>
      <Heading
        title="See what your work is making possible"
        text="Calculated from local sample orders, not real traction."
      />
      <Tabs values={["7 days", "30 days"]} active={period} change={setPeriod} />
      <div className="metric-grid">
        {[
          ["Sample revenue", money(total)],
          ["Orders", rows.length],
          ["Points accepted", points],
          ["Published work", state.myPosts.filter((p) => p.published).length],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="muted">{label}</p>
            <strong className="metric">{value}</strong>
          </Card>
        ))}
      </div>
      <div className="detail-columns">
        <Card>
          <h2>Orders by format</h2>
          {[
            ["Merchandise", merchandise],
            ["Tickets", rows.length - merchandise],
          ].map(([label, count]) => (
            <div className="stack" key={label}>
              <div className="spread">
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
              <div className="chart-track">
                <div
                  style={{
                    width: rows.length
                      ? `${(Number(count) / rows.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          ))}
          <p className="as-caption">
            Counts are based on order lines, not unique audience members.
          </p>
        </Card>
        <Card>
          <h2>Stay close to the people behind the numbers</h2>
          <p className="muted">
            Audience reach, demographics and engagement analytics are not
            connected. No invented follower or conversion metrics are shown.
          </p>
          <Go href="/studio/orders" secondary>
            Review orders
          </Go>
          <Go href="/studio/publish" secondary>
            Publish an update
          </Go>
        </Card>
      </div>
    </>
  );
}
export function CreatorMenu() {
  return (
    <Card>
      <Heading title="Your creator workspace" />
      {creatorNav.map(([href, title, icon]) => (
        <Link key={href} href={href} className="task-row">
          <Icon name={icon} />
          <strong>{title}</strong>
          <Icon name="arrow-right" />
        </Link>
      ))}
    </Card>
  );
}
export function Admin() {
  const { state } = useApp();
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState("");
  const rows =
    state?.reviews?.filter((r) => filter === "All" || r.status === filter) ||
    [];
  const current = state?.reviews?.find((r) => r.id === selected);
  return (
    <>
      <Heading
        title="Review with context"
        text="Separately provisioned administrator access. Every decision records a reason and an in-app notice."
      />
      <Tabs
        values={["pending", "held", "approved", "action needed", "All"]}
        active={filter}
        change={setFilter}
      />
      <div className="detail-columns">
        <Card>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <code>{r.id}</code>
                      <p>{r.title}</p>
                    </td>
                    <td>{r.type}</td>
                    <td>{r.status}</td>
                    <td>
                      <Button
                        variant="secondary"
                        onClick={() => setSelected(r.id)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p className="muted">No cases in this view.</p>}
        </Card>
        <Card>
          {current ? (
            <>
              <h2>{current.title}</h2>
              <p className="mono">{current.id}</p>
              <p className="muted">
                No identity documents are collected or displayed. Verification
                decisions in this build are simulated.
              </p>
              <Form
                key={current.id}
                action="review"
                success="Decision recorded with an audit entry and in-app notice."
                transform={(d) => ({ ...d, id: current.id })}
              >
                <SelectField label="Decision" name="decision">
                  <option value="held">Hold for review</option>
                  <option value="approved">Approve</option>
                  <option value="action needed">Action needed</option>
                </SelectField>
                <Field
                  label="Reason and notice to the user"
                  name="reason"
                  multiline
                  required
                  maxLength={1000}
                />
                <Button type="submit">Record decision</Button>
              </Form>
            </>
          ) : (
            <>
              <h2>Choose a case</h2>
              <p className="muted">Review the context before taking action.</p>
            </>
          )}
        </Card>
      </div>
      <Card>
        <Heading title="Decision history" />
        {state?.audit?.map((a) => (
          <div key={a.id} className="content-item">
            <div className="spread">
              <code>{a.caseId}</code>
              <StatusBadge tone="info">{a.decision}</StatusBadge>
            </div>
            <p>{a.reason}</p>
            <p className="as-caption">{a.created} · In-app notice recorded</p>
          </div>
        ))}
        {!state?.audit?.length && (
          <p className="muted">No decisions recorded yet.</p>
        )}
      </Card>
    </>
  );
}
