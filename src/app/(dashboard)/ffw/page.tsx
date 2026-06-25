import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Fitness for Work"
      description="Occupational fitness assessment with P1–P5 classification, restrictions and return-to-work tracking."
      capabilities={[
              "P1–P5 classification",
              "Medical restriction documentation",
              "Validity period & re-assessment scheduling",
              "Return-to-work workflow",
              "Assessor sign-off",
              "ISO 45001-aligned records"
      ]}
    />
  );
}
