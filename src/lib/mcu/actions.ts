"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/db";
import { assess, recoveryForecast, type Gender } from "@/lib/health/calculations";

const num = z.coerce.number().optional();

export const McuInputSchema = z.object({
  examDate: z.string().min(1, "Exam date is required"),
  provider: z.string().optional(),
  verdict: z
    .enum(["FIT", "FIT_WITH_NOTE", "FIT_WITH_RESTRICTION", "TEMPORARILY_UNFIT", "UNFIT"])
    .default("FIT"),
  notes: z.string().optional(),
  weightKg: num,
  heightCm: num,
  waistCm: num,
  systolicBp: num,
  diastolicBp: num,
  heartRate: num,
  fastingGlucose: num,
  hba1c: num,
  totalChol: num,
  ldl: num,
  hdl: num,
  triglycerides: num,
  uricAcid: num,
  ast: num,
  alt: num,
  creatinine: num,
  egfr: num,
});

export type McuInput = z.input<typeof McuInputSchema>;

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function ageFrom(dob: Date | null | undefined, at: Date): number {
  if (!dob) return 35;
  let age = at.getFullYear() - dob.getFullYear();
  const m = at.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

/** Create an MCU record and its deterministic risk assessment in one transaction. */
export async function createMcuRecord(raw: McuInput): Promise<ActionResult> {
  const parsed = McuInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const userId = await resolveUserId();
    const profile = await prisma.healthProfile.findUnique({ where: { userId } });

    const examDate = new Date(data.examDate);
    const gender = (profile?.gender ?? "MALE") as Gender;
    const age = ageFrom(profile?.dateOfBirth, examDate);
    const heightCm = data.heightCm ?? profile?.heightCm ?? 170;
    const weightKg = data.weightKg ?? profile?.baselineWeight ?? 70;

    const a = assess({
      gender,
      age,
      heightCm,
      weightKg,
      waistCm: data.waistCm,
      systolicBp: data.systolicBp,
      diastolicBp: data.diastolicBp,
      fastingGlucose: data.fastingGlucose,
      hba1c: data.hba1c,
      totalChol: data.totalChol,
      hdl: data.hdl,
      ldl: data.ldl,
      triglycerides: data.triglycerides,
      uricAcid: data.uricAcid,
      ast: data.ast,
      alt: data.alt,
      smoker: profile?.smoker ?? false,
    });

    const targetIndex = profile?.targetHealthIdx ?? 85;
    const forecast = recoveryForecast(a.healthIndex, targetIndex);

    await prisma.$transaction(async (tx) => {
      await tx.mcuRecord.create({
        data: {
          userId,
          examDate,
          provider: data.provider || null,
          verdict: data.verdict,
          notes: data.notes || null,
          weightKg: data.weightKg ?? null,
          heightCm: data.heightCm ?? null,
          waistCm: data.waistCm ?? null,
          systolicBp: data.systolicBp ?? null,
          diastolicBp: data.diastolicBp ?? null,
          heartRate: data.heartRate ?? null,
          fastingGlucose: data.fastingGlucose ?? null,
          hba1c: data.hba1c ?? null,
          totalChol: data.totalChol ?? null,
          ldl: data.ldl ?? null,
          hdl: data.hdl ?? null,
          triglycerides: data.triglycerides ?? null,
          uricAcid: data.uricAcid ?? null,
          ast: data.ast ?? null,
          alt: data.alt ?? null,
          creatinine: data.creatinine ?? null,
          egfr: data.egfr ?? null,
          riskAssessment: {
            create: {
              bmi: a.bmi,
              bmiCategory: a.bmiCategory,
              waistRisk: a.waistRisk,
              cardiovascularRisk: a.cardiovascularRisk,
              metabolicRisk: a.metabolicRisk,
              fattyLiverRisk: a.fattyLiverRisk,
              hyperuricemiaRisk: a.hyperuricemiaRisk,
              diabetesRisk: a.diabetesRisk,
              healthIndex: a.healthIndex,
              biologicalAge: a.biologicalAge,
              lifeExpectancy: a.lifeExpectancy,
              recoveryForecast: forecast as object,
            },
          },
        },
      });

      const day = new Date(examDate);
      day.setHours(0, 0, 0, 0);
      await tx.healthIndexSnapshot.upsert({
        where: { userId_date: { userId, date: day } },
        update: { score: a.healthIndex, recoveryPct: forecast.recoveryPct },
        create: {
          userId,
          date: day,
          score: a.healthIndex,
          recoveryPct: forecast.recoveryPct,
          components: a.healthComponents as object,
        },
      });
    });

    revalidatePath("/mcu");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteMcuRecord(id: string): Promise<ActionResult> {
  try {
    await prisma.mcuRecord.delete({ where: { id } });
    revalidatePath("/mcu");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
