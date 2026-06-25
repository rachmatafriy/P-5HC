# PDHRS — API Reference

All endpoints are Next.js Route Handlers under `src/app/api`. JSON in/out.

## `POST /api/health/assess`

Compute the full deterministic risk assessment + recovery forecast. **No AI** —
pure, reproducible calculation.

### Request body

| Field            | Type                          | Required |
| ---------------- | ----------------------------- | -------- |
| `gender`         | `"MALE" \| "FEMALE" \| "OTHER"` | ✅       |
| `age`            | number (0–120)                | ✅       |
| `heightCm`       | number > 0                    | ✅       |
| `weightKg`       | number > 0                    | ✅       |
| `waistCm`        | number                        | optional |
| `systolicBp`     | number                        | optional |
| `diastolicBp`    | number                        | optional |
| `fastingGlucose` | number (mg/dL)                | optional |
| `hba1c`          | number (%)                    | optional |
| `totalChol`      | number (mg/dL)                | optional |
| `hdl` / `ldl`    | number (mg/dL)                | optional |
| `triglycerides`  | number (mg/dL)                | optional |
| `uricAcid`       | number (mg/dL)                | optional |
| `ast` / `alt`    | number (U/L)                  | optional |
| `smoker`         | boolean                       | optional |
| `targetIndex`    | number (0–100, default 85)    | optional |

### Example

```bash
curl -X POST http://localhost:3000/api/health/assess \
  -H "Content-Type: application/json" \
  -d '{"gender":"MALE","age":38,"heightCm":172,"weightKg":84,"waistCm":96,
       "systolicBp":134,"fastingGlucose":104,"uricAcid":7.2,"alt":48}'
```

### Response `200`

```json
{
  "assessment": {
    "bmi": 28.4,
    "bmiCategory": "Obese I",
    "waistRisk": "high",
    "cardiovascularRisk": 7.3,
    "cardiovascularLevel": "moderate",
    "metabolicRisk": "high",
    "metabolicCriteria": 3,
    "fattyLiverRisk": "high",
    "hyperuricemiaRisk": "high",
    "diabetesRisk": 17,
    "diabetesLevel": "moderate",
    "healthIndex": 58,
    "healthComponents": { "anthropometric": 71, "cardiovascular": 84, "metabolic": 46, "liver": 65, "lifestyle": 100 },
    "biologicalAge": 46.1,
    "lifeExpectancy": 69.6
  },
  "forecast": {
    "currentIndex": 58,
    "targetIndex": 85,
    "recoveryPct": 68.2,
    "weeksToTarget": 18,
    "etaDate": "2026-10-29",
    "trajectory": [{ "week": 0, "projectedIndex": 58 }]
  }
}
```

`422` — invalid biomarkers (Zod validation errors in `details`).

---

## `POST /api/ai/coach`

Generate (and persist) an AI Health Coach artifact. Scheduler-driven.

- **Auth:** `Authorization: Bearer <CRON_SECRET>`
- **Body:** `{ "userId": "<uuid>", "cadence": "MORNING_PLAN" | "EVENING_REVIEW" | "WEEKLY_REPORT" | "MONTHLY_REPORT" }`
- **Response `200`:** `{ "ok": true, "text": "…" }`
- `401` unauthorized · `422` invalid body · `500` generation error

The coach internally **function-calls** the risk engine (`computeHealthRisks`,
`projectRecovery`) and stores the result in `ai_interactions`.

---

## Error format

```json
{ "error": "message", "details": { } }
```
