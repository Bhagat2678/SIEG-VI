# Module A (Voice Engine) ↔ Backend Write Contract

**Version:** 1.0 (MVP Locked)  
**Target:** Teammate / Service owning Module A (Voice/Touch History Engine)

---

## 1. Overview
During or at the conclusion of the patient's conversational voice interview, the Module A service POSTs the elicited clinical history fields directly to the MediKiosk+ backend.

The backend merges these fields into the session's shared JSON schema without overwriting any OCR-digitized records (e.g. uploaded prescriptions or lab reports).

---

## 2. API Endpoint

### `POST /sessions/{session_id}/voice-history`

- **Method:** `POST`
- **Path:** `/sessions/{session_id}/voice-history`
- **Content-Type:** `application/json`

---

## 3. Request Payload Format

```json
{
  "chief_complaint": "High grade fever for 2 days",
  "hpi": {
    "onset": "2 days ago, sudden",
    "site": "Generalized body fever",
    "character": "Continuous, high grade",
    "radiation": "None",
    "associated_symptoms": [
      "Chills",
      "Headache",
      "Body ache"
    ],
    "timing": "Worse in the evening",
    "exacerbating_relieving_factors": "Mild relief after paracetamol tablet",
    "severity": "Severe / 8 out of 10"
  },
  "review_of_systems": {
    "respiratory": "Mild dry cough, no breathlessness",
    "gastrointestinal": "No nausea, vomiting or abdominal pain",
    "cardiovascular": "No chest pain or palpitations"
  },
  "red_flags": [],
  "past_medical_surgical_history": [
    "Type 2 Diabetes Mellitus diagnosed 3 years ago"
  ],
  "family_history": [
    "Mother had hypertension"
  ],
  "personal_history": {
    "diet": "Vegetarian",
    "habits": [
      "Non-smoker",
      "No alcohol"
    ]
  }
}
```

### Field Definitions & Nullability
| Field | Type | Description | Mandatory? |
|---|---|---|---|
| `chief_complaint` | `string` | Patient's primary complaint in standard clinical terms | Optional |
| `hpi.onset` | `string` | When the condition began | Optional |
| `hpi.site` | `string` | Anatomical location | Optional |
| `hpi.character` | `string` | Pain/symptom character (throbbing, burning, etc.) | Optional |
| `hpi.radiation` | `string` | Radiation path (e.g., 'to left arm') | Optional |
| `hpi.associated_symptoms` | `array[string]` | Co-occurring symptoms | Optional (default: `[]`) |
| `hpi.timing` | `string` | Diurnal pattern / periodicity | Optional |
| `hpi.exacerbating_relieving_factors` | `string` | Aggravating or alleviating factors | Optional |
| `hpi.severity` | `string` | Severity rating or descriptive level | Optional |
| `review_of_systems` | `object` | Key-value pairs of system findings (`{"system": "finding"}`) | Optional |
| `red_flags` | `array[string]` | Emergency symptoms detected (e.g., chest pain, syncope) | Optional |
| `past_medical_surgical_history` | `array[string]` | Conditions mentioned during voice intake | Optional |
| `family_history` | `array[string]` | Hereditary or familial conditions | Optional |
| `personal_history` | `object` | Diet and personal habits | Optional |

---

## 4. Response Format (`200 OK`)

Returns the updated `SessionResponse` containing the full merged `StructuredHistorySchema`.

```json
{
  "session_id": "018f...-uuid",
  "patient_id": "ABHA-1234-5678",
  "language": "hi",
  "status": "draft",
  "history": {
    "patient_id": "ABHA-1234-5678",
    "session_id": "018f...-uuid",
    "language": "hi",
    "chief_complaint": "High grade fever for 2 days",
    "hpi": { ... },
    "past_medical_surgical_history": [ ... ],
    "drug_allergy_history": {
      "current_medications": [ ... ],
      "allergies": []
    },
    "family_history": [ ... ],
    "personal_history": { ... },
    "review_of_systems": { ... },
    "prior_investigations": [ ... ],
    "red_flags": [],
    "consent": {
      "granted": true,
      "scope": ["history_collection", "ocr_digitization", "doctor_review"],
      "timestamp": "2026-08-30T10:00:00Z"
    },
    "status": "draft",
    "created_at": "2026-08-30T10:00:00Z",
    "updated_at": "2026-08-30T10:01:30Z"
  },
  "created_at": "2026-08-30T10:00:00Z",
  "updated_at": "2026-08-30T10:01:30Z"
}
```
