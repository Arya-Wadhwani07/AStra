import { MongoBinary } from "mongodb-memory-server-core";
import { MongoClient } from "mongodb";
import { spawn } from "node:child_process";
import { mkdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
const root = realpathSync(process.cwd());
const directory = (relative) => {
  const path = join(root, relative);
  mkdirSync(path, { recursive: true });
  if (!realpathSync(path).startsWith(root + "/"))
    throw new Error("MongoDB path must stay in AStra.");
  return path;
};
const downloadDir = directory(".environment/cache/mongodb");
const dbPath = directory(".environment/data/mongodb");
const logs = directory(".environment/logs");
const binary = await MongoBinary.getPath({ version: "8.2.6", downloadDir });
const child = spawn(
  binary,
  [
    "--replSet",
    "astra",
    "--dbpath",
    dbPath,
    "--bind_ip",
    "127.0.0.1",
    "--port",
    "27018",
    "--nounixsocket",
    "--logpath",
    join(logs, "mongodb.log"),
    "--logappend",
    "--wiredTigerCacheSizeGB",
    "0.25",
    "--oplogSize",
    "128",
  ],
  { cwd: root, stdio: "inherit" },
);
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
const client = new MongoClient(
  "mongodb://127.0.0.1:27018/?directConnection=true",
  { serverSelectionTimeoutMS: 1000 },
);
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!ready)
    throw new Error(
      "MongoDB did not start. Inspect .environment/logs/mongodb.log.",
    );
  try {
    await client
      .db("admin")
      .command({
        replSetInitiate: {
          _id: "astra",
          members: [{ _id: 0, host: "127.0.0.1:27018" }],
        },
      });
  } catch (error) {
    if (error.codeName !== "AlreadyInitialized") throw error;
  }
  let primary = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if ((await client.db("admin").command({ hello: 1 })).isWritablePrimary) {
      primary = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!primary) throw new Error("MongoDB replica set did not elect a primary.");
  console.log("MongoDB ready at mongodb://127.0.0.1:27018/?replicaSet=astra");
  console.log(
    "Persistent data: " + dbPath + "\nPress Ctrl+C to stop. Data is retained.",
  );
} catch (error) {
  console.error(error.message);
  stop();
  process.exitCode = 1;
} finally {
  await client.close();
}
