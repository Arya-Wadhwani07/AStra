// Mechanical port of approved reference primitives, without its canvas runtime.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
const root = process.cwd();
for (const path of [
  "src/components",
  "src/styles",
  "public/fonts",
  "public/media/motion",
  "public/media/mascot",
])
  mkdirSync(join(root, path), { recursive: true });
for (const name of ["tokens.css"])
  cpSync(
    join(root, "handoff/design-system", name),
    join(root, "src/styles", name),
  );
cpSync(
  join(root, "handoff/design-system/components/bundle.css"),
  join(root, "src/styles/components.css"),
);
writeFileSync(
  join(root, "src/styles/fonts.css"),
  readFileSync(
    join(root, "handoff/design-system/fonts.css"),
    "utf8",
  ).replaceAll('url("fonts/', 'url("/fonts/'),
);
cpSync(join(root, "handoff/design-system/fonts"), join(root, "public/fonts"), {
  recursive: true,
});
for (const group of ["motion", "mascot"])
  for (const name of readdirSync(join(root, "handoff/media", group))) {
    if (/\.(mp4|webm|jpg)$/.test(name) && !name.includes("original"))
      cpSync(
        join(root, "handoff/media", group, name),
        join(root, "public/media", group, name),
      );
  }
const source = readFileSync(
  join(root, "handoff/design-system/components/bundle.js"),
  "utf8",
);
const ranges = [
  ["  function cx()", "  var uid ="],
  ["  /* ---------- AuroraText", "  /* ---------- Inputs"],
  ["  /* ---------- Inputs", "  function FileUpload"],
  ["  function Logo(", "  function SideNav"],
  ["  var DISC =", "  function FeedCard"],
  ["  var TONE_ICON", "  function Dialog"],
  ["  function PrivateMarker", "  function ResponseForm"],
  ["  var CAND =", "  function QuantityStepper"],
  ["  function PointsBalance", "  function SummaryLine"],
  ["  function Eyebrow", "  /* ---------- MotionLoop"],
];
let code = ranges
  .map(([start, end]) =>
    source.slice(source.indexOf(start), source.indexOf(end)),
  )
  .join("\n");
code = code.replace(/  function mq\([^\n]+\n/g, "");
const names = [...code.matchAll(/  function ([A-Z]\w*)\(/g)].map((m) => m[1]);
const header = `'use client';\nimport React from 'react';\nimport { Icon } from './icons';\nconst h = React.createElement;\nconst Frag = React.Fragment;\nfunction useId(given) { const id = React.useId(); return given || id; }\n`;
writeFileSync(
  join(root, "src/components/primitives.js"),
  header + code + "\nexport { " + names.join(", ") + " };\n",
);
console.log(
  "Ported " +
    names.length +
    " reference primitives, approved CSS, fonts and web media. Handoff unchanged.",
);
