/**
 * Run before `npm run dev` — prisma generate without blocking dev when the
 * query engine is locked by another Node process (Windows EPERM).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSchema = path.join(root, "node_modules", ".prisma", "client", "schema.prisma");

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

const project = read(path.join(root, "prisma", "schema.prisma"));
const client = read(clientSchema);
const clientStale =
  project.includes("authorPhone") && !client.includes("authorPhone");

if (!clientStale && client.includes("model PublicationRequest")) {
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "generate"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

if (result.status === 0) process.exit(0);

const after = read(clientSchema);
if (!clientStale && after.includes("authorPhone")) {
  process.exit(0);
}

if (fs.existsSync(clientSchema) && after.includes("authorPhone")) {
  console.warn(
    "[prisma-predev] prisma generate failed (engine may be locked). Stop other Node/dev servers, then: npx prisma generate",
  );
  process.exit(0);
}

console.error(
  "[prisma-predev] Prisma client is out of date. Stop npm run dev everywhere, then run: npx prisma generate",
);
process.exit(1);
