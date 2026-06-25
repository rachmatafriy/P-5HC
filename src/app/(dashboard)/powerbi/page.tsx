import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Power BI Export"
      description="Expose curated datasets for Power BI dashboards via a secure API/dataset endpoint."
      capabilities={[
              "Curated star-schema datasets",
              "Secure dataset API endpoint",
              "Incremental refresh support",
              "Row-level security by org/site",
              "Scheduled extract to storage",
              "Sample .pbix template"
      ]}
    />
  );
}
