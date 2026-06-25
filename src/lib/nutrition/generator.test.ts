import { describe, it, expect } from "vitest";
import { generatePlan } from "./generator";
import { dailyTotals } from "./types";

describe("meal plan generator", () => {
  it("produces 7 days x 4 meals", () => {
    const plan = generatePlan({ kcalTarget: 1900, lowPurine: false, lowSodium: false, lowCarb: false });
    expect(plan.meals).toHaveLength(28);
    const days = new Set(plan.meals.map((m) => m.dayIndex));
    expect(days.size).toBe(7);
  });

  it("respects low-purine constraint where possible", () => {
    const plan = generatePlan({ kcalTarget: 1800, lowPurine: true, lowSodium: false, lowCarb: false });
    // Low-purine plan should have a lower weekly purine load than an unconstrained one.
    const constrained = plan.meals.reduce((s, m) => s + m.purineMg, 0);
    const unconstrained = generatePlan({
      kcalTarget: 1800,
      lowPurine: false,
      lowSodium: false,
      lowCarb: false,
    }).meals.reduce((s, m) => s + m.purineMg, 0);
    expect(constrained).toBeLessThanOrEqual(unconstrained);
  });

  it("labels constraints", () => {
    const plan = generatePlan({ kcalTarget: 1700, lowPurine: true, lowSodium: true, lowCarb: true });
    expect(plan.constraints.length).toBeGreaterThanOrEqual(3);
  });

  it("computes per-day totals", () => {
    const plan = generatePlan({ kcalTarget: 1900, lowPurine: false, lowSodium: false, lowCarb: false });
    const totals = dailyTotals(plan.meals);
    expect(totals).toHaveLength(7);
    expect(totals[0].kcal).toBeGreaterThan(0);
  });
});
