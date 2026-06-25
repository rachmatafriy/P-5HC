import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Grocery Planner"
      description="Auto-build a categorised shopping list from your weekly meal plan."
      capabilities={[
              "Generated from the active meal plan",
              "Categorised by aisle (produce, protein, pantry)",
              "Quantity aggregation across meals",
              "Check-off while shopping",
              "Budget estimate",
              "Export / share list"
      ]}
    />
  );
}
