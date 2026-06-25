import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="MCU Management"
      description="Record and track Medical Check Up results over time. Each MCU automatically generates a deterministic risk assessment."
      capabilities={[
              "Capture anthropometry, vitals & full lab panel",
              "Auto-compute BMI, CV, metabolic, diabetes, liver risk",
              "Verdict tracking (Fit / Fit with restriction / Unfit)",
              "Trend comparison across exams",
              "Attach source documents from Storage",
              "Export MCU summary to PDF"
      ]}
    />
  );
}
