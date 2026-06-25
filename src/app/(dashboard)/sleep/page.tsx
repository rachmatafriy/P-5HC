import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Sleep Tracker"
      description="Log sleep duration and quality to keep fatigue and recovery in check."
      capabilities={[
              "Duration & quality scoring",
              "Bedtime / wake-time capture",
              "7-day rolling average",
              "Fatigue risk signal",
              "Bedtime reminders",
              "Correlation with energy & mood"
      ]}
    />
  );
}
