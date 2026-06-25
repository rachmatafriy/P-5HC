import { describe, it, expect } from "vitest";
import {
  calcBmi,
  bmiCategory,
  waistRisk,
  cardiovascularRisk,
  metabolicRisk,
  fattyLiverRisk,
  hyperuricemiaRisk,
  diabetesRisk,
  healthIndex,
  recoveryForecast,
  assess,
  type Biomarkers,
} from "./calculations";

const healthy: Biomarkers = {
  gender: "MALE",
  age: 30,
  heightCm: 175,
  weightKg: 70,
  waistCm: 82,
  systolicBp: 118,
  diastolicBp: 76,
  fastingGlucose: 88,
  hba1c: 5.2,
  totalChol: 180,
  hdl: 55,
  triglycerides: 110,
  uricAcid: 5.5,
  alt: 25,
  ast: 22,
  smoker: false,
};

const atRisk: Biomarkers = {
  gender: "MALE",
  age: 55,
  heightCm: 170,
  weightKg: 95,
  waistCm: 108,
  systolicBp: 150,
  diastolicBp: 95,
  fastingGlucose: 130,
  hba1c: 6.8,
  totalChol: 250,
  hdl: 35,
  triglycerides: 220,
  uricAcid: 8.5,
  alt: 65,
  ast: 55,
  smoker: true,
};

describe("BMI", () => {
  it("computes BMI", () => {
    expect(calcBmi(70, 175)).toBeCloseTo(22.9, 1);
  });
  it("categorises with Asia-Pacific cut-points", () => {
    expect(bmiCategory(22).label).toBe("Normal");
    expect(bmiCategory(24).label).toBe("Overweight (at risk)");
    expect(bmiCategory(32).level).toBe("very-high");
  });
});

describe("waist risk", () => {
  it("uses gender thresholds", () => {
    expect(waistRisk(82, "MALE")).toBe("low");
    expect(waistRisk(82, "FEMALE")).toBe("high");
    expect(waistRisk(105, "MALE")).toBe("very-high");
  });
});

describe("risk calculators discriminate healthy vs at-risk", () => {
  it("cardiovascular", () => {
    expect(cardiovascularRisk(atRisk).percent).toBeGreaterThan(
      cardiovascularRisk(healthy).percent,
    );
  });
  it("metabolic syndrome criteria", () => {
    expect(metabolicRisk(atRisk).criteria).toBeGreaterThanOrEqual(3);
    expect(metabolicRisk(healthy).criteria).toBeLessThanOrEqual(1);
  });
  it("fatty liver", () => {
    expect(fattyLiverRisk(atRisk)).toBe("very-high");
    expect(fattyLiverRisk(healthy)).toBe("low");
  });
  it("hyperuricemia", () => {
    expect(hyperuricemiaRisk(atRisk)).toBe("high");
    expect(hyperuricemiaRisk(healthy)).toBe("low");
  });
  it("diabetes", () => {
    expect(diabetesRisk(atRisk).percent).toBeGreaterThan(diabetesRisk(healthy).percent);
  });
});

describe("health index", () => {
  it("scores healthy higher than at-risk", () => {
    expect(healthIndex(healthy).score).toBeGreaterThan(healthIndex(atRisk).score);
  });
  it("stays within 0-100", () => {
    const s = healthIndex(atRisk).score;
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe("recovery forecast", () => {
  it("projects weeks to target", () => {
    const f = recoveryForecast(60, 85, 2.5);
    expect(f.weeksToTarget).toBe(10);
    expect(f.etaDate).toBeTruthy();
    expect(f.trajectory.at(-1)?.projectedIndex).toBeLessThanOrEqual(85);
  });
  it("handles already-at-target", () => {
    const f = recoveryForecast(90, 85);
    expect(f.weeksToTarget).toBe(0);
  });
});

describe("assess() aggregate", () => {
  it("returns a complete assessment", () => {
    const a = assess(healthy);
    expect(a.healthIndex).toBeGreaterThan(0);
    expect(a.biologicalAge).toBeGreaterThan(0);
    expect(a.lifeExpectancy).toBeGreaterThan(a.bmi); // sanity: a real number
  });
});
