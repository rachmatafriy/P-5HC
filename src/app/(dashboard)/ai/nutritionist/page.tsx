import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="AI Nutritionist"
      description="Designs meal plans and grocery lists tuned to your clinical risks and Indonesian food culture."
      capabilities={[
              "Risk-aware meal planning",
              "Macro & micronutrient targeting",
              "Low-purine / low-sodium modes",
              "Grocery & meal-prep generation",
              "Budget-aware suggestions",
              "Recipe-level guidance"
      ]}
    />
  );
}
