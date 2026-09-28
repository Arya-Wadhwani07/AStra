// Mechanically generate a finite icon map to avoid bundling the entire catalog.
import { readFileSync, writeFileSync } from "node:fs";
import * as phosphor from "@phosphor-icons/react";
const reference = readFileSync(
  "handoff/design-system/components/bundle.js",
  "utf8",
);
const names = [
  ...new Set([
    ...Object.keys(JSON.parse(reference.match(/var ICONS = (\{[^\n]+\});/)[1])),
    "sign-out",
    "handshake",
    "flag",
    "download-simple",
    "shield-check",
  ]),
].sort();
const pascal = (name) =>
  name === "t-shirt"
    ? "TShirt"
    : name
        .split("-")
        .map((x) => x[0].toUpperCase() + x.slice(1))
        .join("");
for (const name of names)
  if (!phosphor[pascal(name)]) throw new Error("Unknown Phosphor icon " + name);
const source = readFileSync("src/components/icons.tsx", "utf8");
const imports = `import { ${names.map(pascal).join(", ")}, type Icon as PhosphorIcon } from '@phosphor-icons/react';\nconst icons: Record<string, PhosphorIcon> = {\n${names.map((n) => `  '${n}': ${pascal(n)}`).join(",\n")}\n};\n`;
const start = source.indexOf("export function Icon");
const component = source
  .slice(start)
  .replace(/  const key = [^\n]+\n/, "")
  .replace(
    /  const Component = [^\n]+\n/,
    "  const Component = icons[name] || Sparkle;\n",
  );
writeFileSync(
  "src/components/icons.tsx",
  "'use client';\n" + imports + component,
);
console.log(`Mapped ${names.length} named Phosphor icons.`);
