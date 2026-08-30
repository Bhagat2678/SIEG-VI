# Modules — MediKiosk+

Each module below lists scope, MVP vs later-phase status, and its interface with the shared structured history schema.

---

## Module A — Conversational Multimodal History Engine
**Status: MVP (core)**

Conducts a structured clinical interview through voice and touch.

- Patient speaks a chief complaint; AI asks intelligent follow-ups (SOCRATES: Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, Severity).
- Every question is answerable by voice OR tap — dual-mode input for varying literacy/comfort.
- Dialogue is constrained by a clinical-history ontology so the LLM doesn't wander off-script.
- **Output**: writes chief complaint, HPI, and review-of-systems fields into the shared JSON schema.

## Module B — Medical Document Digitization & Intelligence
**Status: MVP (core)**

OCR + entity extraction pipeline for prior prescriptions, lab reports, discharge summaries.

- OCR (printed first, handwriting as stretch goal) converts image → raw text.
- Medical entity extraction pulls: diagnoses, drug names + dosages + frequency, investigation values + reference ranges, procedure/surgery history.
- Chronological ordering of multiple documents by date.
- Abnormal-value highlighting (out-of-range labs, potential interactions) — Phase 2.
- **Output**: writes past medical/surgical history and prior investigations into the shared JSON schema.

## Module C — Structured History Summary Generator
**Status: MVP (core, thin) → Phase 2 (full)**

Synthesizes Module A + Module B output into one physician-ready summary.

- Standard format: Chief Complaint → HPI → Past Medical/Surgical → Drug & Allergy → Family → Personal → ROS → Prior Investigations.
- Editable/verifiable — physician can accept, amend, or reject. **Never presented as an autonomous diagnosis.**
- Bilingual output: patient-facing audio confirmation in local language, physician-facing text in English/Hindi.

## Module D — Consent, Privacy & ABDM Integration
**Status: Phase 2**

- ABHA ID authentication and creation via ABDM Sandbox (M1).
- Granular, revocable, audio-explained consent flow for low-literacy patients.
- FHIR bundle push of structured history to ABDM (HIP role) — Sandbox M2/M3 as time allows.
- Session data cleared immediately after submission.

## Module E — Role-Based Access & Views
**Status: Phase 2**

- Patient view: own session only, voice/touch kiosk interface.
- Doctor view: structured summary for their patients, edit/confirm capability.
- Admin/front-desk view: queue management, ABHA linking, kiosk status — no deep clinical detail.
- Management view: aggregate/anonymized analytics only.
- Implementation approach: single API layer + JWT `role` claim, role-gated response filtering rather than separate backends.

## Module F — Ayurvedic Constitution Analysis (Dashavidha Pariksha)
**Status: Phase 3**

- Structured, weighted questionnaire (not an ML model) covering Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya.
- Deterministic scoring function maps answers → Vata/Pitta/Kapha proportions.
- LLM used only to generate the natural-language summary from the computed scores — not to do the scoring itself, to keep it explainable and defensible.
- Feeds into the same shared JSON schema as an additional section.

## Module G — Security & Encryption
**Status: Cross-cutting, hardened in Phase 2**

- Encryption at rest for PII fields (name, ABHA ID, raw OCR text, raw audio transcripts).
- HTTPS in transit everywhere.
- Session/temp data cleared post-submission (built into MVP from the start, not bolted on).
- DPDP Act 2023 / ABDM consent-framework alignment as a stated design principle — full legal compliance review is out of scope for the hackathon build.

## Module H — Fallback Channels (WhatsApp / IVR)
**Status: Phase 3 (reach multiplier)**

- Missed-call or WhatsApp voice-note based interview for patients without kiosk/touchscreen access.
- Reuses Module A's dialogue engine with a different I/O adapter (Twilio/WhatsApp Business API instead of kiosk mic).

---

## Shared Data Contract

All modules read/write a single structured history JSON schema (see `WORKFLOW.md` §2 for the schema shape). This is the most important early design decision — build this first, before any module.
