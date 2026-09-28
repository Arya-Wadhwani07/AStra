import { randomUUID } from "node:crypto";
import { spotifyContent } from "./spotify-content";
import { youtubeContent } from "./youtube-content";

export type View = "audience" | "creator" | "admin";
export type User = {
  authProvider?: "spotify" | "google";
  spotifySubjectHash?: string;
  googleSubjectHash?: string;
  id: string;
  name: string;
  email: string;
  roles: View[];
  discipline: string;
  location: string;
  bio: string;
  skills: string[];
  portfolio: string;
  timezone: string;
  languages: string;
  experience: string;
  audienceSize: string;
  remote: boolean;
  availability: string;
  arrangements: string[];
  verification: "not submitted" | "pending" | "verified" | "action needed";
  cap: number;
  ticketsEligible: boolean;
  merchEligible: boolean;
  balance: number;
  pending: number;
  favorites: string[];
  settings: Record<string, boolean>;
};
export type Post = {
  spotifyUrl?: string;
  youtubeUrl?: string;
  demoCampaignId?: string;
  id: string;
  owner: string;
  type: "post" | "event" | "merch";
  title: string;
  body: string;
  art: string;
  price: number;
  stock: number;
  date: string;
  location: string;
  rights: string;
  published: boolean;
  created: string;
};
export type Opportunity = {
  id: string;
  owner: string;
  title: string;
  description: string;
  discipline: string;
  requiredSkills: string[];
  preferredSkills: string[];
  remote: boolean;
  arrangement: string;
  budget: string;
  deliverable: string;
  timing: string;
  limit: number;
  closed: boolean;
  seedCount: number;
  requiredLocation: string;
  requiredLanguage: string;
  requiredAvailability: string;
};
export type Response = {
  id: string;
  opportunity: string;
  user: string;
  message: string;
  status: "new" | "shortlisted" | "declined";
};
export type Brief = {
  id: string;
  opportunity: string;
  participants: string[];
  version: number;
  text: string;
  confirmed: string[];
};
export type Message = {
  id: string;
  thread: string;
  author: string;
  text: string;
  created: string;
};
export type Thread = {
  id: string;
  participants: string[];
  title: string;
  opportunity?: string;
};
export type Order = {
  id: string;
  buyer: string;
  seller: string;
  title: string;
  type: string;
  quantity: number;
  subtotal: number;
  points: number;
  paid: number;
  status: string;
  created: string;
  tracking: string;
  address: string;
  key: string;
};
export type Ledger = {
  demoCampaign?: string;
  id: string;
  user: string;
  source: string;
  activity: string;
  change: number;
  status: string;
  date: string;
};
export type Notice = {
  id: string;
  user: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
};
export type Review = {
  id: string;
  user: string;
  type: string;
  title: string;
  status: string;
  reason: string;
};
export type State = {
  users: User[];
  posts: Post[];
  opportunities: Opportunity[];
  responses: Response[];
  briefs: Brief[];
  threads: Thread[];
  messages: Message[];
  orders: Order[];
  ledger: Ledger[];
  notices: Notice[];
  reviews: Review[];
  audit: {
    id: string;
    actor: string;
    caseId: string;
    reason: string;
    decision: string;
    created: string;
  }[];
  community: { id: string; user: string; text: string; category: string }[];
  carts: Record<string, { item: string; quantity: number }[]>;
  campaigns: {
    id: string;
    owner: string;
    title: string;
    rule: string;
    status: string;
    demo?: boolean;
    link?: string;
    demoPoints?: number;
    created?: string;
  }[];
};
export type Session = { user: string; view: View };
export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export const id = () => randomUUID();
export const now = () => new Date().toISOString();
function text(
  value: unknown,
  label: string,
  max = 2000,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw new AppError(
      `Enter ${label}${max < 500 ? ` (${max} characters or fewer)` : ""}.`,
    );
  return value.trim();
}
function number(value: unknown, label: string, min: number, max: number) {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < min ||
    (value as number) > max
  )
    throw new AppError(
      `${label} must be a whole number from ${min} to ${max}.`,
    );
  return value as number;
}
function choice<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
): T {
  if (!values.includes(value as T))
    throw new AppError(`Choose a valid ${label}.`);
  return value as T;
}
const optional = (v: unknown, name: string, max = 1000) =>
  text(v ?? "", name, max, false);
const list = (v: unknown, name: string) =>
  optional(v, name, 500)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
