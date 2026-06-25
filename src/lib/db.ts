import { prisma } from "./prisma";
import { getCurrentUser } from "./supabase/server";
import { DEMO_USER_ID } from "./constants";

/**
 * Resolve the active user id: the authenticated Supabase user when available,
 * otherwise the demo user (demo mode). Keeps every module usable out-of-the-box.
 */
export async function resolveUserId(): Promise<string> {
  try {
    const user = await getCurrentUser();
    if (user?.id) return user.id;
  } catch {
    // Supabase not configured — fall through to demo mode.
  }
  return DEMO_USER_ID;
}

/**
 * Run a Prisma read and gracefully degrade to a fallback value if the database
 * is unreachable (e.g. demo mode with no DB). Writes should NOT use this — they
 * must surface errors to the caller.
 */
export async function safeQuery<T>(fn: (db: typeof prisma) => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn(prisma);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[safeQuery] database unavailable, using fallback:", (err as Error).message);
    }
    return fallback;
  }
}
