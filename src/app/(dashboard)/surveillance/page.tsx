import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Health Surveillance"
      description="Manage statutory health surveillance: audiometry, spirometry, vision, biological monitoring, vaccination and fatigue."
      capabilities={[
              "Audiometry & spirometry results",
              "Biological monitoring",
              "Vaccination registry",
              "Fatigue management",
              "Next-due scheduling",
              "Abnormal-result flagging"
      ]}
    />
  );
}
