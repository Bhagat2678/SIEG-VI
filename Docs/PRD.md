# Product Requirements Document (PRD) — MediKiosk+

## 1. Problem Statement

India's tertiary government hospitals see 4,000–10,000 OPD patients/day with average consultation times of 2–5 minutes. Within this window physicians must elicit history, examine, review prior records, diagnose, counsel, and prescribe — leading to under-elicited history, missed comorbidities, and repeated questioning across visits. AYUSH (Ayurvedic) settings face an additional burden: Dashavidha Pariksha history-taking is far more extensive than allopathic intake and is effectively impossible to complete manually within OPD time limits.

Patient records are also fragmented — physical prescriptions, lab reports, and discharge summaries from multiple providers, unstructured and often handwritten, must be manually reviewed during the already-short consultation.

## 2. Goal

Give every patient a way to independently complete a comprehensive clinical history — by voice or touch — and digitize their existing paper records, **before** they enter the consultation room, producing a structured, physician-ready summary linked to their ABHA record.

## 3. Users & Roles

| Role | Needs | Access |
|---|---|---|
| **Patient** | Fast, low-effort way to give history in own language; confidence data is private and secure | Own session only; voice/touch/WhatsApp/IVR interface |
| **Doctor/Clinician** | Complete, accurate, structured history in seconds; ability to edit before saving | Read/edit structured summaries for their patients only |
| **Hospital Admin/Front Desk** | Manage patient queue, kiosk status, link ABHA IDs | Operational dashboard, no clinical detail beyond what's needed for triage |
| **Hospital Management** | Aggregate metrics — OPD load, average time saved, OCR/ASR success rate | Anonymized/aggregate analytics only, no individual PII by default |
| **AYUSH Practitioner** | Extended Dashavidha Pariksha / Prakriti-Vikriti capture | Same as Doctor, plus constitution module |

## 4. Success Criteria (MVP)

- Patient can complete a voice-guided history for one chief complaint (e.g., fever) end-to-end, producing a structured JSON output.
- Patient can upload one sample prescription/report image and receive extracted diagnosis/drug/lab data.
- Both outputs converge into a single structured schema (see `WORKFLOW.md`).
- A doctor-facing screen displays the structured summary and allows edit/confirm.
- No claim is made that MediKiosk+ replaces clinical judgment — every summary is explicitly a draft.

## 5. Functional Requirements

### 5.1 Must-Have (MVP)
- FR1: Voice input in at least Hindi + English; text-to-speech question prompts.
- FR2: Adaptive follow-up questioning for at least one complaint category using a SOCRATES-style framework.
- FR3: Touch-based alternative for every voice question (dual-mode input).
- FR4: OCR extraction from a printed/typed prescription or lab report image.
- FR5: Structured entity extraction (drug name, dosage, diagnosis, lab value + reference range) from OCR text.
- FR6: A single structured history schema that both voice and OCR pipelines write into.
- FR7: A doctor-facing summary screen, editable before save.
- FR8: Basic session data clearing after submission.

### 5.2 Should-Have (Phase 2)
- FR9: ABHA ID creation/verification via ABDM sandbox (M1).
- FR10: FHIR bundle push of structured history to ABDM sandbox (HIP role).
- FR11: Role-based views for Doctor / Admin / Management with JWT-based access control.
- FR12: Field-level encryption of PII at rest; HTTPS in transit.
- FR13: Red-flag/emergency symptom detection with priority alert.

### 5.3 Could-Have (Phase 3)
- FR14: Ayurvedic constitution (Prakriti/Vikriti) questionnaire and scoring module.
- FR15: WhatsApp/IVR fallback channel for feature-phone users.
- FR16: Abnormal lab value / drug-interaction flagging.
- FR17: Chronological document timeline view.

### 5.4 Won't-Have (this phase)
- Autonomous diagnosis or treatment recommendation.
- Full HIU-side consent-based record retrieval from other providers.
- Production-grade handwriting OCR across all Indian scripts.

## 6. Non-Functional Requirements

- **Accessibility**: usable by a first-time, low-literacy patient with zero training (icon-driven UI, audio prompts).
- **Privacy**: aligned with the Digital Personal Data Protection Act 2023 and ABDM consent framework — this PRD does not claim full legal compliance, which requires separate legal review.
- **Latency**: voice question round-trip and OCR extraction should feel responsive enough for kiosk use (target: single-digit seconds per step for demo purposes).
- **Language coverage**: MVP targets Hindi + English; architecture should not hard-code language assumptions so more can be added later.

## 7. Open Questions / Risks

- ABDM sandbox registration/approval lead time — start this immediately, it's the biggest schedule risk.
- Handwriting OCR accuracy is a known hard problem — MVP should scope demo documents accordingly rather than overpromise.
- Legal/compliance sign-off for DPDP Act alignment is out of scope for a hackathon build and should be flagged as future work, not claimed as done.
