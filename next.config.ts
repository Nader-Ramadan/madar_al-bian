import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

function ensurePrismaClientGenerated() {
  const generatedClient = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.d.ts");
  if (existsSync(generatedClient)) return;
  execSync("npx prisma generate", { stdio: "inherit" });
}

if (process.env.NODE_ENV === "production") {
  ensurePrismaClientGenerated();
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
