import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Water Tracker"
      description="Track daily hydration against a personalised goal."
      capabilities={[
              "Daily intake logging",
              "Personalised goal (default 2.5L)",
              "Streaks & weekly average",
              "Smart reminders",
              "Integration with health index lifestyle score",
              "Quick-add presets"
      ]}
    />
  );
}
