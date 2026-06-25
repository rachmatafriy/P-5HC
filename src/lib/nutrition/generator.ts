import { MEAL_TYPES, type GeneratedMeal, type GeneratedMealPlan, type MealType } from "./types";

export interface DietContext {
  kcalTarget: number;
  lowPurine: boolean; // hyperuricemia / gout
  lowSodium: boolean; // hypertension
  lowCarb: boolean; // diabetes / metabolic
}

interface FoodItem {
  name: string;
  recipe: string;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  purineMg: number;
  sodiumMg: number;
  potassiumMg: number;
  highPurine?: boolean;
  highSodium?: boolean;
  highCarb?: boolean;
}

/** Indonesian-friendly catalog with screening-grade nutrition per serving. */
const CATALOG: Record<MealType, FoodItem[]> = {
  BREAKFAST: [
    { name: "Oatmeal with banana & chia", recipe: "Rolled oats, banana, chia seeds, low-fat milk.", kcal: 350, proteinG: 12, carbG: 55, fatG: 8, fiberG: 8, sugarG: 14, purineMg: 25, sodiumMg: 80, potassiumMg: 520 },
    { name: "Telur dadar sayur & nasi merah", recipe: "Vegetable omelette with brown rice.", kcal: 420, proteinG: 18, carbG: 48, fatG: 16, fiberG: 6, sugarG: 4, purineMg: 60, sodiumMg: 320, potassiumMg: 410, highCarb: true },
    { name: "Greek yogurt bowl", recipe: "Greek yogurt, berries, walnuts.", kcal: 300, proteinG: 20, carbG: 28, fatG: 12, fiberG: 5, sugarG: 18, purineMg: 20, sodiumMg: 70, potassiumMg: 380 },
    { name: "Bubur kacang hijau", recipe: "Mung bean porridge, light coconut milk.", kcal: 330, proteinG: 12, carbG: 58, fatG: 6, fiberG: 9, sugarG: 16, purineMg: 80, sodiumMg: 40, potassiumMg: 470, highCarb: true },
    { name: "Avocado egg toast", recipe: "Wholegrain toast, avocado, poached egg.", kcal: 360, proteinG: 15, carbG: 34, fatG: 18, fiberG: 9, sugarG: 3, purineMg: 55, sodiumMg: 300, potassiumMg: 560 },
  ],
  LUNCH: [
    { name: "Ayam bakar, nasi merah, lalapan", recipe: "Grilled chicken breast, brown rice, raw veg, sambal.", kcal: 550, proteinG: 40, carbG: 50, fatG: 16, fiberG: 7, sugarG: 5, purineMg: 150, sodiumMg: 420, potassiumMg: 680, highCarb: true },
    { name: "Pepes ikan & sayur tumis", recipe: "Steamed spiced fish, stir-fried greens.", kcal: 480, proteinG: 38, carbG: 30, fatG: 18, fiberG: 8, sugarG: 4, purineMg: 180, sodiumMg: 360, potassiumMg: 720, highPurine: true },
    { name: "Gado-gado (light dressing)", recipe: "Mixed veg, tofu, egg, light peanut sauce.", kcal: 500, proteinG: 22, carbG: 42, fatG: 24, fiberG: 11, sugarG: 9, purineMg: 90, sodiumMg: 480, potassiumMg: 760, highSodium: true },
    { name: "Tofu & tempe rice bowl", recipe: "Brown rice, grilled tofu/tempe, vegetables.", kcal: 520, proteinG: 28, carbG: 56, fatG: 16, fiberG: 10, sugarG: 6, purineMg: 110, sodiumMg: 300, potassiumMg: 640, highCarb: true },
    { name: "Grilled chicken salad", recipe: "Greens, chicken breast, olive oil, lemon.", kcal: 430, proteinG: 38, carbG: 18, fatG: 22, fiberG: 7, sugarG: 6, purineMg: 130, sodiumMg: 260, potassiumMg: 700 },
  ],
  DINNER: [
    { name: "Sup ayam sayuran", recipe: "Clear chicken & vegetable soup, small rice.", kcal: 420, proteinG: 32, carbG: 38, fatG: 12, fiberG: 6, sugarG: 5, purineMg: 120, sodiumMg: 420, potassiumMg: 620 },
    { name: "Salmon panggang & brokoli", recipe: "Baked salmon, steamed broccoli, sweet potato.", kcal: 520, proteinG: 36, carbG: 34, fatG: 24, fiberG: 8, sugarG: 7, purineMg: 170, sodiumMg: 220, potassiumMg: 880, highPurine: true },
    { name: "Capcay & tahu", recipe: "Mixed vegetable stir-fry with tofu.", kcal: 360, proteinG: 18, carbG: 30, fatG: 16, fiberG: 9, sugarG: 7, purineMg: 70, sodiumMg: 380, potassiumMg: 690 },
    { name: "Tumis buncis & telur", recipe: "Green bean stir-fry, boiled egg, small rice.", kcal: 400, proteinG: 20, carbG: 40, fatG: 14, fiberG: 8, sugarG: 5, purineMg: 80, sodiumMg: 300, potassiumMg: 540, highCarb: true },
    { name: "Beef & veggie skewers", recipe: "Lean beef skewers, grilled vegetables.", kcal: 460, proteinG: 34, carbG: 20, fatG: 22, fiberG: 6, sugarG: 6, purineMg: 160, sodiumMg: 340, potassiumMg: 650, highPurine: true },
  ],
  SNACK: [
    { name: "Apple & almonds", recipe: "One apple, a small handful of almonds.", kcal: 200, proteinG: 5, carbG: 24, fatG: 11, fiberG: 5, sugarG: 16, purineMg: 10, sodiumMg: 5, potassiumMg: 280 },
    { name: "Edamame", recipe: "Steamed edamame, light salt.", kcal: 180, proteinG: 16, carbG: 14, fatG: 7, fiberG: 8, sugarG: 3, purineMg: 120, sodiumMg: 120, potassiumMg: 440, highPurine: true },
    { name: "Carrot sticks & hummus", recipe: "Carrot sticks with hummus.", kcal: 170, proteinG: 6, carbG: 20, fatG: 8, fiberG: 6, sugarG: 6, purineMg: 20, sodiumMg: 180, potassiumMg: 360 },
    { name: "Pepaya bowl", recipe: "Fresh papaya cubes.", kcal: 120, proteinG: 2, carbG: 30, fatG: 0, fiberG: 5, sugarG: 18, purineMg: 5, sodiumMg: 10, potassiumMg: 360 },
    { name: "Boiled egg & cucumber", recipe: "Two boiled eggs, cucumber slices.", kcal: 180, proteinG: 13, carbG: 4, fatG: 12, fiberG: 1, sugarG: 2, purineMg: 5, sodiumMg: 140, potassiumMg: 200 },
  ],
};