const disciplines = [
  "painter",
  "musician",
  "writer",
  "dancer",
  "photographer",
  "video",
  "streamer",
  "educator",
] as const;
export const arrangements = [
  "paid",
  "exchange",
  "revenue",
  "unpaid",
  "open",
] as const;
const find = <T extends { id: string }>(
  rows: T[],
  key: unknown,
  name: string,
): T => {
  const item = rows.find((r) => r.id === key);
  if (!item) throw new AppError(`${name} not found.`, 404);
  return item;
};
export function actor(s: State, session: Session, role?: View) {
  const user = find(s.users, session.user, "Account");
  if (!user.roles.includes(session.view) || (role && session.view !== role))
    throw new AppError(
      `Switch to an authorized ${role || "account"} view to continue.`,
      403,
    );
  return user;
}
export function eligibility(op: Opportunity, user: User) {
  const missing = op.requiredSkills
    .filter(
      (skill) =>
        !user.skills.some((s) => s.toLowerCase() === skill.toLowerCase()),
    )
    .map((s) => `Skill: ${s}`);
  if (op.discipline !== user.discipline)
    missing.push(`Discipline: ${op.discipline}`);
  if (op.remote && !user.remote) missing.push("Available remotely");
  if (
    op.requiredLocation &&
    user.location.toLowerCase() !== op.requiredLocation.toLowerCase()
  )
    missing.push(`Location: ${op.requiredLocation}`);
  if (
    op.requiredLanguage &&
    !user.languages
      .toLowerCase()
      .split(",")
      .map((x) => x.trim())
      .includes(op.requiredLanguage.toLowerCase())
  )
    missing.push(`Language: ${op.requiredLanguage}`);
  if (op.requiredAvailability && user.availability !== op.requiredAvailability)
    missing.push(`Availability: ${op.requiredAvailability}`);
  return missing;
}
export const responseCount = (s: State, op: Opportunity) =>
  op.seedCount + s.responses.filter((r) => r.opportunity === op.id).length;
function notify(
  s: State,
  user: string,
  title: string,
  body: string,
  href: string,
) {
  s.notices.unshift({ id: id(), user, title, body, href, read: false });
}

