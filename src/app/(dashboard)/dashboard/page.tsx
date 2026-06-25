import { StatCard } from "@/components/dashboard/stat-card";
import { HealthTrendChart, type TrendPoint } from "@/components/charts/health-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { assess, recoveryForecast, type Biomarkers } from "@/lib/health/calculations";
import { Gauge, HeartPulse, Activity, Droplets, Moon, Dumbbell } from "lucide-react";
import { riskColor } from "@/lib/utils";

// Demo biomarkers — in production this comes from the user's latest MCU record.
const SAMPLE: Biomarkers = {
  gender: "MALE",
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

export default function DashboardPage() {
  const a = assess(SAMPLE);
  const targetIndex = 85;
  const forecast = recoveryForecast(a.healthIndex, targetIndex, 1.8);

  const trend: TrendPoint[] = forecast.trajectory.map((t) => ({
    label: `W${t.week}`,
    index: t.week === 0 ? a.healthIndex : Math.round(a.healthIndex - (forecast.trajectory.length - t.week) * 0.4),
    forecast: t.projectedIndex,
  }));

  const risks = [
    { label: "Cardiovascular (10-yr)", value: `${a.cardiovascularRisk}%`, level: a.cardiovascularLevel },
    { label: "Diabetes", value: `${a.diabetesRisk}%`, level: a.diabetesLevel },
    { label: "Metabolic Syndrome", value: `${a.metabolicCriteria}/5 criteria`, level: a.metabolicRisk },
    { label: "Fatty Liver", value: a.fattyLiverRisk, level: a.fattyLiverRisk },
    { label: "Hyperuricemia", value: a.hyperuricemiaRisk, level: a.hyperuricemiaRisk },
    { label: "Waist Risk", value: a.waistRisk, level: a.waistRisk },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your recovery at a glance — computed from your latest Medical Check Up.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Health Index"
          value={a.healthIndex}
          unit="/100"
          icon={Gauge}
          hint={`Target ${targetIndex} · ${forecast.weeksToTarget ?? 0} wks to go`}
          tone={a.healthIndex >= 75 ? "success" : a.healthIndex >= 50 ? "warning" : "danger"}
        />
        <StatCard title="BMI" value={a.bmi} icon={Activity} hint={a.bmiCategory} tone="warning" />
        <StatCard
          title="Biological Age"
          value={a.biologicalAge}
          unit="yrs"
          icon={HeartPulse}
          hint={`Chronological ${SAMPLE.age}`}
        />
        <StatCard
          title="Life Expectancy"
          value={a.lifeExpectancy}
          unit="yrs"
          icon={HeartPulse}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend + forecast */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Index Trend & Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthTrendChart data={trend} />
          </CardContent>
        </Card>

        {/* Recovery */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">To target index</span>
                <span className="font-medium">{forecast.recoveryPct}%</span>
              </div>
              <Progress value={forecast.recoveryPct} />
            </div>
            <div className="rounded-lg bg-accent/50 p-3 text-sm">
              <p className="text-muted-foreground">Estimated arrival</p>
              <p className="font-semibold">{forecast.etaDate ?? "—"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <DailyChip icon={Droplets} label="Water" value="1.8L" />
              <DailyChip icon={Moon} label="Sleep" value="6.5h" />
              <DailyChip icon={Dumbbell} label="Move" value="42m" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk panel */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Risk Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {risks.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg border bg-background/40 px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold capitalize ${riskColor(r.level)}`}>
                  {r.value}
                </span>
                <Badge
                  variant={
                    r.level === "low"
                      ? "success"
                      : r.level === "moderate"
                        ? "warning"
                        : "danger"
                  }
                >
                  {r.level}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DailyChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background/40 p-2">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-semibold">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
