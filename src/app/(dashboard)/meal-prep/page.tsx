import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Meal Prep Generator"
      description="Convert your weekly plan into a batch-cooking prep schedule that saves time."
      capabilities={[
              "Batch-cooking session planning",
              "Prep-ahead vs cook-fresh split",
              "Storage & reheating guidance",
              "Portioning by macro targets",
              "Time-boxed prep steps",
              "Leftover utilisation"
      ]}
    />
  );
}
