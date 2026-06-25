import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="KPI Dashboard"
      description="Occupational health KPIs for management: fitness distribution, surveillance compliance and recovery outcomes."
      capabilities={[
              "Fitness-for-work distribution",
              "Surveillance compliance rate",
              "MCU completion rate",
              "Average health-index trend",
              "Restriction prevalence",
              "Drill-down by site / department"
      ]}
    />
  );
}
