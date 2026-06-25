/**
 * PDHRS Health Calculation Engine
 * --------------------------------
 * Deterministic, unit-tested clinical risk calculators. These run server-side
 * and feed both the dashboard and the AI agents (the AI explains/contextualises
 * these numbers; it never invents them).
 *
 * References (simplified, screening-grade — NOT a diagnostic device):
 *  - WHO BMI & waist circumference cut-points (Asia-Pacific where noted)
 *  - Framingham-style 10-year CVD risk (simplified point model)
 *  - IDF metabolic syndrome criteria
 *  - FINDRISC-inspired diabetes risk mapping
 *  - Phenotypic / biomarker biological-age heuristic
 */

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Biomarkers {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  systolicBp?: number;
  diastolicBp?: number;
  fastingGlucose?: number; // mg/dL
  hba1c?: number; // %
  totalChol?: number; // mg/dL
  hdl?: number; // mg/dL
  ldl?: number; // mg/dL
  triglycerides?: number; // mg/dL
  uricAcid?: number; // mg/dL
  ast?: number; // U/L (SGOT)
  alt?: number; // U/L (SGPT)
  smoker?: boolean;
}

export type RiskLevel = "low" | "moderate" | "high" | "very-high";

// --------------------------------------------------------------------------
// Anthropometry
// --------------------------------------------------------------------------

export function calcBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const m = heightCm / 100;
  return round(weightKg / (m * m), 1);
}

/** WHO Asia-Pacific BMI categories (more conservative cut-points). */
export function bmiCategory(bmi: number): {
  label: string;
  level: RiskLevel;
} {
  if (bmi < 18.5) return { label: "Underweight", level: "moderate" };
  if (bmi < 23) return { label: "Normal", level: "low" };
  if (bmi < 25) return { label: "Overweight (at risk)", level: "moderate" };
  if (bmi < 30) return { label: "Obese I", level: "high" };
  return { label: "Obese II", level: "very-high" };
}

/** Waist circumference risk by gender (Asia-Pacific cut-points, cm). */
export function waistRisk(waistCm: number | undefined, gender: Gender): RiskLevel {
  if (!waistCm) return "low";
  const threshold = gender === "FEMALE" ? 80 : 90;
  const high = gender === "FEMALE" ? 88 : 102;
  if (waistCm >= high) return "very-high";
  if (waistCm >= threshold) return "high";
  return "low";
}

// --------------------------------------------------------------------------
// Cardiovascular — simplified Framingham point model -> 10yr risk %
// --------------------------------------------------------------------------

export function cardiovascularRisk(b: Biomarkers): { percent: number; level: RiskLevel } {
  let pts = 0;
  // Age
  if (b.age >= 70) pts += 6;
  else if (b.age >= 60) pts += 5;
  else if (b.age >= 50) pts += 3;
  else if (b.age >= 40) pts += 2;
  else if (b.age >= 30) pts += 1;
  // Sex baseline
  if (b.gender === "MALE") pts += 1;
  // Blood pressure
  const sbp = b.systolicBp ?? 120;
  if (sbp >= 160) pts += 3;
  else if (sbp >= 140) pts += 2;
  else if (sbp >= 130) pts += 1;
  // Lipids
  if ((b.totalChol ?? 180) >= 240) pts += 2;
  else if ((b.totalChol ?? 180) >= 200) pts += 1;
  if ((b.hdl ?? 50) < 40) pts += 2;
  else if ((b.hdl ?? 50) < 50) pts += 1;
  // Smoking
  if (b.smoker) pts += 3;
  // Glycemia
  if ((b.fastingGlucose ?? 90) >= 126 || (b.hba1c ?? 5) >= 6.5) pts += 2;

  // Map points -> approximate 10-year risk %
  const percent = clamp(round(Math.pow(1.32, pts) - 1, 1), 1, 60);
  return { percent, level: levelFromPercent(percent, 5, 10, 20) };
}

// --------------------------------------------------------------------------
// Metabolic syndrome (IDF) — count of criteria
// --------------------------------------------------------------------------

export function metabolicRisk(b: Biomarkers): { criteria: number; level: RiskLevel } {
  let n = 0;
  const waistThresh = b.gender === "FEMALE" ? 80 : 90;
  if ((b.waistCm ?? 0) >= waistThresh) n++;
  if ((b.triglycerides ?? 0) >= 150) n++;
  const hdlLow = b.gender === "FEMALE" ? 50 : 40;
  if ((b.hdl ?? 100) < hdlLow) n++;
  if ((b.systolicBp ?? 0) >= 130 || (b.diastolicBp ?? 0) >= 85) n++;
  if ((b.fastingGlucose ?? 0) >= 100) n++;

  const level: RiskLevel = n >= 3 ? "high" : n === 2 ? "moderate" : "low";
  return { criteria: n, level };
}

