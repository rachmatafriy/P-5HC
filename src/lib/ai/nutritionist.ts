import { z } from "zod";
import { getOpenAI, AI_MODEL } from "./openai";
import { NUTRITIONIST_PROMPT } from "./prompts";
import { generatePlan, type DietContext } from "@/lib/nutrition/generator";
import { MEAL_TYPES, type GeneratedMealPlan } from "@/lib/nutrition/types";

const MealSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  name: z.string(),
  recipe: z.string().optional(),
  kcal: z.number(),
  proteinG: z.number(),
  carbG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
  sugarG: z.number(),
  purineMg: z.number(),
  sodiumMg: z.number(),
  potassiumMg: z.number(),
});

const PlanSchema = z.object({ meals: z.array(MealSchema).min(1) });

/**
 * Generate a weekly meal plan with the AI Nutritionist. Falls back to the
 * deterministic generator when OpenAI is not configured or returns bad output,
 * so the feature always works (demo mode included).
 */
export async function generateMealPlanAI(
  ctx: DietContext,
  riskSummary: string,
): Promise<GeneratedMealPlan> {
  const fallback = generatePlan(ctx);

  if (!process.env.OPENAI_API_KEY) return fallback;

  const constraints = fallback.constraints.join(", ");
  const userPrompt = `Create a 7-day meal plan (days 0=Mon..6=Sun), with all four meals per day
(${MEAL_TYPES.join(", ")}). Daily calorie target ~${ctx.kcalTarget} kcal.
Dietary constraints: ${constraints}.
User risk summary: ${riskSummary}

Respond with STRICT JSON only, shape:
{"meals":[{"dayIndex":0,"type":"BREAKFAST","name":"...","recipe":"...","kcal":0,"proteinG":0,"carbG":0,"fatG":0,"fiberG":0,"sugarG":0,"purineMg":0,"sodiumMg":0,"potassiumMg":0}]}
Prefer Indonesian-friendly, budget-conscious meals. All nutrition values are per serving.`;

  try {
    const res = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: NUTRITIONIST_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = res.choices[0]?.message?.content;
    if (!content) return fallback;

    const parsed = PlanSchema.safeParse(JSON.parse(content));
    if (!parsed.success || parsed.data.meals.length < 7) return fallback;

    return {
      title: `AI Weekly Meal Plan (${ctx.kcalTarget} kcal/day)`,
      kcalTarget: ctx.kcalTarget,
      generatedByAi: true,
      meals: parsed.data.meals,
      constraints: fallback.constraints,
    };
  } catch {
    return fallback;
  }
}
