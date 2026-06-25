import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Demo mode: allow the client to construct without a DATABASE_URL so the app
// boots with zero backend setup. Queries still fail and are caught by
// `safeQuery` (reads) / surfaced by actions (writes).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://demo:demo@127.0.0.1:5432/demo?schema=public";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
