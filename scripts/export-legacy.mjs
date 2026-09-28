import { DatabaseSync } from "node:sqlite";
import { existsSync, writeFileSync } from "node:fs";
const input = ".environment/data/astra.sqlite";
const output = ".environment/data/legacy-state.json";
if (!existsSync(input)) {
  console.log("No legacy data. MongoDB will initialize with sample records.");
  process.exit(0);
}
if (existsSync(output)) {
  console.log("Legacy export already exists. Preserving it unchanged.");
  process.exit(0);
}
const db = new DatabaseSync(input, { readOnly: true });
const row = db.prepare("SELECT data FROM state WHERE id=1").get();
if (row) writeFileSync(output, row.data, { flag: "wx", mode: 0o600 });
db.close();
console.log(
  "Exported legacy data inside AStra. Original SQLite files were preserved.",
);
