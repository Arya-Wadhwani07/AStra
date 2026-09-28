import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
const file = ".environment/config/admin-key";
if (!existsSync(file))
  writeFileSync(file, randomBytes(24).toString("hex"), {
    mode: 0o600,
    flag: "wx",
  });
console.log(
  "Local demo admin key (do not share or commit):\n" +
    readFileSync(file, "utf8"),
);
