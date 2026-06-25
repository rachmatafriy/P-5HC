import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="AI Risk Assessor"
      description="Explains your computed clinical risks in plain language and prioritises the highest-leverage interventions."
      capabilities={[
              "Plain-language risk explanation",
              "Risk prioritisation",
              "Highest-leverage interventions",
              "References exact computed numbers",
              "What-if scenario projection",
              "Recovery trajectory insight"
      ]}
    />
  );
}
