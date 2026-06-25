"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/db";
import { startOfWeek } from "@/lib/utils";
import { generateMealPlanAI } from "@/lib/ai/nutritionist";
import type { DietContext } from "@/lib/nutrition/generator";

function mifflinTdee(
  gender: string,
  weightKg: number,
  heightCm: number,
  age: number,
  activity: string | null,
): number {
  const bmr =
    gender === "FEMALE"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const factor =
    { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 }[
      activity ?? "light"
    ] ?? 1.375;
  return Math.round((bmr * factor) / 50) * 50;
}

export interface GenerateResult {
  ok: boolean;
  error?: string;
  generatedByAi?: boolean;
}

/** Generate (and persist) a risk-aware weekly meal plan for the current week. */
export async function generateWeeklyMealPlan(): Promise<GenerateResult> {
  try {
    const userId = await resolveUserId();

    const [profile, latestMcu] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.mcuRecord.findFirst({
        where: { userId },
        orderBy: { examDate: "desc" },
        include: { riskAssessment: true },
      }),
    ]);

    const ra = latestMcu?.riskAssessment;
    const weightKg = latestMcu?.weightKg ?? profile?.baselineWeight ?? 75;
    const heightCm = latestMcu?.heightCm ?? profile?.heightCm ?? 170;
    const age = profile?.dateOfBirth
      ? new Date().getFullYear() - profile.dateOfBirth.getFullYear()
      : 35;

    let kcalTarget = mifflinTdee(profile?.gender ?? "MALE", weightKg, heightCm, age, profile?.activityLevel ?? null);
    // Modest recovery deficit when overweight.
    if ((ra?.bmi ?? 0) >= 25) kcalTarget = Math.max(1500, kcalTarget - 400);

    const highish = (l?: string | null) => l === "high" || l === "very-high";
    const ctx: DietContext = {
      kcalTarget,
      lowPurine: highish(ra?.hyperuricemiaRisk),
      lowSodium: highish(ra?.metabolicRisk) || (latestMcu?.systolicBp ?? 0) >= 130,
      lowCarb: (ra?.diabetesRisk ?? 0) >= 17 || (latestMcu?.fastingGlucose ?? 0) >= 100,
    };

    const riskSummary = ra
      ? `Health index ${ra.healthIndex}; CV ${ra.cardiovascularRisk}%; diabetes ${ra.diabetesRisk}%; metabolic ${ra.metabolicRisk}; uric acid risk ${ra.hyperuricemiaRisk}; BMI ${ra.bmi} (${ra.bmiCategory}).`
      : "No recent MCU; assume general healthy targets.";

    const plan = await generateMealPlanAI(ctx, riskSummary);
    const weekStart = startOfWeek();

    await prisma.$transaction(async (tx) => {
      // Replace any existing plan for this week.
      const existing = await tx.mealPlan.findMany({
        where: { userId, weekStart },
        select: { id: true },
      });
      if (existing.length) {
        await tx.mealPlan.deleteMany({ where: { id: { in: existing.map((e) => e.id) } } });
      }

      await tx.mealPlan.create({
        data: {
          userId,
          weekStart,
          title: plan.title,
          kcalTarget: plan.kcalTarget,
          generatedByAi: plan.generatedByAi,
          meals: {
            create: plan.meals.map((m) => ({
              dayIndex: m.dayIndex,
              type: m.type,
              name: m.name,
              recipe: m.recipe ?? null,
              kcal: m.kcal,
              proteinG: m.proteinG,
              carbG: m.carbG,
              fatG: m.fatG,
              fiberG: m.fiberG,
              sugarG: m.sugarG,
              purineMg: m.purineMg,
              sodiumMg: m.sodiumMg,
              potassiumMg: m.potassiumMg,
            })),
          },
        },
      });
    });

    revalidatePath("/meals");
    return { ok: true, generatedByAi: plan.generatedByAi };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
