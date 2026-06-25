import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateMealPlanButton } from "@/components/meals/generate-button";
import { getCurrentWeekPlan } from "@/lib/meals/data";
import { DAYS } from "@/lib/constants";
import { MEAL_TYPES, dailyTotals, sumNutrition } from "@/lib/nutrition/types";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

export default async function MealsPage() {
  const { plan, sample } = await getCurrentWeekPlan();
  const perDay = dailyTotals(plan.meals);
  const weekTotal = sumNutrition(plan.meals);
  const avgKcal = Math.round(weekTotal.kcal / 7);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meal Planning</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A weekly plan tuned to your clinical risks. The AI Nutritionist generates it; a
            deterministic engine guarantees a plan even without an API key.
          </p>
        </div>
        <GenerateMealPlanButton />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={plan.generatedByAi ? "default" : "secondary"}>
          {plan.generatedByAi ? "AI-generated" : "Rule-based"}
        </Badge>
        {(plan.constraints.length ? plan.constraints : ["Balanced"]).map((c) => (
          <Badge key={c} variant="outline">
            {c}
          </Badge>
        ))}
        {sample && (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Showing a sample plan — click generate to create your own.
          </span>
        )}
      </div>

      {/* Weekly nutrition summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Avg calories / day" value={`${avgKcal}`} unit="kcal" />
        <Summary label="Avg protein / day" value={`${Math.round(weekTotal.proteinG / 7)}`} unit="g" />
        <Summary label="Avg sodium / day" value={`${Math.round(weekTotal.sodiumMg / 7)}`} unit="mg" />
        <Summary label="Avg purine / day" value={`${Math.round(weekTotal.purineMg / 7)}`} unit="mg" />
      </div>

      {/* Weekly grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day, dayIndex) => {
          const dayMeals = plan.meals.filter((m) => m.dayIndex === dayIndex);
          const t = perDay[dayIndex];
          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  {day}
                  <span className="text-sm font-normal text-muted-foreground">
                    {Math.round(t.kcal)} kcal
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MEAL_TYPES.map((type) => {
                  const meal = dayMeals.find((m) => m.type === type);
                  if (!meal) return null;
                  return (
                    <div key={type} className="rounded-lg border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {TYPE_LABEL[type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(meal.kcal)} kcal
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium">{meal.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                        <span>P {Math.round(meal.proteinG)}g</span>
                        <span>· C {Math.round(meal.carbG)}g</span>
                        <span>· F {Math.round(meal.fatG)}g</span>
                        <span>· Fib {Math.round(meal.fiberG)}g</span>
                        <span>· Na {Math.round(meal.sodiumMg)}mg</span>
                        <span>· Purine {Math.round(meal.purineMg)}mg</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Summary({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">
          {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
      </CardContent>
    </Card>
  );
}