// --------------------------------------------------------------------------
// Non-alcoholic fatty liver risk — transaminase + metabolic heuristic
// --------------------------------------------------------------------------

export function fattyLiverRisk(b: Biomarkers): RiskLevel {
  let score = 0;
  const bmi = calcBmi(b.weightKg, b.heightCm);
  if (bmi >= 30) score += 2;
  else if (bmi >= 25) score += 1;
  if ((b.alt ?? 0) > 40) score += 2;
  if ((b.ast ?? 0) > 40) score += 1;
  if ((b.triglycerides ?? 0) >= 150) score += 1;
  if ((b.fastingGlucose ?? 0) >= 100) score += 1;
  if (score >= 5) return "very-high";
  if (score >= 3) return "high";
  if (score >= 1) return "moderate";
  return "low";
}

// --------------------------------------------------------------------------
// Hyperuricemia
// --------------------------------------------------------------------------

export function hyperuricemiaRisk(b: Biomarkers): RiskLevel {
  const ua = b.uricAcid;
  if (ua == null) return "low";
  const upper = b.gender === "FEMALE" ? 6.0 : 7.0;
  if (ua >= upper + 2) return "very-high";
  if (ua >= upper) return "high";
  if (ua >= upper - 1) return "moderate";
  return "low";
}

// --------------------------------------------------------------------------
// Diabetes — FINDRISC-inspired -> approximate risk %
// --------------------------------------------------------------------------

export function diabetesRisk(b: Biomarkers): { percent: number; level: RiskLevel } {
  let pts = 0;
  if (b.age >= 64) pts += 4;
  else if (b.age >= 55) pts += 3;
  else if (b.age >= 45) pts += 2;
  const bmi = calcBmi(b.weightKg, b.heightCm);
  if (bmi > 30) pts += 3;
  else if (bmi >= 25) pts += 1;
  const waistThresh = b.gender === "FEMALE" ? 80 : 94;
  const waistHigh = b.gender === "FEMALE" ? 88 : 102;
  if ((b.waistCm ?? 0) >= waistHigh) pts += 4;
  else if ((b.waistCm ?? 0) >= waistThresh) pts += 3;
  if ((b.fastingGlucose ?? 0) >= 100) pts += 5;
  if ((b.hba1c ?? 0) >= 5.7) pts += 5;
  if ((b.systolicBp ?? 0) >= 130) pts += 2;

  const map: Record<string, number> = { veryHigh: 50, high: 33, elevated: 17, slight: 4, low: 1 };
  let percent = map.low;
  if (pts >= 20) percent = map.veryHigh;
  else if (pts >= 15) percent = map.high;
  else if (pts >= 12) percent = map.elevated;
  else if (pts >= 7) percent = map.slight;
  return { percent, level: levelFromPercent(percent, 10, 20, 35) };
}

// --------------------------------------------------------------------------
// Composite Health Index (0-100, higher = healthier)
// --------------------------------------------------------------------------

export interface HealthIndexResult {
  score: number;
  components: {
    anthropometric: number;
    cardiovascular: number;
    metabolic: number;
    liver: number;
    lifestyle: number;
  };
}

export function healthIndex(b: Biomarkers): HealthIndexResult {
  // Each component starts at 100 and is penalised.
  const bmi = calcBmi(b.weightKg, b.heightCm);
  const bmiCat = bmiCategory(bmi);
  const anthropometric = penalise(100, [
    [bmiCat.level, 25],
    [waistRisk(b.waistCm, b.gender), 15],
  ]);

  const cvd = cardiovascularRisk(b);
  const cardiovascular = clamp(100 - cvd.percent * 2.2, 0, 100);

  const met = metabolicRisk(b);
  const metabolic = clamp(100 - met.criteria * 18, 0, 100);

  const liver = penalise(100, [[fattyLiverRisk(b), 35]]);

  let lifestyle = 100;
  if (b.smoker) lifestyle -= 30;
  lifestyle = clamp(lifestyle, 0, 100);

  // Weighted composite
  const score = Math.round(
    anthropometric * 0.2 +
      cardiovascular * 0.3 +
      metabolic * 0.25 +
      liver * 0.15 +
      lifestyle * 0.1,
  );

  return {
    score: clamp(score, 0, 100),
    components: {
      anthropometric: Math.round(anthropometric),
      cardiovascular: Math.round(cardiovascular),
      metabolic: Math.round(metabolic),
      liver: Math.round(liver),
      lifestyle: Math.round(lifestyle),
    },
  };
}

