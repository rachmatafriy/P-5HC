"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMcuRecord, type McuInput } from "@/lib/mcu/actions";

const NUMERIC_FIELDS: { name: keyof McuInput; label: string; unit?: string }[] = [
  { name: "weightKg", label: "Weight", unit: "kg" },
  { name: "heightCm", label: "Height", unit: "cm" },
  { name: "waistCm", label: "Waist", unit: "cm" },
  { name: "systolicBp", label: "Systolic BP", unit: "mmHg" },
  { name: "diastolicBp", label: "Diastolic BP", unit: "mmHg" },
  { name: "heartRate", label: "Heart rate", unit: "bpm" },
  { name: "fastingGlucose", label: "Fasting glucose", unit: "mg/dL" },
  { name: "hba1c", label: "HbA1c", unit: "%" },
  { name: "totalChol", label: "Total cholesterol", unit: "mg/dL" },
  { name: "ldl", label: "LDL", unit: "mg/dL" },
  { name: "hdl", label: "HDL", unit: "mg/dL" },
  { name: "triglycerides", label: "Triglycerides", unit: "mg/dL" },
  { name: "uricAcid", label: "Uric acid", unit: "mg/dL" },
  { name: "ast", label: "AST (SGOT)", unit: "U/L" },
  { name: "alt", label: "ALT (SGPT)", unit: "U/L" },
  { name: "creatinine", label: "Creatinine", unit: "mg/dL" },
];

const VERDICTS = [
  { value: "FIT", label: "Fit" },
  { value: "FIT_WITH_NOTE", label: "Fit with note" },
  { value: "FIT_WITH_RESTRICTION", label: "Fit with restriction" },
  { value: "TEMPORARILY_UNFIT", label: "Temporarily unfit" },
  { value: "UNFIT", label: "Unfit" },
];

export function McuForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verdict, setVerdict] = React.useState("FIT");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const input: Record<string, unknown> = { verdict };
    for (const [k, v] of fd.entries()) {
      if (v !== "") input[k] = v;
    }

    const res = await createMcuRecord(input as McuInput);
    setPending(false);

    if (!res.ok) {
      setError(res.error ?? "Failed to save record");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New MCU Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Medical Check Up</DialogTitle>
          <DialogDescription>
            Enter your results. Risk scores and your health index are computed automatically on save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="examDate">Exam date</Label>
              <Input id="examDate" name="examDate" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" name="provider" placeholder="e.g. Prodia" />
            </div>
            <div className="space-y-1.5">
              <Label>Verdict</Label>
              <Select value={verdict} onValueChange={setVerdict}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERDICTS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {NUMERIC_FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name} className="text-xs">
                  {f.label} {f.unit && <span className="text-muted-foreground">({f.unit})</span>}
                </Label>
                <Input id={f.name} name={f.name} type="number" step="any" inputMode="decimal" />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional clinician notes" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Save & compute risk
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