export function seed(): State {
  const user = (
    uid: string,
    name: string,
    discipline: string,
    skills: string[],
    roles: View[] = ["audience", "creator"],
  ): User => ({
    id: uid,
    name,
    email: `${uid}@example.test`,
    roles,
    discipline,
    skills,
    location: "Los Angeles",
    bio: "Making things worth sharing. Open to thoughtful collaborations across creative disciplines.",
    portfolio: "https://example.com",
    timezone: "America/Los_Angeles",
    languages: "English",
    experience: "3-5 years",
    audienceSize: "1,000-10,000",
    remote: true,
    availability: "Available now",
    arrangements: [...arrangements],
    verification: "verified",
    cap: uid === "mira" ? 20 : 10,
    ticketsEligible: true,
    merchEligible: true,
    balance: 600,
    pending: 50,
    favorites: ["mira", "jonah", "priya", "nia"],
    settings: { email: false, motion: true, privateProfile: false },
  });
  const users = [
    user("alex", "Alex Morgan", "", [], ["audience"]),
    user("mira", "Mira Rao", "painter", ["Painting", "Art direction"]),
    user("eli", "Eli Chen", "video", [
      "Video editing",
      "Short-form video",
      "Motion design",
    ]),
    user("jonah", "Jonah Lee", "musician", ["Music production", "Songwriting"]),
    user("priya", "Priya Nair", "writer", ["Writing", "Editing"]),
    user("nia", "Nia Brooks", "dancer", ["Dance", "Choreography"]),
    user("sam", "Sam Ortiz", "photographer", ["Photography"]),
    user("rae", "Rae Park", "video", ["Motion design", "Video editing"]),
    user("admin", "Review team", "", [], ["admin"]),
  ];
  users.find((u) => u.id === "jonah")!.location = "Oakland";
  users.find((u) => u.id === "priya")!.location = "Pasadena";
  const post = (
    pid: string,
    owner: string,
    type: Post["type"],
    title: string,
    body: string,
    art: string,
    price = 0,
    stock = 0,
  ): Post => ({
    id: pid,
    owner,
    type,
    title,
    body,
    art,
    price,
    stock,
    date: "2026-10-10T18:00",
    location: "Los Angeles",
    rights: "Original work. Credit the creator; reuse requires permission.",
    published: true,
    created: "2026-09-27T12:00:00Z",
  });
  const opportunity = (
    oid: string,
    owner: string,
    title: string,
    discipline: string,
    requiredSkills: string[],
    budget: string,
  ): Opportunity => ({
    id: oid,
    owner,
    title,
    description:
      "Let’s bring two creative worlds together. I’m looking for a thoughtful partner to shape this project with me.",
    discipline,
    requiredSkills,
    preferredSkills: ["Motion design"],
    remote: true,
    arrangement: "paid",
    budget,
    deliverable: "One finished creative piece with a review round",
    timing: "October 2026",
    limit: 10,
    closed: false,
    seedCount: oid === "launch-reel" ? 7 : 3,
    requiredLocation: "",
    requiredLanguage: "",
    requiredAvailability: "",
  });
  return {
    users,
    posts: [
      post(
        "color-after-hours",
        "mira",
        "event",
        "Color After Hours",
        "A small evening show of new color-field work. Meet the artist, explore the process and stay for a conversation.",
        "event",
        2500,
        34,
      ),
      post(
        "slow-draft",
        "priya",
        "post",
        "Notes from a slow draft",
        "I rewrote the opening chapter four times this month. What finally made it click: reading it aloud to the dancers I’m writing about.",
        "",
        0,
      ),
      post(
        "dusk-study",
        "mira",
        "merch",
        "Dusk Study print",
        "Archival giclée print, 12 × 16 in. Signed on the back. A little color for your everyday space.",
        "print",
        4000,
        12,
      ),
      post(
        "rehearsal",
        "nia",
        "post",
        "Rehearsal notes: the spiral section",
        "Twelve counts, three dancers, one very patient floor. Full piece premieres in November.",
        "dance",
      ),
      post(
        "studio-notes",
        "jonah",
        "post",
        "A song starts with a small sound",
        "Field recordings from the weekend, shaped into something new in the studio.",
        "chrome",
      ),
    ],
    opportunities: [
      opportunity(
        "launch-reel",
        "mira",
        "Help turn my exhibition into a 30-second launch reel",
        "video",
        ["Video editing", "Short-form video"],
        "$600",
      ),
      opportunity(
        "ep-cover",
        "jonah",
        "A visual world for my next EP",
        "painter",
        ["Painting"],
        "$450",
      ),
      opportunity(
        "essay-art",
        "priya",
        "Illustrations for a personal essay series",
        "painter",
        ["Painting"],
        "$300",
      ),
    ],
    responses: [
      {
        id: "response-eli",
        opportunity: "launch-reel",
        user: "eli",
        message:
          "I’d love to translate the rhythm of your paintings into a short film.",
        status: "shortlisted",
      },
    ],
    briefs: [
      {
        id: "brief-reel",
        opportunity: "launch-reel",
        participants: ["mira", "eli"],
        version: 2,
        text: "Roles: Mira supplies artwork and art direction. Eli edits the film.\nDeliverables: one 30-second reel, vertical and square exports.\nDates: first cut October 3, final October 7.\nCredit: both creators credited in caption.\nIntended use: Mira’s exhibition announcement and social channels.\nApprovals: one review round with both participants.\nProposed payment: $600 paid directly between participants. AStra does not process collaboration payments.",
        confirmed: ["mira"],
      },
    ],
    threads: [
      {
        id: "thread-reel",
        participants: ["mira", "eli"],
        opportunity: "launch-reel",
        title: "Color After Hours launch reel",
      },
      {
        id: "thread-jonah",
        participants: ["mira", "jonah"],
        title: "A visual world for the next EP",
      },
    ],
    messages: [
      {
        id: "msg-1",
        thread: "thread-reel",
        author: "mira",
        text: "I updated the brief with the two export formats. Could you review version 2?",
        created: "2026-09-27T12:00:00Z",
      },
      {
        id: "msg-2",
        thread: "thread-jonah",
        author: "jonah",
        text: "Your color studies would be a lovely starting point for the EP artwork. Interested in talking?",
        created: "2026-09-27T11:00:00Z",
      },
    ],
    orders: [
      {
        id: "AST-24809",
        buyer: "alex",
        seller: "mira",
        title: "Dusk Study print",
        type: "merch",
        quantity: 1,
        subtotal: 4000,
        points: 0,
        paid: 4000,
        status: "Preparing",
        created: "2026-09-25T12:00:00Z",
        tracking: "",
        address: "Sample address withheld. Fictional order.",
        key: "seed-print",
      },
    ],
    ledger: [
      {
        id: "ledger1",
        user: "alex",
        source: "Mira Rao",
        activity: "Sample approved activity",
        change: 200,
        status: "approved",
        date: "2026-09-24",
      },
      {
        id: "ledger2",
        user: "alex",
        source: "Jonah Lee",
        activity: "Sample approved activity",
        change: 250,
        status: "approved",
        date: "2026-09-25",
      },
      {
        id: "ledger3",
        user: "alex",
        source: "Nia Brooks",
        activity: "Sample approved activity",
        change: 150,
        status: "approved",
        date: "2026-09-26",
      },
      {
        id: "ledger4",
        user: "alex",
        source: "Mira Rao",
        activity: "Sample activity awaiting review",
        change: 50,
        status: "pending",
        date: "2026-09-27",
      },
    ],
    notices: [
      {
        id: "notice1",
        user: "alex",
        title: "Color After Hours is coming up",
        body: "Mira shared a new event in Los Angeles.",
        href: "/events/color-after-hours",
        read: false,
      },
    ],
    reviews: [
      {
        id: "CASE-311",
        user: "sam",
        type: "verification",
        title: "Creator verification request",
        status: "pending",
        reason: "",
      },
    ],
    audit: [],
    community: [
      {
        id: "community1",
        user: "jonah",
        text: "Looking for a painter to build a visual world around a new EP. What makes a good first collaboration?",
        category: "Work in progress",
      },
      {
        id: "community2",
        user: "nia",
        text: "Sharing a few rehearsal notes. Movement and film people: what are you making this week?",
        category: "Work in progress",
      },
    ],
    carts: {},
    campaigns: [],
  };
}

