# Walkthrough — MediKiosk+ (User Journeys)

## Walkthrough 1: Patient — Voice History for Fever (MVP demo path)

1. Patient approaches the kiosk, selects Hindi.
2. Screen/audio: *"Please tell me what's bothering you today, or tap an option below."*
3. Patient says: *"Mujhe do din se bukhar hai"* (I've had fever for 2 days).
4. AI transcribes, recognizes "fever" as chief complaint, and asks SOCRATES-style follow-ups — by voice and showing tap options simultaneously:
   - "Is the fever continuous or does it come and go?"
   - "Any other symptoms — chills, body ache, cough?"
   - "How high would you say the fever feels — mild, moderate, severe?"
5. Each answer is transcribed and written into the shared JSON schema under `hpi`.
6. AI reads back a short summary: *"You've had fever for 2 days, comes and goes, with body ache. Is that correct?"* Patient confirms by voice or tap.
7. Session `status` becomes `draft`, ready for the doctor's screen.

## Walkthrough 2: Patient — Document Scan (MVP demo path)

1. Patient is prompted: *"Do you have any old prescriptions or reports? Place them under the camera."*
2. Patient places a printed prescription under the kiosk camera.
3. OCR extracts raw text; entity extraction pulls: `Drug: Paracetamol 500mg | Frequency: 1-1-1 | For: Fever` and any lab values present.
4. Extracted data is shown back to the patient in simple terms: *"I found: Paracetamol, taken 3 times a day. Is this from your current visit or an old one?"*
5. Patient confirms/corrects via tap.
6. Data merges into the same shared schema under `drug_allergy_history` / `prior_investigations`.

## Walkthrough 3: Doctor — Reviewing the Summary

1. Doctor calls the patient in; the kiosk-generated summary is already loaded on the consultation screen (role-gated to this doctor's patient only).
2. Doctor sees: Chief Complaint → HPI → Drug History → Prior Investigations, in standard clinical format.
3. Doctor edits one field (e.g., corrects a mistranscribed duration), then clicks **Confirm**.
4. `status` moves to `physician_reviewed`. Doctor proceeds with examination and decision-making instead of re-asking basic history.

## Walkthrough 4: Admin/Front Desk

1. Admin dashboard shows kiosk queue status and which patients have completed pre-consultation intake.
2. Admin can see ABHA linking status per patient (linked / pending / not started) but **not** clinical detail.
3. Admin can flag a kiosk as offline/malfunctioning.

## Walkthrough 5: Hospital Management (Phase 2)

1. Management dashboard shows aggregate, anonymized metrics: daily OPD volume processed through kiosks, average time saved per consultation, OCR/ASR success rate, most common chief complaints.
2. No individual patient identifiers are visible in this view by default.

## Walkthrough 6: AYUSH Patient — Constitution Analysis (Phase 3)

1. After the standard history, an Ayurvedic OPD patient is offered the extended Dashavidha Pariksha questionnaire.
2. Patient answers structured questions on sleep pattern, digestion, body frame, temperament, etc. (icon/tap-driven, with audio prompts).
3. A deterministic scoring function computes Vata/Pitta/Kapha proportions.
4. LLM generates a natural-language Prakriti/Vikriti summary from the computed scores (not from raw answers directly) — kept explainable and auditable.
5. Result is appended to the shared schema as `constitution_analysis` and shown to the Ayurvedic practitioner alongside the standard history.

## Walkthrough 7: Emergency / Red-Flag Path

1. During voice history, patient mentions "chest pain" + "difficulty breathing."
2. AI's red-flag detector matches this combination against a predefined emergency symptom list.
3. Instead of continuing the routine queue flow, the system immediately alerts triage staff with the flagged symptoms.
4. Patient is not left waiting in the standard queue — this bypass is a hard requirement, not a "nice to have."
