import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Health Index"
      description="A single 0–100 score that summarises your overall health, with trend, forecast and recovery percentage."
      capabilities={[
              "Composite score from 5 weighted components",
              "Historical trend visualisation",
              "Forecast to target with ETA",
              "Component breakdown (cardio, metabolic, liver…)",
              "Biological age & life-expectancy estimate",
              "Shareable progress card"
      ]}
    />
  );
}
