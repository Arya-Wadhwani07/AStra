# Project-local development environment

Authorized write boundary: `/Users/arya/Personal/Code/Projects/AStra`.

Run development commands from this folder through the wrapper:

```sh
node scripts/env.mjs npm install
node scripts/env.mjs npm run dev
node scripts/env.mjs npm run build
```

The app is scaffolded. Start MongoDB first in a separate terminal:

```sh
node scripts/env.mjs npm run db:start
```

Then start the app with the development command above. Open `http://127.0.0.1:3000` (use the numeric address because another application may occupy IPv6 localhost).

MongoDB runs only on `127.0.0.1:27018`, with a single-node `astra` replica set for transactions. Its binary is in `.environment/cache/mongodb/`, its persistent database files are in `.environment/data/mongodb/`, and its log is `.environment/logs/mongodb.log`. Stopping the process retains data. There is no Docker volume, system service or global installation. This unauthenticated loopback database is for local demonstration only, not deployment.

The wrapper uses the existing Node installation without modifying it. Dependencies belong in this project's `node_modules`; caches, configuration, temporary files, and tool state belong in `.environment/`. App build output stays in the project. No global installations are needed. It does not change `HOME`, shell profiles, or system configuration.

On this Mac, `sandbox-exec` denies filesystem writes outside the resolved project directory for the launched command and its child processes. If sandbox startup fails, stop and diagnose it; do not run the command without the wrapper. Do not use symlinks or external services to evade the boundary. Avoid commands that ask other system services to modify files on their behalf.

This is a Node project environment, not a Python virtual environment or Docker container. Docker is not used because its image and volume storage may live outside the project. This wrapper is a local filesystem write restriction, not a complete security container: network access and reads are not isolated. It does not constrain unrelated Mac apps or the hosting coding application. File edits by the coding agent must independently stay within AStra.

The macOS sandbox is platform-specific. Do not silently fall back to an unprotected environment on another operating system. Application dependencies are installed locally and recorded in `package-lock.json`.
