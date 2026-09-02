# MediKiosk+ — Backend / Database / OCR Execution Plan (MVP)

Scope: Anirudh's slice only — backend API, database, and OCR pipeline for the SIEG-VI MVP.
Stack decided: **FastAPI + PostgreSQL**, PaddleOCR (local, offline, no API key) for OCR, LLM prompt-based entity extraction.

Legend: 🤖 = agent does this autonomously · 🧑 = Anirudh's input/decision required before or during the step.

---

## Phase 0 — Foundation

### Step 1 — Repo & environment setup 🤖
- Create `backend/` directory in the repo with a standard FastAPI layout (`app/`, `app/models/`, `app/routers/`, `app/services/`, `app/schemas/`, `tests/`).
- Set up `requirements.txt` (fastapi, uvicorn, sqlalchemy, psycopg2-binary or asyncpg, pydantic, python-dotenv, alembic).
- Add `.env.example` and `.gitignore` entries for secrets.

### Step 2 — Finalize the shared JSON schema 🧑🤖
- 🤖 Agent proposes a locked version of the schema from `WORKFLOW.md` §2, converted into a Pydantic model (`app/schemas/history.py`).
- 🧑 **Anirudh reviews and confirms/edits the schema fields** — this is the single most important checkpoint since DB models, OCR output, and the voice-track teammate's output all depend on it. Flag any fields you want renamed, added, or dropped now, before Step 3.

### Step 3 — Database design 🤖 (with 🧑 checkpoint)
- 🤖 Design Postgres schema: a `patients`/`sessions` table for identifiers/metadata + a `history` table with a `jsonb` column holding the structured schema, plus `status`, `created_at`, `updated_at`.
- 🤖 Write SQLAlchemy models + Alembic migration.
- 🧑 **Confirm whether patient identity is a real ABHA ID or just a session ID for MVP** — affects whether you need a separate `patients` table now or can defer it to Phase 2.

### Step 4 — Local Postgres + connection wiring 🤖
- Docker Compose file for local Postgres (or connect to whatever instance the team already has).
- DB connection/session management in FastAPI (`app/db.py`).
- Health-check endpoint (`GET /health`) to confirm DB connectivity.

---

## Phase 1 — Backend API skeleton

### Step 5 — Core CRUD endpoints for the history record 🤖
- `POST /sessions` — create a new session/draft history record.
- `GET /sessions/{id}` — fetch current structured history.
- `PATCH /sessions/{id}` — partial update (used by both voice and OCR tracks to write into shared fields).
- `PATCH /sessions/{id}/status` — move status through `draft → physician_reviewed`.

### Step 6 — Define the write contract for the voice track 🧑🤖
- 🤖 Draft the exact request shape the voice/dialogue teammate's service will POST/PATCH with (which schema sub-fields it owns: `chief_complaint`, `hpi`, `review_of_systems`).
- 🧑 **Share this contract with whoever owns Module A (voice) and get their sign-off** — this is a coordination step outside the agent's control.

---

## Phase 2 — OCR pipeline (Module B)

### Step 7 — PaddleOCR integration 🤖
- Add `paddleocr` + `paddlepaddle` (CPU build) to `requirements.txt` — no API key, no billing account, runs fully offline/local.
- Build `app/services/ocr.py`: accepts an uploaded image, runs it through PaddleOCR's PP-OCRv5 mobile model (CPU inference), returns raw extracted text with per-line confidence scores.
- Use the classic `paddleocr` package (PP-OCR pipeline), not PaddleOCR-VL — the VL model requires a GPU and doesn't run on CPU/ARM, which isn't a fit for this MVP.
- No 🧑 input needed here beyond confirming the package installs cleanly in the dev environment — this removes the external-credentials blocker that Google Vision would have introduced.

### Step 8 — Entity extraction 🤖
- Build a structured-output LLM prompt that takes raw OCR text and returns JSON matching the schema's `drug_allergy_history` / `prior_investigations` shape (drug, dosage, frequency, test, value, reference_range, abnormal).
- Add a confidence/low-confidence flag: if extraction confidence is low or fields are ambiguous, mark the record for manual review rather than guessing.

### Step 9 — OCR upload endpoint 🤖
- `POST /sessions/{id}/documents` — accepts an image upload, runs Steps 7–8, writes results into the session's shared schema under the right fields with `"source": "ocr"`.

### Step 10 — Sample document testing 🧑🤖
- 🤖 Agent tests the pipeline against sample images and tunes the low-confidence threshold from Step 8 based on PaddleOCR's actual output quality on real samples.
- 🧑 **Provide 2–3 sample prescription/lab report images** — favor printed or clearly legible handwriting over doctor scrawl. PaddleOCR handles printed text and tabular lab reports well but is meaningfully weaker on genuine handwriting (~73% accuracy in benchmarks), so demo sample quality matters more now than it would have with Google Vision.

---

## Phase 3 — Convergence & handoff

### Step 11 — Merge check 🤖
- Verify voice-track writes and OCR-track writes land in the same schema instance without field collisions (e.g., both never write to the same key unexpectedly).

### Step 12 — Doctor-facing read endpoint 🤖
- `GET /sessions/{id}/summary` — returns the full merged structured history in the standard clinical order (Chief Complaint → HPI → Past History → Drug/Allergy → Family → Personal → ROS → Investigations) for whoever builds the doctor screen (frontend).

### Step 13 — End-to-end MVP checkpoint 🧑
- 🧑 **Run the full demo path yourself**: create a session → simulate/receive one voice history → upload one sample prescription → confirm the merged summary via `GET /sessions/{id}/summary` looks correct. This is the MVP demo-ready gate from `TASKS.md`.

---

## Deferred (Phase 2+ per TASKS.md — do not build yet)
- ABHA/ABDM integration, JWT/RBAC, field-level encryption, session-clear-on-submit automation, red-flag detection. Flag these explicitly as "not in MVP" if anyone asks during the hackathon.

---

## Summary of where your input is required
1. Confirm/edit the locked JSON schema (Step 2)
2. Decide real ABHA ID vs. session-only identity for MVP (Step 3)
3. Sign off on the voice-track write contract with your teammate (Step 6)
4. Supply sample prescription/report images for testing — favor legible ones since PaddleOCR is weaker on true handwriting (Step 10)
5. Run and validate the final end-to-end demo path (Step 13)
