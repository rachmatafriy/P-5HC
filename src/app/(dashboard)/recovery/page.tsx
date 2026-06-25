import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Health Recovery"
      description="Turn your MCU findings into an actionable recovery plan with measurable goals and a forecasted ETA."
      capabilities={[
              "Goal setting per biomarker (weight, LDL, HbA1c, uric acid)",
              "Baseline → current → target tracking",
              "Recovery % and ETA forecast",
              "AI-generated recovery roadmap",
              "Plan status lifecycle (active/paused/completed)",
              "Milestone celebrations"
      ]}
    />
  );
}
