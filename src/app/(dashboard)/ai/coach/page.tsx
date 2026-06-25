import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="AI Health Coach"
      description="Your daily coach: morning plans, evening reviews, weekly recovery reports and monthly medical progress reports."
      capabilities={[
              "Personalised morning plan",
              "Evening progress evaluation",
              "Sunday weekly report",
              "Monthly medical progress report",
              "Grounded in your real logs & MCU",
              "Function-calls the deterministic risk engine"
      ]}
    />
  );
}
