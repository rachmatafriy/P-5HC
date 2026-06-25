import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Exercise Planner"
      description="Generate a weekly workout program across gym, walking, cardio, mobility, stretching and recovery."
      capabilities={[
              "AI-generated weekly split",
              "Gym, cardio, walking, mobility & recovery",
              "Intensity & duration per session",
              "Estimated calories burned",
              "Completion tracking",
              "Auto-deload on poor recovery signals"
      ]}
    />
  );
}