function pickFor(type: MealType, ctx: DietContext, day: number): FoodItem {
  let pool = CATALOG[type];
  if (ctx.lowPurine) pool = pool.filter((f) => !f.highPurine);
  if (ctx.lowSodium) pool = pool.filter((f) => !f.highSodium);
  if (ctx.lowCarb) pool = pool.filter((f) => !f.highCarb);
  if (pool.length === 0) pool = CATALOG[type]; // never leave a meal empty
  // Deterministic rotation for week-long variety.
  return pool[(day + MEAL_TYPES.indexOf(type)) % pool.length];
}

/** Build a 7-day, risk-aware meal plan without any external service. */
export function generatePlan(ctx: DietContext): GeneratedMealPlan {
  const meals: GeneratedMeal[] = [];
  for (let day = 0; day < 7; day++) {
    for (const type of MEAL_TYPES) {
      const f = pickFor(type, ctx, day);
      meals.push({
        dayIndex: day,
        type,
        name: f.name,
        recipe: f.recipe,
        kcal: f.kcal,
        proteinG: f.proteinG,
        carbG: f.carbG,
        fatG: f.fatG,
        fiberG: f.fiberG,
        sugarG: f.sugarG,
        purineMg: f.purineMg,
        sodiumMg: f.sodiumMg,
        potassiumMg: f.potassiumMg,
      });
    }
  }

  const constraints: string[] = [];
  if (ctx.lowPurine) constraints.push("Low purine (hyperuricemia)");
  if (ctx.lowSodium) constraints.push("Low sodium (hypertension)");
  if (ctx.lowCarb) constraints.push("Controlled carbohydrate (diabetes risk)");
  if (constraints.length === 0) constraints.push("Balanced");

  return {
    title: `Weekly Meal Plan (${ctx.kcalTarget} kcal/day)`,
    kcalTarget: ctx.kcalTarget,
    generatedByAi: false,
    meals,
    constraints,
  };
}
