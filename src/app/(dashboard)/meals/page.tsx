import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Meal Planning"
      description="Generate daily and weekly meal plans tuned to your risks (low purine, low sodium, controlled carbohydrate)."
      capabilities={[
              "AI Nutritionist-generated weekly plans",
              "Per-meal macro & micro breakdown",
              "Calories, protein, carb, fat, fiber, sugar",
              "Purine, sodium & potassium tracking",
              "Indonesian-food aware suggestions",
              "Swap & regenerate individual meals"
      ]}
    />
  );
}
