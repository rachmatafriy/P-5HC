import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse, Bot, ShieldCheck, Activity, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Post-MCU Recovery",
    desc: "Turn your Medical Check Up into a daily recovery plan with measurable targets.",
  },
  {
    icon: Bot,
    title: "AI Health Coach",
    desc: "Morning plans, evening reviews, weekly & monthly reports — personalised to your data.",
  },
  {
    icon: Activity,
    title: "Predictive Risk",
    desc: "BMI, cardiovascular, metabolic, diabetes, fatty liver & biological age — computed, not guessed.",
  },
  {
    icon: ShieldCheck,
    title: "Occupational Health",
    desc: "Fitness for Work (P1–P5), surveillance & ISO 45001 reporting, ready to scale to a corporate OHMS.",
  },
];

export default function LandingPage() {
  return (
    <main className="gradient-mesh min-h-screen">
      <div className="container mx-auto px-6 py-24">
        <nav className="mb-20 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">PDHRS</span>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open App</Link>
          </Button>
        </nav>

        <section className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Recover your health after your Medical Check Up.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            PDHRS tracks your progress daily, predicts future outcomes, and supports occupational
            health management aligned with WHO, ILO, ISO 45001 and Indonesian regulations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get started <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
