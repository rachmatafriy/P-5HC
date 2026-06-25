import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { McuForm } from "@/components/mcu/mcu-form";
import { McuTable } from "@/components/mcu/mcu-table";
import { safeQuery, resolveUserId } from "@/lib/db";
import { sampleMcuRows } from "@/lib/mcu/sample";
import type { McuRow } from "@/lib/mcu/types";

export const dynamic = "force-dynamic";

async function getRows(): Promise<{ rows: McuRow[]; sample: boolean }> {
  const userId = await resolveUserId();
  const records = await safeQuery(
    (db) =>
      db.mcuRecord.findMany({
        where: { userId },
        orderBy: { examDate: "desc" },
        include: { riskAssessment: true },
      }),
    [],
  );

  if (!records.length) return { rows: sampleMcuRows(), sample: true };

  const rows: McuRow[] = records.map((r) => ({
    id: r.id,
    examDate: r.examDate.toISOString().slice(0, 10),
    provider: r.provider,
    verdict: r.verdict,
    weightKg: r.weightKg,
    systolicBp: r.systolicBp,
    diastolicBp: r.diastolicBp,
    fastingGlucose: r.fastingGlucose,
    bmi: r.riskAssessment?.bmi ?? null,
    bmiCategory: r.riskAssessment?.bmiCategory ?? null,
    healthIndex: r.riskAssessment?.healthIndex ?? null,
    cardiovascularRisk: r.riskAssessment?.cardiovascularRisk ?? null,
    metabolicRisk: r.riskAssessment?.metabolicRisk ?? null,
    diabetesRisk: r.riskAssessment?.diabetesRisk ?? null,
  }));
  return { rows, sample: false };
}

export default async function McuPage() {
  const { rows, sample } = await getRows();
  const latest = rows[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MCU Management</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Record and track your Medical Check Up results. Each entry automatically generates a
            deterministic risk assessment and updates your health index.
          </p>
        </div>
        <McuForm />
      </div>

      {sample && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          Showing sample data. Connect a database and add a record to see your own history.
        </div>
      )}

      {latest && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Latest Health Index" value={`${latest.healthIndex ?? "—"}`} />
          <MiniStat label="BMI" value={`${latest.bmi ?? "—"}`} sub={latest.bmiCategory ?? ""} />
          <MiniStat
            label="Cardiovascular (10-yr)"
            value={latest.cardiovascularRisk != null ? `${latest.cardiovascularRisk}%` : "—"}
          />
          <MiniStat label="Records on file" value={`${rows.length}`} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            MCU History
            <Badge variant="outline">{rows.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <McuTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
