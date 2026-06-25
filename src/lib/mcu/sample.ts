import { assess } from "@/lib/health/calculations";
import type { McuRow } from "./types";

/** Build a sample MCU history (demo mode when no database is connected). */
export function sampleMcuRows(): McuRow[] {
  const exams = [
    { date: "2025-11-15", weightKg: 89, waistCm: 101, sbp: 142, dbp: 92, glu: 116, hba1c: 6.2, chol: 232, hdl: 38, tg: 205, ua: 7.8, alt: 58, provider: "Prodia", verdict: "FIT_WITH_RESTRICTION" },
    { date: "2026-02-15", weightKg: 86, waistCm: 98, sbp: 138, dbp: 88, glu: 110, hba1c: 6.0, chol: 222, hdl: 40, tg: 190, ua: 7.5, alt: 52, provider: "Prodia", verdict: "FIT_WITH_NOTE" },
    { date: "2026-05-15", weightKg: 84, waistCm: 96, sbp: 134, dbp: 86, glu: 104, hba1c: 5.8, chol: 214, hdl: 42, tg: 178, ua: 7.2, alt: 48, provider: "Prodia", verdict: "FIT_WITH_NOTE" },
  ];

  return exams
    .map((e, i) => {
      const a = assess({
        gender: "MALE",
        age: 38,
        heightCm: 172,
        weightKg: e.weightKg,
        waistCm: e.waistCm,
        systolicBp: e.sbp,
        diastolicBp: e.dbp,
        fastingGlucose: e.glu,
        hba1c: e.hba1c,
        totalChol: e.chol,
        hdl: e.hdl,
        triglycerides: e.tg,
        uricAcid: e.ua,
        alt: e.alt,
        smoker: false,
      });
      return {
        id: `sample-${i}`,
        examDate: e.date,
        provider: e.provider,
        verdict: e.verdict,
        weightKg: e.weightKg,
        systolicBp: e.sbp,
        diastolicBp: e.dbp,
        fastingGlucose: e.glu,
        bmi: a.bmi,
        bmiCategory: a.bmiCategory,
        healthIndex: a.healthIndex,
        cardiovascularRisk: a.cardiovascularRisk,
        metabolicRisk: a.metabolicRisk,
        diabetesRisk: a.diabetesRisk,
        isSample: true,
      } satisfies McuRow;
    })
    .sort((a, b) => b.examDate.localeCompare(a.examDate));
}
