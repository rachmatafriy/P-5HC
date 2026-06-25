/**
 * PDHRS seed data.
 * Creates a demo organisation, a demo user, a baseline MCU with a computed risk
 * assessment, a recovery plan, and a week of trackers + health-index snapshots.
 *
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { assess, recoveryForecast } from "../src/lib/health/calculations";

const prisma = new PrismaClient();

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-0000000000aa" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-0000000000aa",
      name: "PDHRS Demo Corp",
      industry: "Energy",
    },
  });

  const site = await prisma.site.upsert({
    where: { id: "00000000-0000-0000-0000-0000000000bb" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-0000000000bb",
      organizationId: org.id,
      name: "Head Office",
      location: "Jakarta, ID",
    },
  });

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@pdhrs.app",
      fullName: "Demo User",
      role: "USER",
      organizationId: org.id,
      siteId: site.id,
      jobTitle: "Operations Engineer",
      department: "Operations",
      employeeId: "EMP-0001",
    },
  });

  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      dateOfBirth: new Date("1987-04-12"),
      gender: "MALE",
      heightCm: 172,
      baselineWeight: 84,
      activityLevel: "light",
      targetWeight: 74,
      targetHealthIdx: 85,
      chronicDisease: [],
    },
  });

  const biomarkers = {
    gender: "MALE" as const,
    age: 38,
    heightCm: 172,
    weightKg: 84,
    waistCm: 96,
    systolicBp: 134,
    diastolicBp: 86,
    fastingGlucose: 104,
    hba1c: 5.8,
    totalChol: 214,
    hdl: 42,
    triglycerides: 178,
    uricAcid: 7.2,
    alt: 48,
    ast: 38,
    smoker: false,
  };

  const a = assess(biomarkers);
  const forecast = recoveryForecast(a.healthIndex, 85, 1.8);

  const mcu = await prisma.mcuRecord.create({
    data: {
      userId: user.id,
      examDate: new Date("2026-05-15"),
      provider: "Prodia",
      verdict: "FIT_WITH_NOTE",
      weightKg: biomarkers.weightKg,
      heightCm: biomarkers.heightCm,
      waistCm: biomarkers.waistCm,
      systolicBp: biomarkers.systolicBp,
      diastolicBp: biomarkers.diastolicBp,
      fastingGlucose: biomarkers.fastingGlucose,
      hba1c: biomarkers.hba1c,
      totalChol: biomarkers.totalChol,
      hdl: biomarkers.hdl,
      triglycerides: biomarkers.triglycerides,
      uricAcid: biomarkers.uricAcid,
      alt: biomarkers.alt,
      ast: biomarkers.ast,
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

  await prisma.recoveryPlan.create({
    data: {
      userId: user.id,
      mcuRecordId: mcu.id,
      title: "Post-MCU 90-day Recovery",
      objective: "Lower metabolic & cardiovascular risk; reach health index 85.",
      startDate: new Date("2026-05-20"),
      targetDate: new Date("2026-08-20"),
      targetWeight: 74,
      targetIndex: 85,
      progressPct: forecast.recoveryPct,
      goals: {
        create: [
          { metric: "weight", baseline: 84, target: 74, current: 84, unit: "kg" },
          { metric: "ldl", baseline: 150, target: 100, current: 150, unit: "mg/dL" },
          { metric: "uricAcid", baseline: 7.2, target: 6.0, current: 7.2, unit: "mg/dL" },
          { metric: "systolicBp", baseline: 134, target: 120, current: 134, unit: "mmHg" },
        ],
      },
    },
  });

  // A week of trackers + index snapshots.
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    await prisma.waterLog.upsert({
      where: { userId_date: { userId: user.id, date: d } },
      update: {},
      create: { userId: user.id, date: d, amountMl: 1800 + i * 100, goalMl: 2500 },
    });
    await prisma.sleepLog.upsert({
      where: { userId_date: { userId: user.id, date: d } },
      update: {},
      create: { userId: user.id, date: d, hours: 6 + (i % 3) * 0.5, qualityScore: 6 + (i % 3) },
    });
    await prisma.healthIndexSnapshot.upsert({
      where: { userId_date: { userId: user.id, date: d } },
      update: {},
      create: {
        userId: user.id,
        date: d,
        score: a.healthIndex + (6 - i),
        recoveryPct: forecast.recoveryPct,
        components: a.healthComponents as object,
      },
    });
  }

  console.log("✅ Seed complete. Demo user:", user.email, "Health index:", a.healthIndex);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
