export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface GeneratedMeal {
  dayIndex: number; // 0..6 (Mon..Sun)
  type: MealType;
  name: string;
  recipe?: string;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  purineMg: number;
  sodiumMg: number;
  potassiumMg: number;
}

export interface GeneratedMealPlan {
  title: string;
  kcalTarget: number;
  generatedByAi: boolean;
  meals: GeneratedMeal[];
  /** Risk-driven dietary constraints applied to this plan. */
  constraints: string[];
}

export interface NutritionTotals {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  purineMg: number;
  sodiumMg: number;
  potassiumMg: number;
}

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export function sumNutrition(meals: GeneratedMeal[]): NutritionTotals {
  return meals.reduce<NutritionTotals>(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      proteinG: acc.proteinG + m.proteinG,
      carbG: acc.carbG + m.carbG,
      fatG: acc.fatG + m.fatG,
      fiberG: acc.fiberG + m.fiberG,
      sugarG: acc.sugarG + m.sugarG,
      purineMg: acc.purineMg + m.purineMg,
      sodiumMg: acc.sodiumMg + m.sodiumMg,
      potassiumMg: acc.potassiumMg + m.potassiumMg,
    }),
    {
      kcal: 0,
      proteinG: 0,
      carbG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      purineMg: 0,
      sodiumMg: 0,
      potassiumMg: 0,
    },
  );
}

export function dailyTotals(meals: GeneratedMeal[]): NutritionTotals[] {
  return Array.from({ length: 7 }, (_, day) =>
    sumNutrition(meals.filter((m) => m.dayIndex === day)),
  );
}