// --------------------------------------------------------------------------
// Biological age & life expectancy (heuristic)
// --------------------------------------------------------------------------

export function biologicalAge(b: Biomarkers): number {
  const idx = healthIndex(b).score;
  // Index 85 => chronological age; each 10 points off => ~3 years delta.
  const delta = ((85 - idx) / 10) * 3;
  return round(clamp(b.age + delta, 18, 100), 1);
}

export function lifeExpectancy(b: Biomarkers): number {
  const base = b.gender === "FEMALE" ? 76 : 72; // Indonesia-aligned baseline
  const idx = healthIndex(b).score;
  let le = base + (idx - 70) * 0.18;
  if (b.smoker) le -= 6;
  return round(clamp(le, b.age + 1, 100), 1);
}

// --------------------------------------------------------------------------
// Recovery forecast — projects health index toward target
// --------------------------------------------------------------------------

export interface RecoveryForecast {
  currentIndex: number;
  targetIndex: number;
  recoveryPct: number;
  weeksToTarget: number | null;
  etaDate: string | null;
  trajectory: { week: number; projectedIndex: number }[];
}

export function recoveryForecast(
  currentIndex: number,
  targetIndex: number,
  weeklyGainPoints = 1.5,
  startDate: Date = new Date(),
): RecoveryForecast {
  const gap = Math.max(0, targetIndex - currentIndex);
  const weeks = weeklyGainPoints > 0 ? Math.ceil(gap / weeklyGainPoints) : null;
  const recoveryPct = targetIndex > 0 ? round(clamp((currentIndex / targetIndex) * 100, 0, 100), 1) : 0;

  const trajectory: RecoveryForecast["trajectory"] = [];
  const horizon = Math.min(weeks ?? 12, 26);
  for (let w = 0; w <= horizon; w++) {
    trajectory.push({
      week: w,
      projectedIndex: round(Math.min(targetIndex, currentIndex + w * weeklyGainPoints), 1),
    });
  }

  let etaDate: string | null = null;
  if (weeks != null) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + weeks * 7);
    etaDate = d.toISOString().slice(0, 10);
  }

  return { currentIndex, targetIndex, recoveryPct, weeksToTarget: weeks, etaDate, trajectory };
}

// --------------------------------------------------------------------------
// Aggregate — single entry point used by the Risk Assessor agent / API
// --------------------------------------------------------------------------

export interface FullAssessment {
  bmi: number;
  bmiCategory: string;
  waistRisk: RiskLevel;
  cardiovascularRisk: number;
  cardiovascularLevel: RiskLevel;
  metabolicRisk: RiskLevel;
  metabolicCriteria: number;
  fattyLiverRisk: RiskLevel;
  hyperuricemiaRisk: RiskLevel;
  diabetesRisk: number;
  diabetesLevel: RiskLevel;
  healthIndex: number;
  healthComponents: HealthIndexResult["components"];
  biologicalAge: number;
  lifeExpectancy: number;
}

export function assess(b: Biomarkers): FullAssessment {
  const bmi = calcBmi(b.weightKg, b.heightCm);
  const cvd = cardiovascularRisk(b);
  const met = metabolicRisk(b);
  const dm = diabetesRisk(b);
  const hi = healthIndex(b);
  return {
    bmi,
    bmiCategory: bmiCategory(bmi).label,
    waistRisk: waistRisk(b.waistCm, b.gender),
    cardiovascularRisk: cvd.percent,
    cardiovascularLevel: cvd.level,
    metabolicRisk: met.level,
    metabolicCriteria: met.criteria,
    fattyLiverRisk: fattyLiverRisk(b),
    hyperuricemiaRisk: hyperuricemiaRisk(b),
    diabetesRisk: dm.percent,
    diabetesLevel: dm.level,
    healthIndex: hi.score,
    healthComponents: hi.components,
    biologicalAge: biologicalAge(b),
    lifeExpectancy: lifeExpectancy(b),
  };
}

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------

function round(n: number, dp = 0): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

const LEVEL_PENALTY: Record<RiskLevel, number> = {
  low: 0,
  moderate: 0.4,
  high: 0.75,
  "very-high": 1,
};

function penalise(base: number, items: [RiskLevel, number][]): number {
  let v = base;
  for (const [level, weight] of items) v -= weight * LEVEL_PENALTY[level];
  return clamp(v, 0, 100);
}

function levelFromPercent(p: number, modAt: number, highAt: number, veryHighAt: number): RiskLevel {
  if (p >= veryHighAt) return "very-high";
  if (p >= highAt) return "high";
  if (p >= modAt) return "moderate";
  return "low";
}
