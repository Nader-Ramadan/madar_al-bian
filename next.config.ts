import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

function imageRemotePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  return [
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    /* Legacy rows may still point at S3 or other CDNs until re-uploaded */
    { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
    { protocol: "https", hostname: "*.s3.*.amazonaws.com", pathname: "/**" },
  ];
}

function ensurePrismaClientGenerated() {
  const generatedClient = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.d.ts");
  if (existsSync(generatedClient)) return;
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[next.config] prisma generate failed (run "npx prisma generate" before start): ${message}`,
    );
  }
}

if (process.env.NODE_ENV === "production") {
  ensurePrismaClientGenerated();
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
