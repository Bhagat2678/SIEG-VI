# Database Schema Specification — MediKiosk+

**Database Engine:** PostgreSQL 16 (JSONB-backed relational hybrid)  
**ORM:** SQLAlchemy 2.0  
**Migration Tool:** Alembic  

---

## 1. Relational Schema Architecture

MediKiosk+ uses a hybrid relational + JSONB schema design in PostgreSQL:
- **`sessions` Table**: Tracks patient identifiers, intake language, session lifecycle status, and stores the complete validated clinical intake schema in a `JSONB` column (`history_data`).
- **`documents` Table**: Stores metadata, physical file path, raw OCR transcribed text, average OCR confidence score, low-confidence review flag, and extracted clinical entities for each uploaded medical document (prescriptions, lab tests, discharge summaries).

```
┌─────────────────────────────────────────────────────────────┐
│                          sessions                           │
├────────────────────────────────┬────────────────────────────┤
│ id (PK)                        │ VARCHAR(36) [UUID]         │
│ patient_id                     │ VARCHAR(100) [Indexed]     │
│ language                       │ VARCHAR(10)                │
│ status                         │ VARCHAR(50) [Indexed]      │
│ history_data                   │ JSONB                      │
│ created_at                     │ TIMESTAMP WITH TIME ZONE   │
│ updated_at                     │ TIMESTAMP WITH TIME ZONE   │
└───────────────────────────────┬─────────────────────────────┘
                                │ 1
                                │
                                │ 0..* (CASCADE DELETE)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                          documents                          │
├────────────────────────────────┬────────────────────────────┤
│ id (PK)                        │ VARCHAR(36) [UUID]         │
│ session_id (FK -> sessions.id) │ VARCHAR(36) [Indexed]      │
│ filename                       │ VARCHAR(255)               │
│ file_path                      │ VARCHAR(500)               │
│ file_size                      │ INTEGER                    │
│ raw_text                       │ TEXT                       │
│ ocr_confidence                 │ FLOAT                      │
│ low_confidence                 │ BOOLEAN                    │
│ extracted_entities             │ JSONB                      │
│ created_at                     │ TIMESTAMP WITH TIME ZONE   │
└────────────────────────────────┴────────────────────────────┘
```

---

## 2. Table Specifications

### A. `sessions` Table

| Column | Type | Nullable | Index | Description |
|---|---|---|---|---|
| `id` | `VARCHAR(36)` | `NO` | Primary Key | Unique Session UUID4 |
| `patient_id` | `VARCHAR(100)` | `NO` | B-Tree | ABHA ID (e.g. `91-XXXX-XXXX-XXXX`) or temporary Kiosk identifier (`PAT-XXXXXXXX`) |
| `language` | `VARCHAR(10)` | `NO` | No | Intake language code (`hi`, `en`, `bn`, etc.) |
| `status` | `VARCHAR(50)` | `NO` | B-Tree | Session lifecycle status (`draft`, `physician_reviewed`, `submitted_to_abdm`) |
| `history_data` | `JSONB` | `NO` | No | Full structured clinical history schema payload |
| `created_at` | `TIMESTAMP WITH TIME ZONE`| `NO` | No | Session creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE`| `NO` | No | Last update timestamp |

---

### B. `documents` Table

| Column | Type | Nullable | Index | Description |
|---|---|---|---|---|
| `id` | `VARCHAR(36)` | `NO` | Primary Key | Unique Document UUID4 |
| `session_id` | `VARCHAR(36)` | `NO` | Foreign Key | References `sessions.id` with `ON DELETE CASCADE` |
| `filename` | `VARCHAR(255)` | `NO` | No | Original uploaded filename |
| `file_path` | `VARCHAR(500)` | `NO` | No | Absolute/relative storage path on disk |
| `file_size` | `INTEGER` | `YES` | No | Size of file in bytes |
| `raw_text` | `TEXT` | `YES` | No | Full raw transcribed text from PaddleOCR |
| `ocr_confidence`| `FLOAT` | `NO` | No | Mean OCR confidence score across lines (0.00 – 1.00) |
| `low_confidence`| `BOOLEAN` | `NO` | No | `TRUE` if `ocr_confidence < 0.60` or text ambiguous |
| `extracted_entities`| `JSONB` | `YES` | No | Structured parsed drugs, dosages, lab tests, and diagnoses |
| `created_at` | `TIMESTAMP WITH TIME ZONE`| `NO` | No | Document upload timestamp |

---

## 3. `history_data` JSONB Structure

The `history_data` column in the `sessions` table contains the complete locked clinical schema (`StructuredHistorySchema`):

```json
{
  "patient_id": "string",
  "session_id": "string (UUID)",
  "language": "hi | en",
  "chief_complaint": "string | null",
  "hpi": {
    "onset": "string | null",
    "site": "string | null",
    "character": "string | null",
    "radiation": "string | null",
    "associated_symptoms": ["string"],
    "timing": "string | null",
    "exacerbating_relieving_factors": "string | null",
    "severity": "string | null"
  },
  "past_medical_surgical_history": ["string"],
  "drug_allergy_history": {
    "current_medications": [
      {
        "drug": "string",
        "dosage": "string | null",
        "frequency": "string | null",
        "source": "voice | ocr | manual"
      }
    ],
    "allergies": ["string"]
  },
  "family_history": ["string"],
  "personal_history": {
    "diet": "string | null",
    "habits": ["string"]
  },
  "review_of_systems": {
    "system_name": "clinical finding"
  },
  "prior_investigations": [
    {
      "test": "string",
      "value": "string",
      "reference_range": "string | null",
      "date": "string | null",
      "abnormal": "boolean | null",
      "source": "ocr | manual | lab_feed"
    }
  ],
  "constitution_analysis": {
    "prakriti": {
      "vata": "number (0-100) | null",
      "pitta": "number (0-100) | null",
      "kapha": "number (0-100) | null"
    },
    "notes": "string | null"
  },
  "red_flags": ["string"],
  "consent": {
    "granted": true,
    "scope": ["history_collection", "ocr_digitization", "doctor_review"],
    "timestamp": "ISO 8601 string"
  },
  "status": "draft | physician_reviewed | submitted_to_abdm",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

---

## 4. Status Lifecycle Transitions

```
 ┌─────────┐      Doctor Reviews & Edits       ┌────────────────────┐
 │  draft  ├──────────────────────────────────►│ physician_reviewed │
 └─────────┘                                   └─────────┬──────────┘
                                                         │
                                                         │ ABDM Sandbox Push
                                                         ▼
                                               ┌────────────────────┐
                                               │ submitted_to_abdm  │
                                               └────────────────────┘
```
