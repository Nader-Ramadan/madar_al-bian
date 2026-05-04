/**
 * Load env files for CLI scripts and SSH on Hostinger (hPanel vars are often not in the shell).
 * Order: .env → .env.production (override) → .env.local (override), same idea as Next.js.
 */
import path from "node:path";

/**
 * @param {string} root - project root (directory containing package.json)
 */
export async function loadProjectEnv(root) {
  try {
    const { config } = await import("dotenv");
    config({ path: path.join(root, ".env") });
    config({ path: path.join(root, ".env.production"), override: true });
    config({ path: path.join(root, ".env.local"), override: true });
  } catch {
    /* optional */
  }
}
