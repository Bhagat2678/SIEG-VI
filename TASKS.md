# Tasks & Build Order — MediKiosk+

Order matters here — the shared schema is the foundation everything else depends on, and MVP (OCR + STT) comes before ABHA/RBAC/constitution/encryption hardening.

## Phase 0 — Foundation (do first, before any module code)

- [ ] Define and lock the shared structured history JSON schema (see `WORKFLOW.md` §2)
- [ ] Set up repo structure, backend skeleton (FastAPI/Node), Postgres with a `jsonb` history column
- [ ] Register on ABDM Sandbox (sandbox.abdm.gov.in) **immediately** — approval lead time is the biggest schedule risk, don't wait until Phase 3
- [ ] Set up `.env`/secrets handling, gitignore secrets

## Phase 1 — MVP: Voice History + OCR (build this first, as agreed)

### Voice/STT track
- [ ] Integrate STT (Whisper first; swap to Bhashini if time allows)
- [ ] Build a minimal clinical-question script for ONE chief complaint (e.g., fever) using SOCRATES framework
- [ ] Wire LLM dialogue manager to ask follow-ups and write answers into the shared schema
- [ ] Add TTS for reading questions/summary back
- [ ] Add tap-based alternative for every voice question (dual-mode input)
- [ ] Build simple confirmation step ("is this correct?") before finalizing

### OCR track
- [ ] Integrate OCR (Google Vision API for printed text)
- [ ] Build LLM-based entity extraction prompt (JSON schema output) for drug name/dosage/frequency and lab values
- [ ] Wire extracted entities into the same shared schema
- [ ] Add a low-confidence flag path (don't silently guess bad OCR reads)
- [ ] Test against 2–3 sample prescription/report images

### Convergence
- [ ] Confirm both pipelines write cleanly into the same schema without conflicts
- [ ] Build Module C (thin version): merge voice + OCR output into one physician-readable summary view
- [ ] Build a basic doctor-facing screen showing the summary, with edit/confirm

**MVP demo-ready checkpoint**: one voice-driven fever history + one OCR-scanned prescription → merged structured summary → doctor screen with edit/confirm. This is the thin end-to-end slice.

## Phase 2 — ABHA/ABDM, RBAC, Encryption

- [ ] ABHA creation/verification flow (ABDM Sandbox M1)
- [ ] Consent capture flow (audio-explained, granular, revocable)
- [ ] FHIR bundle construction from the shared schema
- [ ] Push structured history to ABDM sandbox (HIP role, M2/M3 as time allows)
- [ ] JWT auth with `role` claim (patient / doctor / admin / management)
- [ ] Role-gated API response filtering (single API layer, not separate backends)
- [ ] Admin dashboard: queue status, ABHA linking status (no clinical detail)
- [ ] Management dashboard: aggregate/anonymized metrics only
- [ ] Field-level encryption for PII (name, ABHA ID, raw transcripts, raw OCR text)
- [ ] HTTPS enforced everywhere
- [ ] Session/temp data clearing on submission (verify this actually happens, don't just claim it)
- [ ] Red-flag/emergency symptom detection + priority alert path

## Phase 3 — Constitution Analysis & Reach Multipliers

- [ ] Design Dashavidha Pariksha questionnaire (structured, weighted, not ML-based)
- [ ] Build deterministic Vata/Pitta/Kapha scoring function
- [ ] LLM-generated natural-language summary from computed scores (not from raw answers)
- [ ] Append constitution result into shared schema
- [ ] WhatsApp Business API / Twilio IVR fallback channel (reuses Module A's dialogue engine, different I/O adapter)
- [ ] Abnormal lab value / drug-interaction flagging
- [ ] Chronological multi-document timeline view

## Phase 4 — Polish (if time allows)

- [ ] Multi-language expansion beyond Hindi/English
- [ ] Bilingual output refinement (patient audio vs physician text)
- [ ] Accessibility pass (icon sizing, audio clarity, low-literacy usability testing)
- [ ] Demo script + pitch deck alignment with `PRD.md` success criteria

## Cross-Cutting Reminders

- Every AI-generated summary is a **draft** — never remove the physician edit/confirm step, even under demo time pressure.
- Don't overpromise handwriting OCR — scope demo documents to what the pipeline can realistically read.
- Encryption and session-clearing should be built in from Phase 1, not bolted on at the end — it's cheaper early.