export function demoContentLink(value: unknown) {
  if (typeof value !== "string" || value.length > 1000)
    throw new AppError("Enter a Spotify or YouTube content link.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("Enter a valid content URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    throw new AppError("Use a secure Spotify or YouTube content link.");
  const spotify = spotifyContent(value);
  if (spotify) return spotify.url;
  const video = youtubeContent(value);
  if (video) return video.url;
  throw new AppError(
    "Use a Spotify album/track or YouTube video/Shorts link. Shortened and other-domain links are not supported.",
  );
}

export function snapshot(s: State, session?: Session) {
  const me = session ? actor(s, session) : null;
  const creator = session?.view === "creator";
  const admin = session?.view === "admin";
  const publicCreators = s.users
    .filter((u) => u.roles.includes("creator"))
    .map((u) => ({
      id: u.id,
      name: u.name,
      discipline: u.discipline,
      location: u.location,
      bio: u.bio,
      portfolio: u.portfolio,
      verification: u.verification,
      cap: u.cap,
      ticketsEligible: u.ticketsEligible,
      merchEligible: u.merchEligible,
    }));
  const threads = creator
    ? s.threads.filter((t) => t.participants.includes(me!.id))
    : [];
  // Campaigns are the source of truth. Derive feed cards instead of keeping
  // duplicate post/campaign records that could drift or award twice.
  const spotifyPosts: Post[] =
    process.env.ASTRA_DEMO === "1"
      ? s.campaigns.flatMap((c) => {
          if (!c.demo) return [];
          const content = spotifyContent(c.link);
          const video = youtubeContent(c.link);
          if (!content && !video) return [];
          return [
            {
              id: `${content ? "spotify" : "youtube"}-campaign-${c.id}`,
              owner: c.owner,
              type: "post",
              title: c.title,
              body: c.rule,
              art: "",
              price: 0,
              stock: 0,
              date: "",
              location: "",
              rights:
                "Creator-submitted link; artist ownership is not verified.",
              published: true,
              created: c.created || "",
              spotifyUrl: content?.url,
              youtubeUrl: video?.url,
              demoCampaignId: c.id,
            },
          ];
        })
      : [];
  return {
    demoEnabled: process.env.ASTRA_DEMO === "1",
    demoCampaigns:
      process.env.ASTRA_DEMO === "1"
        ? s.campaigns
            .filter((c) => c.demo === true)
            .map((c) => ({
              id: c.id,
              owner: c.owner,
              title: c.title,
              link: c.link,
              demoPoints: c.demoPoints,
              claimed: Boolean(
                me &&
                s.ledger.some(
                  (l) => l.user === me.id && l.demoCampaign === c.id,
                ),
              ),
            }))
        : [],
    me: me
      ? (({
          spotifySubjectHash: _privateIdentity,
          googleSubjectHash: _googleIdentity,
          ...safe
        }) => safe)(me)
      : null,
    view: session?.view ?? null,
    creators: publicCreators,
    posts: [...s.posts.filter((p) => p.published), ...spotifyPosts].sort(
      (a, b) => b.created.localeCompare(a.created),
    ),
    myPosts: creator ? s.posts.filter((p) => p.owner === me!.id) : [],
    cart: me ? s.carts[me.id] || [] : [],
    orders: me
      ? s.orders.filter(
          (o) => admin || (creator ? o.seller === me.id : o.buyer === me.id),
        )
      : [],
    ledger: me ? s.ledger.filter((l) => l.user === me.id) : [],
    notices: me
      ? s.notices.filter(
          (n) => n.user === me.id && (creator || !n.href.startsWith("/studio")),
        )
      : [],
    ...(creator
      ? {
          opportunities: s.opportunities.map((op) => ({
            ...op,
            count: responseCount(s, op),
            missing: eligibility(op, me!),
          })),
          responses: s.responses.filter(
            (r) =>
              r.user === me!.id ||
              s.opportunities.some(
                (o) => o.id === r.opportunity && o.owner === me!.id,
              ),
          ),
          briefs: s.briefs.filter((b) => b.participants.includes(me!.id)),
          threads,
          messages: s.messages.filter((m) =>
            threads.some((t) => t.id === m.thread),
          ),
          community: s.community,
          campaigns: s.campaigns.filter((c) => c.owner === me!.id),
        }
      : {}),
    ...(admin ? { reviews: s.reviews, audit: s.audit } : {}),
  };
}
export type Snapshot = ReturnType<typeof snapshot>;

export function mutate(
  s: State,
  session: Session,
  action: string,
  data: Record<string, unknown>,
): unknown {
  const me = actor(s, session);
  const creator = () => actor(s, session, "creator");
  const owned = <T extends { id: string; owner: string }>(
    rows: T[],
    key: unknown,
    name: string,
  ) => {
    creator();
    const r = find(rows, key, name);
    if (r.owner !== me.id)
      throw new AppError("Only the owner can change this.", 403);
    return r;
  };
  switch (action) {
    case "favorite": {
      const target = find(s.users, data.id, "Creator");
      if (!target.roles.includes("creator"))
        throw new AppError("Choose a creator.");
      me.favorites = me.favorites.includes(target.id)
        ? me.favorites.filter((x) => x !== target.id)
        : [...me.favorites, target.id];
      break;
    }
    case "settings": {
      for (const key of ["email", "motion", "privateProfile"])
        if (typeof data[key] === "boolean")
          me.settings[key] = data[key] as boolean;
      break;
    }
    case "read": {
      for (const n of s.notices)
        if (n.user === me.id && (!data.id || n.id === data.id)) n.read = true;
      break;
    }
    case "profile": {
      creator();
      me.name = text(data.name, "your display name", 80);
      me.bio = optional(data.bio, "a short bio", 600);
      me.discipline = choice(data.discipline, disciplines, "discipline");
      me.location = text(data.location, "your location", 100);
      me.skills = list(data.skills, "skills");
      me.portfolio = optional(data.portfolio, "a portfolio URL", 500);
      if (me.portfolio && !/^https:\/\//.test(me.portfolio))
        throw new AppError("Use an https:// portfolio URL.");
      me.timezone = text(data.timezone, "your time zone", 100);
      me.languages = text(data.languages, "languages", 100);
      me.experience = optional(data.experience, "experience", 100);
      me.audienceSize = optional(data.audienceSize, "audience size", 100);
      me.remote = data.remote === true;
      me.availability = choice(
        data.availability,
        ["Available now", "Next month", "Not available"],
        "availability",
      );
      break;
    }
    case "verification": {
      creator();
      if (me.verification === "verified" || me.verification === "pending")
        throw new AppError(
          "This account is already verified or awaiting review.",
        );
      me.verification = "pending";
      s.reviews.unshift({
        id: `CASE-${id().slice(0, 8)}`,
        user: me.id,
        title: "Simulated creator verification",
        type: "verification",
        status: "pending",
        reason: "",
      });
      break;
    }
    case "loyalty": {
      creator();
      if (me.verification !== "verified")
        throw new AppError(
          "Complete creator verification before accepting discounts.",
          403,
        );
      me.cap = number(data.cap, "Demo maximum discount", 0, 99);
      me.ticketsEligible = data.ticketsEligible === true;
      me.merchEligible = data.merchEligible === true;
      break;
    }
    case "campaign": {
      creator();
      const demo = data.demo === true;
      if (demo && process.env.ASTRA_DEMO !== "1")
        throw new AppError("Demo rewards are disabled.", 403);
      const link = demo ? demoContentLink(data.link) : undefined;
      const demoPoints = demo
        ? number(data.demoPoints, "Demo points", 1, 100)
        : undefined;
      s.campaigns.unshift({
        id: id(),
        owner: me.id,
        title: text(data.title, "a campaign title", 100),
        rule: text(data.rule, "a proposed earning rule", 500),
        status: demo
          ? "Hackathon demo. One click award per account; no verified listening."
          : "Draft. Earning not enabled.",
        ...(demo ? { demo: true, link, demoPoints } : {}),
        created: now(),
      });
      break;
    }
    case "demo-link-open": {
      if (process.env.ASTRA_DEMO !== "1")
        throw new AppError("Demo rewards are disabled.", 403);
      const campaign = find(s.campaigns, data.id, "Demo campaign");
      if (!campaign.demo || !campaign.link || !campaign.demoPoints)
        throw new AppError("This campaign does not award demo points.");
      if (campaign.owner === me.id)
        throw new AppError(
          "Creators cannot claim their own demo campaign.",
          403,
        );
      const link = demoContentLink(campaign.link);
      if (
        s.ledger.some((l) => l.user === me.id && l.demoCampaign === campaign.id)
      )
        return { url: link, awarded: 0 };
      const points = number(campaign.demoPoints, "Demo points", 1, 100);
      if (!Number.isSafeInteger(me.balance + points))
        throw new AppError("Demo balance limit reached.");
      me.balance += points;
      s.ledger.unshift({
        id: id(),
        user: me.id,
        demoCampaign: campaign.id,
        source: "Hackathon simulation",
        activity: `Demo link-open request: ${campaign.title} (not a verified listen)`,
        change: points,
        status: "approved",
        date: now(),
      });
      return { url: link, awarded: points };
    }
    case "publish": {
      creator();
      const type = choice(
        data.type,
        ["post", "event", "merch"],
        "content type",
      );
      const published = data.published === true;
      if (type !== "post" && published && me.verification !== "verified")
        throw new AppError("Verify your creator profile before selling.", 403);
      const previous = data.id ? owned(s.posts, data.id, "Content") : null;
      const post: Post = {
        id: previous?.id || id(),
        owner: me.id,
        type,
        title: text(data.title, "a title", 140),
        body: text(data.body, "a description"),
        art:
          type === "event" ? "event" : type === "merch" ? "print" : "painting",
        price:
          type === "post"
            ? 0
            : number(data.price, "Price in cents", 100, 1000000),
        stock:
          type === "post"
            ? 0
            : number(data.stock, "Available quantity", 0, 10000),
        date: optional(data.date, "event date", 50),
        location: optional(data.location, "location", 150),
        rights: text(data.rights, "rights and credit information", 1000),
        published,
        created: previous?.created || now(),
      };
      if (
        type === "event" &&
        (!post.date ||
          !Number.isFinite(Date.parse(post.date)) ||
          !post.location)
      )
        throw new AppError("Add a valid event date and location.");
      if (previous) Object.assign(previous, post);
      else s.posts.unshift(post);
      return post.id;
    }
    case "content-status": {
      const p = owned(s.posts, data.id, "Content");
      choice(data.status, ["publish", "unpublish", "delete"], "content status");
      if (data.status === "delete") {
        if (p.published) throw new AppError("Unpublish before deleting.");
        s.posts = s.posts.filter((x) => x.id !== p.id);
      } else {
        if (
          data.status === "publish" &&
          p.type !== "post" &&
          me.verification !== "verified"
        )
          throw new AppError("Verification is required.", 403);
        p.published = data.status === "publish";
      }
      break;
    }
    case "cart": {
      const quantity = number(data.quantity, "Quantity", 0, 10);
      const rows = (s.carts[me.id] ||= []);
      if (!quantity) {
        s.carts[me.id] = rows.filter((r) => r.item !== data.id);
        break;
      }
      const item = find(s.posts, data.id, "Item");
      if (!item.published || item.type === "post" || item.stock < quantity)
        throw new AppError("This item is unavailable in that quantity.");
      const old = rows.find((r) => r.item === item.id);
      if (old) old.quantity = quantity;
      else rows.push({ item: item.id, quantity });
      break;
    }
    case "checkout": {
      actor(s, session, "audience");
      const key = text(data.key, "a checkout reference", 100);
      const existing = s.orders.filter(
        (o) => o.buyer === me.id && o.key === key,
      );
      if (existing.length) return existing.map((o) => o.id);
      const cart = s.carts[me.id] || [];
      if (!cart.length) throw new AppError("Your cart is empty.");
      const selections = data.points as Record<string, unknown>;
      if (
        !selections ||
        typeof selections !== "object" ||
        Array.isArray(selections)
      )
        throw new AppError("Choose points for each item.");
      let totalPoints = 0;
      const orders = cart.map((row) => {
        const p = find(s.posts, row.item, "Item");
        const seller = find(s.users, p.owner, "Creator");
        if (
          !p.published ||
          p.type === "post" ||
          p.stock < row.quantity ||
          seller.verification !== "verified"
        )
          throw new AppError(
            `${p.title} is no longer available. Your balance has not changed.`,
          );
        const subtotal = p.price * row.quantity;
        const eligible =
          p.type === "event" ? seller.ticketsEligible : seller.merchEligible;
        const max = eligible ? Math.floor((subtotal * seller.cap) / 100) : 0;
        const points = number(
          selections[p.id] ?? 0,
          `Points for ${p.title}`,
          0,
          max,
        );
        totalPoints += points;
        return {
          id: `AST-${id().slice(0, 8).toUpperCase()}`,
          buyer: me.id,
          seller: seller.id,
          title: p.title,
          type: p.type,
          quantity: row.quantity,
          subtotal,
          points,
          paid: subtotal - points,
          status: p.type === "event" ? "Ticket issued" : "Preparing",
          created: now(),
          tracking: "",
          address:
            p.type === "merch"
              ? text(data.address, "a sample delivery address", 500)
              : "",
          key,
        };
      });
      if (totalPoints > me.balance)
        throw new AppError(
          "You selected more points than your approved balance.",
        );
      // Local payment simulation only. Validate everything before debiting or fulfilling.
      if (data.outcome !== "success")
        throw new AppError(
          "Simulated payment did not succeed. No money was charged and no points were spent.",
        );
      me.balance -= totalPoints;
      for (const row of cart)
        find(s.posts, row.item, "Item").stock -= row.quantity;
      s.orders.unshift(...orders);
      s.carts[me.id] = [];
      for (const o of orders) {
        if (o.points)
          s.ledger.unshift({
            id: id(),
            user: me.id,
            source: find(s.users, o.seller, "Creator").name,
            activity: `Discount on ${o.title}`,
            change: -o.points,
            status: "redeemed",
            date: now().slice(0, 10),
          });
        notify(
          s,
          me.id,
          "Sample order confirmed",
          `${o.title}. No real charge or email.`,
          "/orders",
        );
      }
      return orders.map((o) => o.id);
    }
    case "fulfil": {
      creator();
      const o = find(s.orders, data.id, "Order");
      if (o.seller !== me.id || o.type !== "merch")
        throw new AppError(
          "This order cannot be shipped by this account.",
          403,
        );
      const tracking = text(data.tracking, "a tracking reference", 100);
      if (o.status === "Shipped" && o.tracking === tracking) return null;
      if (o.status !== "Preparing")
        throw new AppError(
          "Only orders awaiting fulfilment can be shipped. Refund requests remain on hold.",
          409,
        );
      o.tracking = tracking;
      o.status = "Shipped";
      notify(
        s,
        o.buyer,
        "Your sample order shipped",
        `${o.title}: ${o.tracking}`,
        "/orders",
      );
      break;
    }
    case "refund": {
      const o = find(s.orders, data.id, "Order");
      if (o.buyer !== me.id)
        throw new AppError("This order belongs to another account.", 403);
      if (o.status === "Refund requested")
        throw new AppError("The refund request is already recorded.");
      o.status = "Refund requested";
      s.reviews.unshift({
        id: `CASE-${id().slice(0, 8)}`,
        user: me.id,
        type: "refund",
        title: `Refund request: ${o.id}. No automatic points restoration.`,
        status: "pending",
        reason: "",
      });
      break;
    }
    case "opportunity": {
      creator();
      const limit = number(data.limit, "Response limit", 5, 20);
      if (![5, 10, 20].includes(limit))
        throw new AppError("Choose 5, 10 or 20 responses.");
      const op: Opportunity = {
        id: id(),
        owner: me.id,
        title: text(data.title, "an opportunity title", 140),
        description: text(data.description, "a project description"),
        discipline: choice(data.discipline, disciplines, "discipline"),
        requiredSkills: list(data.requiredSkills, "required skills"),
        preferredSkills: list(data.preferredSkills, "preferred skills"),
        remote: data.remote === true,
        arrangement: choice(data.arrangement, arrangements, "arrangement"),
        budget: optional(data.budget, "compensation details", 200),
        deliverable: text(data.deliverable, "a deliverable", 300),
        timing: text(data.timing, "a timeframe", 100),
        limit,
        closed: false,
        seedCount: 0,
        requiredLocation: optional(
          data.requiredLocation,
          "required location",
          100,
        ),
        requiredLanguage: optional(
          data.requiredLanguage,
          "required language",
          100,
        ),
        requiredAvailability: optional(
          data.requiredAvailability,
          "required availability",
          100,
        ),
      };
      s.opportunities.unshift(op);
      return op.id;
    }
    case "opportunity-status": {
      const op = owned(s.opportunities, data.id, "Opportunity");
      if (typeof data.closed !== "boolean")
        throw new AppError(
          "Choose whether to close or reopen the opportunity.",
        );
      op.closed = data.closed === true;
      break;
    }
    case "respond": {
      creator();
      const op = find(s.opportunities, data.id, "Opportunity");
      if (op.owner === me.id)
        throw new AppError("You cannot respond to your own opportunity.");
      if (s.responses.some((r) => r.opportunity === op.id && r.user === me.id))
        throw new AppError(
          "You have already responded to this opportunity.",
          409,
        );
      if (op.closed || responseCount(s, op) >= op.limit)
        throw new AppError("Responses are closed or paused at the limit.", 409);
      const missing = eligibility(op, me);
      if (missing.length)
        throw new AppError(
          `Required profile details do not match: ${missing.join(", ")}.`,
          403,
        );
      const message = text(data.message, "a response", 280);
      const thread = id();
      s.responses.push({
        id: id(),
        opportunity: op.id,
        user: me.id,
        message,
        status: "new",
      });
      s.threads.push({
        id: thread,
        participants: [me.id, op.owner],
        title: op.title,
        opportunity: op.id,
      });
      s.messages.push({
        id: id(),
        thread,
        author: me.id,
        text: message,
        created: now(),
      });
      notify(
        s,
        op.owner,
        "New collaboration response",
        `${me.name} responded to ${op.title}.`,
        "/studio/collaborations",
      );
      return thread;
    }
    case "response-status": {
      creator();
      const r = find(s.responses, data.id, "Response");
      owned(s.opportunities, r.opportunity, "Opportunity");
      r.status = choice(
        data.status,
        ["shortlisted", "declined"],
        "response status",
      );
      break;
    }
    case "brief": {
      const op = owned(s.opportunities, data.opportunity, "Opportunity");
      const old = s.briefs.find((b) => b.opportunity === op.id);
      const participants = [
        me.id,
        ...s.responses
          .filter((r) => r.opportunity === op.id && r.status === "shortlisted")
          .map((r) => r.user),
      ];
      if (participants.length < 2)
        throw new AppError(
          "Shortlist at least one creator before creating a brief.",
        );
      const next = {
        id: old?.id || id(),
        opportunity: op.id,
        participants,
        version: (old?.version || 0) + 1,
        text: text(data.text, "a complete brief", 5000),
        confirmed: [] as string[],
      };
      if (old) Object.assign(old, next);
      else s.briefs.push(next);
      return next.id;
    }
    case "confirm-brief": {
      creator();
      const b = find(s.briefs, data.id, "Brief");
      if (!b.participants.includes(me.id))
        throw new AppError("Only participants can confirm this brief.", 403);
      if (data.version !== b.version)
        throw new AppError(
          "The brief changed. Review the latest version.",
          409,
        );
      if (!b.confirmed.includes(me.id)) b.confirmed.push(me.id);
      break;
    }
    case "direct": {
      creator();
      const target = find(s.users, data.id, "Creator");
      if (!target.roles.includes("creator") || target.id === me.id)
        throw new AppError("Choose another creator.");
      const old = s.threads.find(
        (t) =>
          !t.opportunity &&
          t.participants.includes(me.id) &&
          t.participants.includes(target.id),
      );
      if (old) return old.id;
      const thread = {
        id: id(),
        participants: [me.id, target.id],
        title: `Conversation with ${target.name}`,
      };
      s.threads.push(thread);
      return thread.id;
    }
    case "message": {
      creator();
      const thread = find(s.threads, data.thread, "Conversation");
      if (!thread.participants.includes(me.id))
        throw new AppError("This conversation is private.", 403);
      s.messages.push({
        id: id(),
        thread: thread.id,
        author: me.id,
        text: text(data.text, "a message", 2000),
        created: now(),
      });
      break;
    }
    case "community": {
      creator();
      s.community.unshift({
        id: id(),
        user: me.id,
        text: text(data.text, "a community post", 1000),
        category: choice(
          data.category,
          ["Work in progress", "Events", "Discussion"],
          "category",
        ),
      });
      break;
    }
    case "report": {
      const title = text(data.title, "a report reason", 500);
      s.reviews.unshift({
        id: `CASE-${id().slice(0, 8)}`,
        user: me.id,
        title,
        type: "content",
        status: "pending",
        reason: "",
      });
      break;
    }
    case "review": {
      actor(s, session, "admin");
      const review = find(s.reviews, data.id, "Review");
      const decision = choice(
        data.decision,
        ["approved", "action needed", "held"],
        "decision",
      );
      const reason = text(data.reason, "a decision reason", 1000);
      if (review.type === "refund" && decision === "approved")
        throw new AppError(
          "Refund settlement is unresolved. Hold for manual review; no money or points may be changed.",
        );
      review.status = decision;
      review.reason = reason;
      if (review.type === "verification" && decision !== "held")
        find(s.users, review.user, "Creator").verification =
          decision === "approved" ? "verified" : "action needed";
      s.audit.unshift({
        id: id(),
        actor: me.id,
        caseId: review.id,
        reason,
        decision,
        created: now(),
      });
      notify(s, review.user, `Review ${decision}`, reason, "/notifications");
      break;
    }
    default:
      throw new AppError("Unknown action.", 404);
  }
  return null;
}

export function register(s: State, data: Record<string, unknown>) {
  const role = choice(
    data.role,
    ["audience", "creator", "both"],
    "account type",
  );
  const u: User = {
    ...structuredClone(s.users[0]),
    id: id(),
    name: text(data.name, "a sample name", 80),
    email: `${id().slice(0, 8)}@example.test`,
    roles: role === "both" ? ["audience", "creator"] : [role],
    discipline: "painter",
    skills: [],
    favorites: [],
    balance: 0,
    pending: 0,
    cap: 0,
    verification: "not submitted",
    bio: "",
    portfolio: "",
  };
  delete u.authProvider;
  delete u.spotifySubjectHash;
  delete u.googleSubjectHash;
  s.users.push(u);
  return {
    user: u.id,
    view: role === "audience" ? "audience" : "creator",
  } as Session;
}
