import { safeQuery, resolveUserId } from "@/lib/db";
import { startOfWeek } from "@/lib/utils";
import { generatePlan } from "@/lib/nutrition/generator";
import type { GeneratedMealPlan, MealType } from "@/lib/nutrition/types";

export interface WeeklyPlanResult {
  plan: GeneratedMealPlan;
  sample: boolean;
}

/** Load the current week's meal plan, or a sample plan in demo mode. */
export async function getCurrentWeekPlan(): Promise<WeeklyPlanResult> {
  const userId = await resolveUserId();
  const weekStart = startOfWeek();

  const record = await safeQuery(
    (db) =>
      db.mealPlan.findFirst({
        where: { userId, weekStart },
        orderBy: { createdAt: "desc" },
        include: { meals: { orderBy: [{ dayIndex: "asc" }, { type: "asc" }] } },
      }),
    null,
  );

  if (!record) {
    return {
      plan: generatePlan({ kcalTarget: 1900, lowPurine: true, lowSodium: true, lowCarb: true }),
      sample: true,
    };
  }

  return {
    plan: {
      title: record.title ?? "Weekly Meal Plan",
      kcalTarget: record.kcalTarget ?? 0,
      generatedByAi: record.generatedByAi,
      constraints: [],
      meals: record.meals.map((m) => ({
        dayIndex: m.dayIndex,
        type: m.type as MealType,
        name: m.name,
        recipe: m.recipe ?? undefined,
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
    sample: false,
  };
}
