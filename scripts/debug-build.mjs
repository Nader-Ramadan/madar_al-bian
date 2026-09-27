/**
 * Instrumented production build wrapper. Logs environment/SWC probes, then
 * runs `next build` so Hostinger/local logs show where the process stalls.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const SESSION = "34450b";
const ENDPOINT = "http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3";

function dbg(hypothesisId, location, message, data) {
  const payload = {
    sessionId: SESSION,
    runId: "pre-fix",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  console.log(`[debug-build] ${message} ${JSON.stringify(data)}`);
  fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function probeSwcResolve() {
  const pkgs = [
    "@next/swc-linux-x64-gnu",
    "@next/swc-linux-x64-musl",
    "@next/swc-wasm-nodejs",
  ];
  const results = {};
  for (const name of pkgs) {
    try {
      results[name] = require.resolve(name);
    } catch {
      results[name] = "missing";
    }
  }
  return results;
}

function probeSwcLoad() {
  try {
    require("@next/swc-linux-x64-gnu");
    return { native: "gnu-ok" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { native: "gnu-fail", error: message.slice(0, 240) };
  }
}

const start = Date.now();
dbg("A", "scripts/debug-build.mjs:start", "build wrapper start", {
  node: process.version,
  platform: `${os.platform()}-${os.arch()}`,
  nodeEnv: process.env.NODE_ENV ?? null,
  cpus: os.cpus().length,
  totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
  freeMemMb: Math.round(os.freemem() / 1024 / 1024),
  babelCompiler: fs.existsSync(path.join(root, "node_modules/babel-plugin-react-compiler")),
  prismaClient: fs.existsSync(path.join(root, "node_modules/.prisma/client/index.d.ts")),
  swcResolve: probeSwcResolve(),
  swcLoad: probeSwcLoad(),
});

const child = spawn("npx", ["next", "build", "--webpack"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});

const heartbeat = setInterval(() => {
  dbg("B", "scripts/debug-build.mjs:heartbeat", "build still running", {
    elapsedSec: Math.round((Date.now() - start) / 1000),
  });
}, 30000);

child.on("exit", (code, signal) => {
  clearInterval(heartbeat);
  dbg("A", "scripts/debug-build.mjs:exit", "build process exited", {
    code,
    signal,
    elapsedSec: Math.round((Date.now() - start) / 1000),
  });
  process.exit(code === null ? 1 : code);
});
