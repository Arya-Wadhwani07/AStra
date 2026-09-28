#!/usr/bin/env node
// Run development tools with project-local storage and a macOS write sandbox.
import { spawn } from "node:child_process";
import { realpathSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const args = process.argv.slice(2);
if (!args.length || args[0] === "--help") {
  console.log(
    "Usage: node scripts/env.mjs <command> [arguments...]\nExamples: npm install, npm run dev, npm run build",
  );
  process.exit(args.length ? 0 : 1);
}
if (process.platform !== "darwin" || !existsSync("/usr/bin/sandbox-exec")) {
  console.error(
    "Stopped: the macOS write sandbox is unavailable. No unsandboxed fallback is allowed.",
  );
  process.exit(1);
}
// Check each existing ancestor before creating anything, rejecting redirected paths.
function localDir(relative) {
  let current = root;
  for (const part of relative.split("/")) {
    current = join(current, part);
    if (!existsSync(current)) mkdirSync(current);
    const resolved = realpathSync(current);
    if (resolved !== root && !resolved.startsWith(root + "/")) {
      throw new Error("Stopped: an environment path resolves outside AStra.");
    }
  }
  return current;
}
const storage = localDir(".environment");
const tmp = localDir(".environment/tmp");
const env = {
  ...process.env,
  TMPDIR: tmp,
  TMP: tmp,
  TEMP: tmp,
  XDG_CACHE_HOME: localDir(".environment/cache/xdg"),
  XDG_CONFIG_HOME: localDir(".environment/config"),
  XDG_DATA_HOME: localDir(".environment/data"),
  XDG_STATE_HOME: localDir(".environment/state"),
  npm_config_cache: localDir(".environment/cache/npm"),
  npm_config_userconfig: join(storage, "config/npmrc"),
  npm_config_globalconfig: join(storage, "config/global-npmrc"),
  npm_config_prefix: localDir(".environment/npm-prefix"),
  npm_config_update_notifier: "false",
  npm_config_audit: "false",
  npm_config_fund: "false",
  NEXT_TELEMETRY_DISABLED: "1",
  PLAYWRIGHT_BROWSERS_PATH: localDir(".environment/cache/playwright"),
  PYTHONPYCACHEPREFIX: localDir(".environment/cache/python"),
  PYTHONUSERBASE: localDir(".environment/python-user"),
  PIP_CACHE_DIR: localDir(".environment/cache/pip"),
};
// HOME and CODEX_HOME deliberately remain unchanged. Tools trying to write
// there are denied by the OS rather than silently redirected or allowed.
const profile = `(version 1)
(allow default)
(deny file-write*)
(allow file-write* (subpath ${JSON.stringify(root)}))
`;
const child = spawn(
  "/usr/bin/sandbox-exec",
  ["-p", profile, "/usr/bin/env", ...args],
  {
    cwd: root,
    env,
    stdio: "inherit",
  },
);
child.on("error", (error) => {
  console.error("Environment launch failed:", error.message);
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
});
