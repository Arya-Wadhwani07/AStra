import {
  MongoClient,
  type Db,
  type ClientSession,
  type Document,
} from "mongodb";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { seed, type State, type Session, AppError } from "./model";
const collections = [
  "users",
  "posts",
  "opportunities",
  "responses",
  "briefs",
  "threads",
  "messages",
  "orders",
  "ledger",
  "notices",
  "reviews",
  "audit",
  "community",
  "campaigns",
] as const;
type Row = Document & { _id: string };
type SessionRow = { _id: string; data: Session; expires: Date };
let connection: Promise<{ client: MongoClient; database: Db }> | undefined;
function databaseName() {
  const name = process.env.ASTRA_DB_NAME || "astra";
  if (!/^astra(?:_[a-zA-Z0-9_]+)?$/.test(name))
    throw new Error("Use an astra-prefixed MongoDB database name.");
  return name;
}
async function writeSeed(database: Db, session: ClientSession) {
  let initial = seed();
  const legacy = join(process.cwd(), ".environment/data/legacy-state.json");
  if (database.databaseName === "astra" && existsSync(legacy))
    initial = JSON.parse(readFileSync(legacy, "utf8")) as State;
  for (const key of collections)
    if (initial[key].length)
      await database.collection<Row>(key).insertMany(
        initial[key].map((row) => ({ ...row, _id: row.id })),
        { session },
      );
  const carts = Object.entries(initial.carts).map(([user, items]) => ({
    _id: user,
    items,
  }));
  if (carts.length)
    await database.collection<Row>("carts").insertMany(carts, { session });
  await database
    .collection<Row>("meta")
    .insertOne({ _id: "state", version: 1, schemaVersion: 1 }, { session });
}
export async function db() {
  if (!connection)
    connection = (async () => {
      // Local-only: moving project data to Atlas needs separate authorization.
      const client = new MongoClient(
        "mongodb://127.0.0.1:27018/?replicaSet=astra",
        { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 },
      );
      try {
        await client.connect();
        const database = client.db(databaseName());
        await database
          .collection<SessionRow>("sessions")
          .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
        await database
          .collection<Row>("responses")
          .createIndex({ opportunity: 1, user: 1 }, { unique: true });
        await database
          .collection<Row>("messages")
          .createIndex({ thread: 1, created: 1 });
        await database
          .collection<Row>("orders")
          .createIndex({ buyer: 1, key: 1 });
        await database
          .collection<Row>("users")
          .createIndex(
            { spotifySubjectHash: 1 },
            { unique: true, sparse: true },
          );
        await database
          .collection<Row>("users")
          .createIndex(
            { googleSubjectHash: 1 },
            { unique: true, sparse: true },
          );
        await database.collection<Row>("ledger").createIndex(
          { user: 1, demoCampaign: 1 },
          {
            unique: true,
            partialFilterExpression: { demoCampaign: { $type: "string" } },
          },
        );
        if (
          !(await database.collection<Row>("meta").findOne({ _id: "state" }))
        ) {
          const session = client.startSession();
          try {
            await session.withTransaction(async () => {
              if (
                !(await database
                  .collection<Row>("meta")
                  .findOne({ _id: "state" }, { session }))
              )
                await writeSeed(database, session);
            });
          } finally {
            await session.endSession();
          }
        }
        return { client, database };
      } catch (error) {
        await client.close();
        connection = undefined;
        throw error;
      }
    })();
  return connection;
}
async function load(database: Db, session?: ClientSession): Promise<State> {
  const state = { carts: {} } as State;
  // Transaction operations deliberately run sequentially on a session.
  for (const key of collections) {
    const docs = await database
      .collection<Row>(key)
      .find({}, { session })
      .toArray();
    state[key] = docs.map(({ _id, ...row }) => row) as never;
  }
  const carts = await database
    .collection<Row>("carts")
    .find({}, { session })
    .toArray();
  state.carts = Object.fromEntries(carts.map((c) => [c._id, c.items]));
  state.posts.sort((a, b) => b.created.localeCompare(a.created));
  state.orders.sort((a, b) => b.created.localeCompare(a.created));
  state.ledger.sort((a, b) => b.date.localeCompare(a.date));
  return state;
}
export async function read(): Promise<State> {
  const { client, database } = await db();
  const session = client.startSession();
  try {
    return await session.withTransaction(() => load(database, session), {
      readConcern: { level: "snapshot" },
    });
  } finally {
    await session.endSession();
  }
}
export async function transaction<T>(fn: (state: State) => T): Promise<T> {
  const { client, database } = await db();
  const session = client.startSession();
  try {
    return await session.withTransaction(
      async () => {
        // Serialize aggregate invariants. A write conflict reruns this callback
        // on fresh state, protecting the last response slot, inventory and wallet.
        await database
          .collection<Row>("meta")
          .updateOne({ _id: "state" }, { $inc: { version: 1 } }, { session });
        const state = await load(database, session);
        const before = structuredClone(state);
        const result = fn(state);
        for (const key of collections) {
          const previous = new Map(
            before[key].map((row) => [row.id, JSON.stringify(row)]),
          );
          const nextIds = new Set(state[key].map((row) => row.id));
          for (const row of state[key])
            if (previous.get(row.id) !== JSON.stringify(row))
              await database
                .collection<Row>(key)
                .replaceOne(
                  { _id: row.id },
                  { ...row, _id: row.id },
                  { upsert: true, session },
                );
          for (const row of before[key])
            if (!nextIds.has(row.id))
              await database
                .collection<Row>(key)
                .deleteOne({ _id: row.id }, { session });
        }
        for (const [user, items] of Object.entries(state.carts))
          if (JSON.stringify(items) !== JSON.stringify(before.carts[user]))
            await database
              .collection<Row>("carts")
              .replaceOne(
                { _id: user },
                { _id: user, items },
                { upsert: true, session },
              );
        return result;
      },
      {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        maxCommitTimeMS: 5000,
      },
    );
  } finally {
    await session.endSession();
  }
}
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function createSession(data: Session) {
  const token = randomBytes(32).toString("hex");
  const { database } = await db();
  await database.collection<SessionRow>("sessions").insertOne({
    _id: hash(token),
    data,
    expires: new Date(Date.now() + 86400000),
  });
  return token;
}
export async function getSession(token?: string): Promise<Session | undefined> {
  if (!token) return;
  const { database } = await db();
  return (
    await database
      .collection<SessionRow>("sessions")
      .findOne({ _id: hash(token), expires: { $gt: new Date() } })
  )?.data;
}
export async function deleteSession(token?: string) {
  if (token) {
    const { database } = await db();
    await database
      .collection<SessionRow>("sessions")
      .deleteOne({ _id: hash(token) });
  }
}
export async function switchView(token: string, view: string) {
  const session = await getSession(token);
  if (!session) throw new AppError("Sign in first.", 401);
  const u = (await read()).users.find((u) => u.id === session.user);
  if (!u?.roles.includes(view as Session["view"]))
    throw new AppError("This account does not have that role.", 403);
  const { database } = await db();
  await database
    .collection<SessionRow>("sessions")
    .updateOne({ _id: hash(token) }, { $set: { "data.view": view } });
}
