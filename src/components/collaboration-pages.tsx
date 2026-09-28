"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Opportunity } from "@/lib/model";
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
  disciplines,
  disciplineNames,
  Banner,
  StatusBadge,
  CreatorSummary,
  ResponseCounter,
  BriefStatus,
  Avatar,
} from "./ui";
const arrangementNames: Record<string, string> = {
  paid: "Paid work",
  exchange: "Skill exchange",
  revenue: "Revenue sharing",
  unpaid: "Unpaid collaboration",
  open: "Open to discussion",
};
function Private() {
  return (
    <StatusBadge tone="private" icon="lock-simple">
      Creators only
    </StatusBadge>
  );
}
export function CollaborationNav() {
  return (
    <div className="collab-nav">
      <Private />
      <Link href="/studio/collaborate">Find opportunities</Link>
      <Link href="/studio/collaborate/new">Create opportunity</Link>
      <Link href="/studio/collaborations">My collaborations</Link>
    </div>
  );
}
function OpportunityCard({
  opportunity: op,
  detail = false,
}: {
  opportunity: Opportunity & { count: number; missing: string[] };
  detail?: boolean;
}) {
  const { state } = useApp();
  const owner = state?.creators.find((c) => c.id === op.owner);
  return (
    <Card>
      <div className="spread">
        <Private />
        <StatusBadge
          tone={op.closed || op.count >= op.limit ? "warning" : "success"}
        >
          {op.closed
            ? "Closed"
            : op.count >= op.limit
              ? "Paused at limit"
              : "Open"}
        </StatusBadge>
      </div>
      <h2>{op.title}</h2>
      <CreatorSummary
        name={owner?.name}
        discipline={owner?.discipline}
        compact
      />
      <p className="muted">{op.description}</p>
      <dl className="opportunity-facts">
        <div>
          <dt>Looking for</dt>
          <dd>{disciplineNames[op.discipline]}</dd>
        </div>
        <div>
          <dt>Deliverable</dt>
          <dd>{op.deliverable}</dd>
        </div>
        <div>
          <dt>Timing</dt>
          <dd>{op.timing}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{op.remote ? "Remote" : op.requiredLocation || "In person"}</dd>
        </div>
        <div>
          <dt>Arrangement</dt>
          <dd>
            {arrangementNames[op.arrangement]}
            {op.budget ? ` · ${op.budget}` : ""}
          </dd>
        </div>
      </dl>
      <div className="filter-row">
        {op.requiredSkills.map((skill) => (
          <span className="as-chip required" key={skill}>
            <Icon name="lock-simple" size={14} />
            Required: {skill}
          </span>
        ))}
        {op.preferredSkills.map((skill) => (
          <span className="as-chip preferred" key={skill}>
            <Icon name="star-four" size={14} />
            Preferred: {skill}
          </span>
        ))}
      </div>
      <ResponseCounter count={op.count} limit={op.limit} />
      {!detail && (
        <Go href={`/studio/collaborate/${op.id}`} secondary>
          View opportunity
        </Go>
      )}
    </Card>
  );
}
export function CollabFind() {
  const { state } = useApp();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [eligible, setEligible] = useState(false);
  const rows =
    state?.opportunities?.filter(
      (o) =>
        (type === "All" || o.arrangement === type) &&
        (!eligible || !o.missing.length) &&
        `${o.title} ${o.discipline} ${o.requiredSkills}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) || [];
  return (
    <>
      <CollaborationNav />
      <Heading
        title="Your next collaborator might work in a different world"
        text="Specific opportunities. Thoughtful responses. Room to make something together."
      >
        <Go href="/studio/collaborate/new" icon="plus">
          Create opportunity
        </Go>
      </Heading>
      <div className="field-grid">
        <Field
          label="Search opportunities"
          type="search"
          placeholder="A skill, discipline or project"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Arrangement"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>All</option>
          {Object.entries(arrangementNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>
      <Check checked={eligible} onChange={(e) => setEligible(e.target.checked)}>
        Only show opportunities matching my required profile details
      </Check>
      <p className="as-caption">
        Visible to creators only. Fans cannot see opportunities, responses or
        progress.
      </p>
      <div className="content-grid">
        {rows.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
      {!rows.length && (
        <Empty
          title="No opportunities match yet"
          text="Try a different search or open up your filters."
        >
          <Button
            onClick={() => {
              setSearch("");
              setType("All");
              setEligible(false);
            }}
          >
            Clear filters
          </Button>
        </Empty>
      )}
    </>
  );
}
export function CollabCreate() {
  const router = useRouter();
  return (
    <>
      <CollaborationNav />
      <div className="form-width">
        <Heading
          title="What could you make together?"
          text="Make the ask specific, set clear expectations and keep the conversation focused."
        />
        <Card>
          <Form
            action="opportunity"
            success="Opportunity published privately to creators."
            transform={(d) => ({ ...d, limit: Number(d.limit) })}
            onDone={(result) => router.push(`/studio/collaborate/${result}`)}
          >
            <Field
              label="Opportunity title"
              name="title"
              placeholder="Help turn my exhibition into a short film"
              required
              maxLength={140}
            />
            <Field
              label="Tell creators about the project"
              name="description"
              multiline
              required
            />
            <div className="field-grid">
              <SelectField label="Looking for a" name="discipline">
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {disciplineNames[d]}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Arrangement" name="arrangement">
                {Object.entries(arrangementNames).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </div>
            <Field
              label="Compensation or exchange details"
              name="budget"
              placeholder="$600, a skill exchange, or terms to discuss"
              maxLength={200}
            />
            <Field
              label="What will you make?"
              name="deliverable"
              required
              placeholder="One 30-second reel, with one review round"
            />
            <Field
              label="Timing"
              name="timing"
              required
              placeholder="First cut October 3, final October 7"
            />
            <h3>Who is a good fit?</h3>
            <Field
              label="Required skills (comma separated)"
              name="requiredSkills"
              helper="Creators must have all these skills on their profile to respond."
              placeholder="Video editing, Short-form video"
            />
            <Field
              label="Preferred skills (comma separated)"
              name="preferredSkills"
              helper="These highlight stronger matches but never block a response."
              placeholder="Motion design"
            />
            <div className="field-grid">
              <Field
                label="Required location (optional)"
                name="requiredLocation"
                helper="Exact profile city match. Leave blank for any location."
              />
              <Field
                label="Required language (optional)"
                name="requiredLanguage"
              />
            </div>
            <SelectField
              label="Required availability"
              name="requiredAvailability"
            >
              <option value="">Any availability</option>
              <option>Available now</option>
              <option>Next month</option>
            </SelectField>
            <Check name="remote" defaultChecked>
              Remote collaboration is available
            </Check>
            <SelectField
              label="Maximum responses"
              name="limit"
              defaultValue="10"
            >
              <option value="5">5 responses</option>
              <option value="10">10 responses</option>
              <option value="20">20 responses</option>
            </SelectField>
            <Banner tone="private" title="A small, focused group">
              Each creator may respond once. Responses pause automatically at
              capacity. Declining a response does not free a spot in this demo;
              that policy is still unresolved.
            </Banner>
            <Button type="submit" icon="plus">
              Publish opportunity
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
}
export function CollabRespond({ id }: { id: string }) {
  const { state, act, busy } = useApp();
  const router = useRouter();
  const op = state?.opportunities?.find((o) => o.id === id);
  if (!op || !state?.me)
    return (
      <Empty
        title="Opportunity not found"
        text="It may no longer be available in this workspace."
      >
        <Go href="/studio/collaborate">Find opportunities</Go>
      </Empty>
    );
  const owner = op.owner === state.me.id;
  const responded = state.responses?.some(
    (r) => r.opportunity === op.id && r.user === state.me!.id,
  );
  const thread = state.threads?.find((t) => t.opportunity === op.id);
  const blocked = op.closed || op.count >= op.limit;
  return (
    <>
      <CollaborationNav />
      <div className="detail-columns">
        <OpportunityCard opportunity={op} detail />
        <div className="stack">
          {owner ? (
            <Card>
              <h2>You posted this opportunity</h2>
              <p className="muted">
                Review responses, shortlist creators and create a shared brief
                from your workspace.
              </p>
              <Go href="/studio/collaborations">Review responses</Go>
              <Button
                variant="secondary"
                busy={busy}
                onClick={() =>
                  void act(
                    "opportunity-status",
                    { id: op.id, closed: !op.closed },
                    op.closed
                      ? "Opportunity reopened. Capacity and previous responses are preserved."
                      : "Opportunity closed.",
                  )
                }
              >
                {op.closed ? "Reopen opportunity" : "Close opportunity"}
              </Button>
            </Card>
          ) : responded ? (
            <Card>
              <StatusBadge tone="success">Response sent</StatusBadge>
              <h2>You’re part of the conversation</h2>
              <p className="muted">
                You can respond once to each opportunity. Follow up privately
                with the poster.
              </p>
              <Go
                href={`/studio/messages${thread ? "?thread=" + thread.id : ""}`}
              >
                Open conversation
              </Go>
            </Card>
          ) : (
            <>
              <Card>
                <h2>
                  {op.missing.length
                    ? "Check the required details"
                    : "Your profile is a match"}
                </h2>
                {op.missing.length ? (
                  <>
                    <p className="muted">
                      To respond, your profile must meet these requirements:
                    </p>
                    <ul>
                      {op.missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                    <Go href="/studio/profile" secondary>
                      Review your profile
                    </Go>
                  </>
                ) : (
                  <>
                    <StatusBadge tone="success">
                      All required criteria match
                    </StatusBadge>
                    <p className="muted">
                      Preferred skills are helpful, but they do not control
                      eligibility.
                    </p>
                    {op.preferredSkills.map((skill) => (
                      <p key={skill}>
                        <Icon
                          name={
                            state.me!.skills.includes(skill)
                              ? "check-circle"
                              : "info"
                          }
                        />{" "}
                        {skill}:{" "}
                        {state.me!.skills.includes(skill)
                          ? "Matches"
                          : "Preferred, not required"}
                      </p>
                    ))}
                  </>
                )}
              </Card>
              {blocked ? (
                <Banner tone="warning" title="Responses are paused or closed">
                  This opportunity is not accepting new responses right now.
                </Banner>
              ) : (
                !op.missing.length && (
                  <Card>
                    <Form
                      action="respond"
                      transform={(d) => ({ ...d, id: op.id })}
                      success="Response sent. Your private conversation is ready."
                      onDone={(thread) =>
                        router.push("/studio/messages?thread=" + thread)
                      }
                    >
                      <Field
                        label="A short note to the creator"
                        name="message"
                        multiline
                        maxLength={280}
                        required
                        helper="Up to 280 characters. Explain why this particular project fits you."
                      />
                      <p className="as-caption">
                        Attached: your creator profile and portfolio. Only the
                        poster sees your response.
                      </p>
                      <Button type="submit" icon="paper-plane-tilt">
                        Send response
                      </Button>
                    </Form>
                  </Card>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
export function MyCollabs() {
  const { state, act, busy } = useApp();
  const [tab, setTab] = useState("My opportunities");
  const [editing, setEditing] = useState("");
  if (!state?.me) return null;
  const mine =
    state.opportunities?.filter((o) => o.owner === state.me!.id) || [];
  const responses =
    state.responses?.filter((r) => r.user === state.me!.id) || [];
  return (
    <>
      <CollaborationNav />
      <Heading
        title="Good work starts on the same page"
        text="Private responses, shortlists and shared plans. Never visible to fans."
      />
      <Tabs
        values={["My opportunities", "My responses", "Shared briefs"]}
        active={tab}
        change={setTab}
      />
      {tab === "My opportunities" &&
        (mine.length ? (
          mine.map((op) => (
            <Card key={op.id}>
              <div className="spread">
                <h2>{op.title}</h2>
                <StatusBadge tone={op.closed ? "neutral" : "success"}>
                  {op.closed
                    ? "Closed"
                    : op.count >= op.limit
                      ? "Paused at limit"
                      : "Open"}
                </StatusBadge>
              </div>
              <ResponseCounter count={op.count} limit={op.limit} />
              <p className="as-caption">
                {op.seedCount
                  ? `${op.seedCount} historical sample responses are included in this count. Only detailed sample participants are listed below.`
                  : "Each creator can respond once. Declines do not free capacity in this demo."}
              </p>
              {state.responses
                ?.filter((r) => r.opportunity === op.id)
                .map((r) => {
                  const c = state.creators.find((c) => c.id === r.user);
                  return (
                    <div className="response-row" key={r.id}>
                      <CreatorSummary
                        name={c?.name}
                        discipline={c?.discipline}
                        compact
                      />
                      <p>{r.message}</p>
                      <StatusBadge
                        tone={r.status === "shortlisted" ? "points" : "neutral"}
                      >
                        {r.status}
                      </StatusBadge>
                      <div className="actions">
                        <Button
                          variant="secondary"
                          busy={busy}
                          onClick={() =>
                            void act(
                              "response-status",
                              { id: r.id, status: "shortlisted" },
                              "Creator shortlisted.",
                            )
                          }
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="quiet"
                          busy={busy}
                          onClick={() =>
                            void act(
                              "response-status",
                              { id: r.id, status: "declined" },
                              "Response declined. Count preserved.",
                            )
                          }
                        >
                          Decline
                        </Button>
                        <Link
                          href={
                            "/studio/messages?thread=" +
                            (state.threads?.find(
                              (t) =>
                                t.opportunity === op.id &&
                                t.participants.includes(r.user),
                            )?.id || "")
                          }
                        >
                          Conversation
                        </Link>
                      </div>
                    </div>
                  );
                })}
              <div className="actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(op.id);
                    setTab("Shared briefs");
                  }}
                >
                  Create or edit brief
                </Button>
                <Button
                  variant="quiet"
                  onClick={() =>
                    void act(
                      "opportunity-status",
                      { id: op.id, closed: !op.closed },
                      op.closed
                        ? "Reopened with the same response count."
                        : "Opportunity closed.",
                    )
                  }
                >
                  {op.closed ? "Reopen" : "Close opportunity"}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Empty
            title="Start with an idea"
            text="Post a focused opportunity for another creative discipline."
          >
            <Go href="/studio/collaborate/new">Create opportunity</Go>
          </Empty>
        ))}
      {tab === "My responses" &&
        (responses.length ? (
          responses.map((r) => (
            <Card key={r.id}>
              <h2>
                {
                  state.opportunities?.find((o) => o.id === r.opportunity)
                    ?.title
                }
              </h2>
              <p>{r.message}</p>
              <StatusBadge tone="info">{r.status}</StatusBadge>
              <Go href={`/studio/collaborate/${r.opportunity}`} secondary>
                View opportunity
              </Go>
            </Card>
          ))
        ) : (
          <Empty
            title="Find something you want to make"
            text="Your opportunity responses will appear here."
          >
            <Go href="/studio/collaborate">Find opportunities</Go>
          </Empty>
        ))}
      {tab === "Shared briefs" && (
        <>
          {state.briefs?.map((b) => (
            <Card key={b.id}>
              <BriefStatus
                title={
                  state.opportunities?.find((o) => o.id === b.opportunity)
                    ?.title
                }
                version={b.version}
                state={
                  b.participants.every((p) => b.confirmed.includes(p))
                    ? "active"
                    : "pending"
                }
                participants={b.participants.map((p) => ({
                  name: state.creators.find((c) => c.id === p)?.name || p,
                  role: "Creator",
                  confirmed: b.confirmed.includes(p),
                }))}
              />
              <p className="brief-text">{b.text}</p>
              <div className="actions">
                <Button
                  disabled={b.confirmed.includes(state.me!.id)}
                  busy={busy}
                  onClick={() =>
                    void act(
                      "confirm-brief",
                      { id: b.id, version: b.version },
                      `Confirmed version ${b.version}.`,
                    )
                  }
                >
                  {b.confirmed.includes(state.me!.id)
                    ? "You confirmed this version"
                    : `Confirm version ${b.version}`}
                </Button>
                {mine.some((o) => o.id === b.opportunity) && (
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(b.opportunity)}
                  >
                    Edit brief
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {editing && (
            <Card>
              <Heading
                title="Write the shared plan"
                text="A brief is a plan, not a legal contract. Editing resets every confirmation."
              />
              <Form
                key={editing}
                action="brief"
                transform={(d) => ({ ...d, opportunity: editing })}
                success="New brief version saved. Everyone must confirm again."
                onDone={() => setEditing("")}
              >
                <Field
                  label="Roles, deliverables, dates, credits, intended use, approvals and compensation"
                  name="text"
                  multiline
                  required
                  maxLength={5000}
                  defaultValue={
                    state.briefs?.find((b) => b.opportunity === editing)
                      ?.text ||
                    "Roles:\nDeliverables:\nDates:\nCredit:\nIntended use:\nApprovals:\nProposed compensation:"
                  }
                />
                <Button type="submit">Save new version</Button>
              </Form>
            </Card>
          )}
          {!state.briefs?.length && !editing && (
            <Empty
              title="A shared plan is the next step"
              text="Shortlist a creator, then create a brief from My opportunities."
            />
          )}
        </>
      )}
    </>
  );
}
export function Messages() {
  const { state, act, busy } = useApp();
  const search = useSearchParams();
  const [chosen, setChosen] = useState(search.get("thread") || "");
  const [text, setText] = useState("");
  const threads = state?.threads || [];
  const thread = threads.find((t) => t.id === chosen) || threads[0];
  return (
    <>
      <Heading
        title="Keep the conversation between you"
        text="Private messages are visible only to their participants."
      />
      <Private />
      <div className="messages-layout">
        <Card className="thread-list">
          {threads.map((t) => (
            <button
              key={t.id}
              className={`thread-choice ${thread?.id === t.id ? "selected" : ""}`}
              onClick={() => setChosen(t.id)}
            >
              <Icon name={t.opportunity ? "handshake" : "chat-circle-text"} />
              <span>
                {t.title}
                <small>
                  {t.opportunity
                    ? "Opportunity conversation"
                    : "Direct outreach"}
                </small>
              </span>
            </button>
          ))}
          {!threads.length && (
            <p className="muted">
              No conversations yet. Reach out to a creator or respond to an
              opportunity.
            </p>
          )}
        </Card>
        <Card className="conversation">
          {thread ? (
            <>
              <div className="spread">
                <h2>{thread.title}</h2>
                <Icon name="lock-simple" />
              </div>
              {thread.opportunity && (
                <Link href={`/studio/collaborate/${thread.opportunity}`}>
                  View opportunity
                </Link>
              )}
              <div
                className="message-history"
                role="log"
                aria-label="Conversation messages"
              >
                {state?.messages
                  ?.filter((m) => m.thread === thread.id)
                  .map((m) => (
                    <div
                      className={`message ${m.author === state.me?.id ? "own" : ""}`}
                      key={m.id}
                    >
                      <span className="as-caption">
                        {state.creators.find((c) => c.id === m.author)?.name ||
                          "Creator"}
                      </span>
                      <p>{m.text}</p>
                      <time>
                        {new Date(m.created).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  ))}
              </div>
              <form
                className="message-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const r = await act("message", { thread: thread.id, text });
                  if (r.ok) setText("");
                }}
              >
                <Field
                  label="Your message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  maxLength={2000}
                  placeholder="Share a thought, ask a question…"
                />
                <Button
                  type="submit"
                  icon="paper-plane-tilt"
                  disabled={!text.trim()}
                  busy={busy}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <Empty
              title="A good conversation starts with hello"
              text="Choose a conversation or meet a creator in the community."
            >
              <Go href="/studio/community">Meet creators</Go>
            </Empty>
          )}
        </Card>
      </div>
      <p className="as-caption">
        Local demo assumption: direct outreach creates a conversation
        immediately. Acceptance, blocking and rate-limit policies need a
        production decision.
      </p>
    </>
  );
}
export function Community() {
  const { state, act } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [revision, setRevision] = useState(0);
  return (
    <>
      <Heading
        title="The room where creative worlds meet"
        text="Share something in progress, ask a question or meet your next collaborator."
      >
        <Private />
      </Heading>
      <div className="with-rail">
        <div className="stack">
          <Card>
            <Form
              key={revision}
              action="community"
              success="Posted to the creators-only community."
              onDone={() => setRevision((n) => n + 1)}
            >
              <Field
                label="What are you working on?"
                name="text"
                multiline
                maxLength={1000}
                required
              />
              <div className="field-grid">
                <SelectField label="Category" name="category">
                  <option>Work in progress</option>
                  <option>Discussion</option>
                  <option>Events</option>
                </SelectField>
                <Button type="submit" icon="plus">
                  Post to community
                </Button>
              </div>
            </Form>
          </Card>
          <Tabs
            values={["All", "Work in progress", "Discussion", "Events"]}
            active={filter}
            change={setFilter}
          />
          {state?.community
            ?.filter((p) => filter === "All" || p.category === filter)
            .map((p) => {
              const c = state.creators.find((c) => c.id === p.user);
              return (
                <Card key={p.id}>
                  <CreatorSummary
                    name={c?.name}
                    discipline={c?.discipline}
                    compact
                  />
                  <p className="community-copy">{p.text}</p>
                  <div className="spread">
                    <StatusBadge tone="private">{p.category}</StatusBadge>
                    {p.user !== state.me?.id && (
                      <Button
                        variant="secondary"
                        icon="chat-circle-text"
                        onClick={async () => {
                          const r = await act("direct", { id: p.user });
                          if (r.ok)
                            router.push("/studio/messages?thread=" + r.result);
                        }}
                      >
                        Message creator
                      </Button>
                    )}
                  </div>
                  <details>
                    <summary>Report this post</summary>
                    <Form
                      action="report"
                      transform={(d) => ({
                        title: `Community post ${p.id}: ${d.title}`,
                      })}
                      success="Report recorded for review."
                    >
                      <Field
                        label="Reason for reporting"
                        name="title"
                        required
                      />
                      <Button type="submit" variant="secondary">
                        Send report
                      </Button>
                    </Form>
                  </details>
                </Card>
              );
            })}
        </div>
        <aside className="rail">
          <Card>
            <h2>Made for the unexpected connection</h2>
            <p className="muted">
              A painter and a filmmaker. A dancer and a musician. Great work
              does not stay in one lane.
            </p>
            <Go href="/studio/collaborate" secondary>
              Find opportunities
            </Go>
          </Card>
          <Card>
            <Heading title="Say hello" />
            {state?.creators
              .filter((c) => c.id !== state.me?.id)
              .slice(0, 4)
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
          </Card>
          <Banner tone="private" title="A creators-only space">
            Fans cannot see this feed or the conversations it starts.
          </Banner>
        </aside>
      </div>
    </>
  );
}
