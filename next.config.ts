import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

/** Allow next/image for S3 and common S3-compatible hosts + optional CDN from S3_PUBLIC_BASE_URL */
function imageRemotePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
    { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
    { protocol: "https", hostname: "*.s3.*.amazonaws.com", pathname: "/**" },
    { protocol: "https", hostname: "*.r2.cloudflarestorage.com", pathname: "/**" },
    { protocol: "https", hostname: "*.digitaloceanspaces.com", pathname: "/**" },
  ];
  const base = process.env.S3_PUBLIC_BASE_URL?.trim();
  if (base) {
    try {
      const u = new URL(base);
      if (u.hostname) {
        patterns.push({
          protocol: u.protocol === "http:" ? "http" : "https",
          hostname: u.hostname,
          pathname: "/**",
        });
      }
    } catch {
      /* ignore invalid URL */
    }
  }
  return patterns;
}

function ensurePrismaClientGenerated() {
  const generatedClient = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.d.ts");
  if (existsSync(generatedClient)) return;
  execSync("npx prisma generate", { stdio: "inherit" });
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
