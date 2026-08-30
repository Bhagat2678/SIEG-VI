# Workflow & Architecture — MediKiosk+

## 1. High-Level Data Flow

```
                    ┌─────────────────────┐
                    │   Patient Interface   │
                    │  (Kiosk / WhatsApp)   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                  ▼
     ┌─────────────────┐              ┌──────────────────────┐
     │  Module A         │              │  Module B              │
     │  Voice/Touch       │              │  OCR + Doc              │
     │  History Engine     │              │  Digitization           │
     └────────┬──────────┘              └──────────┬───────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                   ▼
                       ┌────────────────────────┐
                       │  Shared Structured        │
                       │  History JSON Schema       │
                       └───────────┬────────────┘
                                   ▼
                       ┌────────────────────────┐
                       │  Module C                  │
                       │  Summary Generator          │
                       └───────────┬────────────┘
                        ┌──────────┴──────────┐
                        ▼                        ▼
              ┌──────────────────┐   ┌────────────────────┐
              │  Doctor's Screen    │   │  Module D              │
              │  (Module E: RBAC)    │   │  ABDM / ABHA Push        │
              └──────────────────┘   └────────────────────┘
```

Module G (encryption) and consent/session-clearing wrap around every step, not shown as a separate box.

## 2. Shared Structured History Schema (build this first)

This is the single most important early artifact. Both the voice pipeline and the OCR pipeline write into it; the summary generator, the doctor's screen, and the ABDM FHIR push all read from it.

```json
{
  "patient_id": "string (ABHA ID or session ID)",
  "session_id": "string",
  "language": "string",
  "chief_complaint": "string",
  "hpi": {
    "onset": "string",
    "site": "string",
    "character": "string",
    "radiation": "string",
    "associated_symptoms": ["string"],
    "timing": "string",
    "exacerbating_relieving_factors": "string",
    "severity": "string"
  },
  "past_medical_surgical_history": ["string"],
  "drug_allergy_history": {
    "current_medications": [
      {"drug": "string", "dosage": "string", "frequency": "string", "source": "voice|ocr"}
    ],
    "allergies": ["string"]
  },
  "family_history": ["string"],
  "personal_history": {
    "diet": "string",
    "habits": ["string"]
  },
  "review_of_systems": {"system_name": "finding"},
  "prior_investigations": [
    {"test": "string", "value": "string", "reference_range": "string", "date": "string", "abnormal": "boolean", "source": "ocr"}
  ],
  "constitution_analysis": {
    "prakriti": {"vata": "number", "pitta": "number", "kapha": "number"},
    "notes": "string"
  },
  "red_flags": ["string"],
  "consent": {
    "granted": "boolean",
    "scope": ["string"],
    "timestamp": "string"
  },
  "status": "draft|physician_reviewed|submitted_to_abdm",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 3. End-to-End Sequence (MVP scope in bold)

1. **Identify** — patient enters/scans ABHA ID or registers as new; selects language.
2. **Converse (bold = MVP)** — AI runs adaptive voice+touch interview for chief complaint → HPI → ROS; red flags trigger a priority alert.
3. **Scan (bold = MVP)** — patient uploads prior documents; OCR + entity extraction populates past history / drug / investigation fields.
4. **Summarize** — Module C merges both sources into the shared schema and produces the physician-facing summary + patient-facing audio confirmation.
5. **Route (Phase 2)** — ABHA link + FHIR push to ABDM sandbox; HIS record updated.
6. **Consult** — doctor's screen (role-gated) shows the structured summary; doctor edits/confirms; only then does status move to `physician_reviewed`.

## 4. Security & Consent Touchpoints

- Consent captured (audio-explained) at Step 1, before any data collection begins.
- PII fields encrypted at rest from the first MVP commit, not deferred to Phase 2 — this is cheap to build in early and expensive to retrofit.
- Session/temp data cleared once `status` reaches `submitted_to_abdm` (or immediately after doctor review if ABDM push isn't built yet).
- Role-gated read access enforced at the API layer (Module E) — never trust the frontend to hide fields.

## 5. Failure / Fallback Behavior

- If OCR confidence is low → flag the document for manual review rather than silently guessing values.
- If ASR fails to understand a response → fall back to touch/tap options for that question rather than looping indefinitely.
- If ABDM sandbox is unreachable → save structured history locally with `status: draft` and retry/queue the push — never block the patient's flow on ABDM availability.
