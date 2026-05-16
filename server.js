/**
 * Hostinger / panel-friendly entry: binds Next to PORT from the environment.
 * Set "Application startup file" to server.js (or run: npm run start).
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;

/** Load .env then .env.production (Hostinger hPanel vars may not reach the child process). */
function loadEnvFiles() {
  for (const name of [".env", ".env.production"]) {
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) continue;
    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnvFiles();

const port = process.env.PORT || "3000";
const buildIdPath = path.join(root, ".next", "BUILD_ID");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

if (!fs.existsSync(nextBin)) {
  console.error("[server.js] Next.js CLI not found. Run npm install in the application root.");
  process.exit(1);
}

if (!fs.existsSync(buildIdPath)) {
  console.error(
    "[server.js] Missing production build (.next/BUILD_ID). On the server run: npm run build — then restart the Node app.",
  );
  process.exit(1);
}

const prismaClientIndex = path.join(root, "node_modules", ".prisma", "client", "index.js");
if (!fs.existsSync(prismaClientIndex)) {
  console.warn(
    "[server.js] Prisma client not generated. Run: npx prisma generate — then restart.",
  );
}

const hostname = process.env.HOSTNAME || "0.0.0.0";
const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", hostname, "-p", String(port)],
  {
    stdio: "inherit",
    env: process.env,
    cwd: root,
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code === null ? 1 : code);
});
