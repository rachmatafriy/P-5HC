import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Management Review"
      description="ISO 45001 management review pack: inputs, findings, actions and continual improvement."
      capabilities={[
              "Review input aggregation",
              "Findings & nonconformities",
              "Action item tracking",
              "Trend & objective review",
              "Meeting minutes export",
              "Continual-improvement log"
      ]}
    />
  );
}
