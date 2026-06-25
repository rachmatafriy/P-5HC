import { prisma } from "@/lib/prisma";
import { runAgent } from "./agent";
import { HEALTH_COACH_PROMPT } from "./prompts";
import { AI_MODEL } from "./openai";

type Cadence = "MORNING_PLAN" | "EVENING_REVIEW" | "WEEKLY_REPORT" | "MONTHLY_REPORT";

const INSTRUCTIONS: Record<Cadence, string> = {
  MORNING_PLAN:
    "Generate today's personalized morning plan: priorities for nutrition, movement, hydration, and one mindset cue. Keep it under 200 words.",
  EVENING_REVIEW:
    "Evaluate today's progress from the provided logs. Note what went well, one gap, and a gentle adjustment for tomorrow.",
  WEEKLY_REPORT:
    "Produce a weekly recovery report: trend of the health index, adherence, wins, risks, and the focus for next week.",
  MONTHLY_REPORT:
    "Produce a monthly medical progress report suitable for review with a clinician: biomarker movement, risk changes, and recommendations.",
};

/**
 * Build a compact context string from the user's recent data. In production this
 * is assembled from MCU, checkins, logs; here it gracefully handles sparse data.
 */
async function buildContext(userId: string): Promise<string> {
  const [profile, latestMcu, latestIndex, recentWater, recentSleep] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.mcuRecord.findFirst({
      where: { userId },
      orderBy: { examDate: "desc" },
      include: { riskAssessment: true },
    }),
    prisma.healthIndexSnapshot.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.waterLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 7 }),
    prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 7 }),
  ]);

  return JSON.stringify(
    {
      profile,
      latestMcu,
      latestHealthIndex: latestIndex?.score,
      recoveryPct: latestIndex?.recoveryPct,
      recentWater,
      recentSleep,
    },
    null,
    2,
  );
}

/** Generate (and persist) an AI coach artifact for the given cadence. */
export async function generateCoachArtifact(userId: string, cadence: Cadence): Promise<string> {
  const context = await buildContext(userId);
  const prompt = `${INSTRUCTIONS[cadence]}\n\nUser context (JSON):\n${context}`;

  const result = await runAgent(HEALTH_COACH_PROMPT, prompt);

  await prisma.aiInteraction.create({
    data: {
      userId,
      agent: "HEALTH_COACH",
      kind: cadence,
      prompt: INSTRUCTIONS[cadence],
      response: result.text,
      model: AI_MODEL,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      metadata: { toolCalls: result.toolCalls },
    },
  });

  return result.text;
}
