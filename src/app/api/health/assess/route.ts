import { NextResponse } from "next/server";
import { z } from "zod";
import { assess, recoveryForecast } from "@/lib/health/calculations";

const BiomarkerSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  age: z.number().min(0).max(120),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  waistCm: z.number().positive().optional(),
  systolicBp: z.number().optional(),
  diastolicBp: z.number().optional(),
  fastingGlucose: z.number().optional(),
  hba1c: z.number().optional(),
  totalChol: z.number().optional(),
  hdl: z.number().optional(),
  ldl: z.number().optional(),
  triglycerides: z.number().optional(),
  uricAcid: z.number().optional(),
  ast: z.number().optional(),
  alt: z.number().optional(),
  smoker: z.boolean().optional(),
  targetIndex: z.number().min(0).max(100).optional(),
});

/**
 * POST /api/health/assess
 * Computes the full deterministic risk assessment + recovery forecast.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BiomarkerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid biomarkers", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { targetIndex = 85, ...biomarkers } = parsed.data;
  const assessment = assess(biomarkers);
  const forecast = recoveryForecast(assessment.healthIndex, targetIndex);

  return NextResponse.json({ assessment, forecast });
}
