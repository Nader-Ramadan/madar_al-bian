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
  const alreadyGenerated = existsSync(generatedClient);
  // #region agent log
  fetch("http://127.0.0.1:7871/ingest/fe4f3de0-a016-4b14-85da-27f37bdc9363", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "97c3e9" },
    body: JSON.stringify({
      sessionId: "97c3e9",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "next.config.ts:ensurePrismaClientGenerated",
      message: "next.config production load",
      data: {
        nodeEnv: process.env.NODE_ENV ?? null,
        alreadyGenerated,
        babelCompiler: existsSync(
          path.join(process.cwd(), "node_modules", "babel-plugin-react-compiler"),
        ),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (alreadyGenerated) return;
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
