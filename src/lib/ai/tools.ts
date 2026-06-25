import type OpenAI from "openai";
import { assess, recoveryForecast, type Biomarkers } from "@/lib/health/calculations";

/**
 * Function-calling tool definitions exposed to the AI agents. The model can
 * request these; we execute the deterministic engine and feed results back.
 */
export const AI_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "computeHealthRisks",
      description:
        "Compute deterministic clinical risk scores (BMI, cardiovascular, metabolic, diabetes, fatty liver, hyperuricemia, health index, biological age, life expectancy) from biomarkers.",
      parameters: {
        type: "object",
        properties: {
          gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
          age: { type: "number" },
          heightCm: { type: "number" },
          weightKg: { type: "number" },
          waistCm: { type: "number" },
          systolicBp: { type: "number" },
          diastolicBp: { type: "number" },
          fastingGlucose: { type: "number" },
          hba1c: { type: "number" },
          totalChol: { type: "number" },
          hdl: { type: "number" },
          ldl: { type: "number" },
          triglycerides: { type: "number" },
          uricAcid: { type: "number" },
          ast: { type: "number" },
          alt: { type: "number" },
          smoker: { type: "boolean" },
        },
        required: ["gender", "age", "heightCm", "weightKg"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "projectRecovery",
      description:
        "Project the user's health index trajectory toward a target and estimate weeks/ETA to reach it.",
      parameters: {
        type: "object",
        properties: {
          currentIndex: { type: "number" },
          targetIndex: { type: "number" },
          weeklyGainPoints: { type: "number" },
        },
        required: ["currentIndex", "targetIndex"],
      },
    },
  },
];

/** Execute a tool call requested by the model. */
export function runTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "computeHealthRisks":
      return assess(args as unknown as Biomarkers);
    case "projectRecovery":
      return recoveryForecast(
        Number(args.currentIndex),
        Number(args.targetIndex),
        args.weeklyGainPoints != null ? Number(args.weeklyGainPoints) : undefined,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
