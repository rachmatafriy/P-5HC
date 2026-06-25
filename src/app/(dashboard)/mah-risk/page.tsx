import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="MAH Risk"
      description="Major Accident Hazard medical risk register linking health status to safety-critical roles."
      capabilities={[
              "Safety-critical role mapping",
              "Medical risk register",
              "Emergency medical readiness",
              "Restriction impact on MAH roles",
              "Escalation workflow",
              "Audit-ready exports"
      ]}
    />
  );
}
