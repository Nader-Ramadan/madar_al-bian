import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  /** Last datasource URL used to build `prisma` (dev-only invalidation). */
  prismaResolvedUrl?: string;
  /** Fingerprint of generated client — invalidate after `prisma generate`. */
  prismaClientGenId?: string;
};

function prismaClientGenerationId(): string {
  const clientIndex = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
  try {
    const stat = fs.statSync(clientIndex);
    return `${stat.mtimeMs}-${stat.size}`;
  } catch {
    return "missing";
  }
}

function createPrismaClient(url: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  const url = resolveDatabaseUrl();
  const genId = prismaClientGenerationId();
  const staleUrl =
    process.env.NODE_ENV === "development" &&
    globalForPrisma.prisma != null &&
    globalForPrisma.prismaResolvedUrl !== url;
  const staleClient =
    globalForPrisma.prisma != null && globalForPrisma.prismaClientGenId !== genId;
  if (staleUrl || staleClient) {
    void globalForPrisma.prisma?.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(url);
    globalForPrisma.prismaResolvedUrl = url;
    globalForPrisma.prismaClientGenId = genId;
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy proxy so importing this module during `next build` does not call
 * `resolveDatabaseUrl()` (Hostinger build often has no DB env yet).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
