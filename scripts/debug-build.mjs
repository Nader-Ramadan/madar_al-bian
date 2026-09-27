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

function cgroupMemory() {
  const read = (p) => {
    try {
      return fs.readFileSync(p, "utf8").trim();
    } catch {
      return null;
    }
  };
  return {
    max: read("/sys/fs/cgroup/memory.max") ?? read("/sys/fs/cgroup/memory/memory.limit_in_bytes"),
    current: read("/sys/fs/cgroup/memory.current") ?? read("/sys/fs/cgroup/memory/memory.usage_in_bytes"),
    cpuMax: read("/sys/fs/cgroup/cpu.max"),
  };
}

// #region agent log
async function probeDb() {
  const explicit = process.env.DATABASE_URL?.trim();
  let host = process.env.DB_HOST?.trim() || null;
  let port = Number(process.env.DB_PORT?.trim() || 3306);
  if (explicit) {
    try {
      const u = new URL(explicit);
      host = u.hostname;
      port = Number(u.port || 3306);
    } catch {
      host = "unparseable";
    }
  }
  const info = {
    source: explicit ? "DATABASE_URL" : host ? "DB_*" : "none",
    bothSet: Boolean(explicit && process.env.DB_HOST?.trim()),
    dbHostVar: process.env.DB_HOST?.trim() || null,
    host,
    port,
  };
  if (!host || host === "unparseable") return info;
  const net = await import("node:net");
  const t0 = Date.now();
  info.tcp = await new Promise((resolve) => {
    const sock = net.connect({ host, port });
    const done = (result) => {
      sock.destroy();
      resolve({ ...result, ms: Date.now() - t0 });
    };
    sock.setTimeout(10000, () => done({ ok: false, error: "TIMEOUT_10s" }));
    sock.once("connect", () => done({ ok: true }));
    sock.once("error", (e) => done({ ok: false, error: e.code || e.message }));
  });
  return info;
}
dbg("H1/H10-H14", "scripts/debug-build.mjs:probeDb", "db reachability from build env", await probeDb());
// #endregion

const start = Date.now();
// #region agent log
dbg("H7", "scripts/debug-build.mjs:limits", "container limits", {
  cgroup: cgroupMemory(),
  nodeOptions: process.env.NODE_OPTIONS ?? null,
  heapLimitMb: Math.round(
    (await import("node:v8")).default.getHeapStatistics().heap_size_limit / 1024 / 1024,
  ),
});
// #endregion
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
    freeMemMb: Math.round(os.freemem() / 1024 / 1024),
    cgroup: cgroupMemory(),
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
