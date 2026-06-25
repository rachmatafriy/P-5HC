import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCoachArtifact } from "@/lib/ai/coach";

const Schema = z.object({
  userId: z.string().uuid(),
  cadence: z.enum(["MORNING_PLAN", "EVENING_REVIEW", "WEEKLY_REPORT", "MONTHLY_REPORT"]),
});

/**
 * POST /api/ai/coach
 * Generates an AI coach artifact. Protected by a shared CRON_SECRET so it can be
 * driven by a scheduler (Vercel Cron / Supabase pg_cron / GitHub Actions).
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  try {
    const text = await generateCoachArtifact(parsed.data.userId, parsed.data.cadence);
    return NextResponse.json({ ok: true, text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
