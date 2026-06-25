import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="AI Occupational Physician"
      description="Reasons about fitness for work, restrictions, surveillance and return-to-work per WHO/ILO/ISO 45001."
      capabilities={[
              "Fitness-for-work reasoning (P1–P5)",
              "Restriction recommendations",
              "Surveillance interpretation",
              "Return-to-work guidance",
              "Regulation-aligned framing",
              "HSE/clinician-oriented output"
      ]}
    />
  );
}
