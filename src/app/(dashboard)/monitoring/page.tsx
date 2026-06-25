import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Weekly Monitoring"
      description="Log a weekly check-in to keep your trend and forecast accurate between formal MCUs."
      capabilities={[
              "Weight, waist & blood pressure capture",
              "Energy, mood & adherence scoring",
              "Automatic health-index recalculation",
              "Week-over-week deltas",
              "Adherence streaks",
              "Reminders for missed check-ins"
      ]}
    />
  );
}
