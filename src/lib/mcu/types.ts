import type { RiskLevel } from "@/lib/health/calculations";

/** Flattened MCU row consumed by the table (decoupled from Prisma models). */
export interface McuRow {
  id: string;
  examDate: string; // ISO date
  provider: string | null;
  verdict: string;
  weightKg: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  fastingGlucose: number | null;
  bmi: number | null;
  bmiCategory: string | null;
  healthIndex: number | null;
  cardiovascularRisk: number | null;
  metabolicRisk: RiskLevel | string | null;
  diabetesRisk: number | null;
  isSample?: boolean;
}

export const VERDICT_LABELS: Record<string, string> = {
  FIT: "Fit",
  FIT_WITH_NOTE: "Fit (note)",
  FIT_WITH_RESTRICTION: "Fit (restricted)",
  TEMPORARILY_UNFIT: "Temp. unfit",
  UNFIT: "Unfit",
};
