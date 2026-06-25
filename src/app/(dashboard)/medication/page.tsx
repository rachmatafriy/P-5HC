import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Medication Reminder"
      description="Manage medications and never miss a dose with scheduled reminders."
      capabilities={[
              "Medication list with dosage & frequency",
              "Multiple daily reminder times",
              "Adherence logging",
              "Start / end date management",
              "Refill alerts",
              "Clinician-shareable list"
      ]}
    />
  );
}
