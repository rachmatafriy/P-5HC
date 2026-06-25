import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Reporting"
      description="Generate management, medical, ISO 45001 and health-surveillance reports in PDF, Excel and PowerPoint."
      capabilities={[
              "Management report",
              "Medical progress report",
              "ISO 45001 report",
              "Health surveillance report",
              "PDF / Excel / PowerPoint output",
              "Scheduled report delivery"
      ]}
    />
  );
}
