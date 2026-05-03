/**
 * Hostinger / panel-friendly entry: binds Next to PORT from the environment.
 * Set "Application startup file" to server.js (or run: node server.js).
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const port = process.env.PORT || "3000";
const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

if (!fs.existsSync(nextBin)) {
  console.error("[server.js] Next.js CLI not found. Run npm install && npm run build first.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  stdio: "inherit",
  env: process.env,
  cwd: __dirname,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code === null ? 1 : code);
});
