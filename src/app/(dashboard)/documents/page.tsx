import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Medical Documents"
      description="Securely store and organise medical documents in Supabase Storage with category tagging."
      capabilities={[
              "Upload MCU, lab, prescription & imaging files",
              "Category tagging & search",
              "Signed-URL secure access",
              "Document date tracking",
              "Version history",
              "Encryption at rest"
      ]}
    />
  );
}
