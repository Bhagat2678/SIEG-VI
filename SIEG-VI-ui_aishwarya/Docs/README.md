# AyurLife — AI Clinical History & ABDM Integration Platform

> An AI kiosk (with WhatsApp/IVR fallback) that talks to patients in their own language, listens like a doctor, reads their old prescriptions with OCR, and hands the physician a ready-made structured clinical history — linked to the patient's ABHA record via ABDM.

## The Problem

Indian government hospital OPDs run on **2–5 minutes per patient**. In that window a doctor must take history, examine, review old records, diagnose, counsel, and prescribe. Most of that time is eaten by basic questions and paperwork the patient could have answered *before* walking in.

## The Solution (one line)

AyurLife turns the wait-time before a consultation into a structured, AI-guided history-taking session — via voice, touch, or WhatsApp/IVR — and hands the doctor a clean, editable summary the moment the patient sits down.

## MVP Scope (what we're building first)

We are **not** building the full platform for the hackathon/first milestone. We are building one working slice end-to-end:

1. **Speech-to-text history capture** — patient speaks a chief complaint, AI asks SOCRATES-style follow-ups, output is a structured JSON history.
2. **OCR prescription/report reader** — patient uploads a prescription or lab report image, AI extracts diagnoses, drugs, dosages, and lab values into the same structured schema.

Everything else — ABHA/ABDM push, role-based views, constitution (Prakriti) analysis, and encryption hardening — is layered on top of this MVP once the schema and pipeline are stable. See `TASKS.md` for build order and `MODULES.md` for full module scope.

## Repo Structure (proposed)

```
ayurlife/
├── backend/            # FastAPI/Node API, schema, DB models
├── frontend/           # React kiosk UI (touch + voice)
├── stt/                # Speech-to-text integration (Bhashini/Whisper)
├── ocr/                # OCR + medical entity extraction
├── abdm/                # ABDM sandbox integration (later phase)
├── docs/                # This documentation set
└── README.md
```

## Core Documents in This Set

| File | Purpose |
|---|---|
| `PRD.md` | What we're building and why — requirements, users, success criteria |
| `MODULES.md` | Breakdown of each functional module and its scope |
| `TECH_STACK.md` | Concrete tools/APIs for each layer |
| `DATABASE_SCHEMA.md` | PostgreSQL relational + JSONB schema, tables, and column specifications |
| `VOICE_WRITE_CONTRACT.md` | Module A (Voice Engine) write payload and endpoint contract |
| `WORKFLOW.md` | Data flow and system architecture |
| `WALKTHROUGH.md` | Step-by-step patient and staff journey |
| `TASKS.md` | Build order, sprint breakdown, MVP-first sequencing |

## Quick Start (once code exists)

```bash
# backend
cd backend && pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload

# frontend
cd frontend && npm install && npm run dev
```

## Current Status

🔨 **Pre-build / documentation phase.** MVP target: voice history capture + OCR prescription reader, working end-to-end on 1–2 sample flows (e.g., fever complaint + one sample prescription).

## Non-Goals (for now)

- No autonomous diagnosis — every AI-generated summary is a **draft** the physician must review/edit/confirm.
- No full HIU-side record retrieval from ABDM in the MVP (HIP-side push only).
- No production-grade handwriting OCR guarantee — MVP uses reasonably legible sample documents.
