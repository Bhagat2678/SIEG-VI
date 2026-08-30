# Tech Stack — MediKiosk+

## Principle

MVP-first: pick the fastest-to-integrate option for each layer, note the "ideal/India-specific" alternative, and swap in later if time allows.

| Layer | MVP Choice | Ideal / Later Alternative | Notes |
|---|---|---|---|
| **Speech-to-text** | Whisper API (fast to integrate) | AI4Bharat / Bhashini ASR | Bhashini gives the "built for India" story but has more integration friction — use Whisper if Bhashini blocks progress |
| **Text-to-speech** | Any standard TTS API | Bhashini TTS / Coqui TTS | Needed to read questions/summary back in local language |
| **Conversation brain / dialogue manager** | LLM (Claude/GPT) with a strict clinical-question script + JSON output mode | Same, with a formal clinical ontology constraint layer | Keep the LLM scoped — don't let it free-range diagnose |
| **OCR** | Google Vision API (printed text) | + fine-tuned handwriting model | Handwriting OCR is genuinely hard — scope demo docs accordingly |
| **Medical entity extraction** | LLM prompt-based extraction (structured JSON output) | Fine-tuned medical NER model | Prompt-based is faster to build and good enough for MVP demo |
| **Backend** | FastAPI (Python) or Node.js + Express | Same, hardened | FastAPI pairs well if OCR/ASR glue code is Python |
| **Database** | PostgreSQL | Same, with encryption-at-rest config | Structured JSON schema can live in a `jsonb` column initially |
| **Frontend (kiosk)** | React + large touch targets + audio prompts | Same, with full accessibility audit | Dual-mode (voice + tap) from day one |
| **ABDM integration** | ABDM Sandbox APIs (sandbox.abdm.gov.in) | Production ABDM once certified | Register early — approval lead time is a schedule risk |
| **Auth / RBAC** | JWT with `role` claim | Same + proper session management | Single API, role-gated responses — don't build 3 backends |
| **Encryption** | Field-level encryption for PII (e.g., using a library like `cryptography` in Python) + HTTPS | Full at-rest DB encryption + key management (KMS) | Session-clear-on-submit should be in MVP, not deferred |
| **Fallback channel (Phase 3)** | Twilio IVR / WhatsApp Business API | Same, scaled | Reuses Module A's dialogue engine with a different I/O adapter |

## Why these choices

- **Whisper over Bhashini for MVP**: faster integration under time pressure; swap to Bhashini once the pipeline works end-to-end, since Bhashini is the stronger "built for India" narrative for judges/stakeholders.
- **Prompt-based entity extraction over fine-tuned NER**: no training data or training time available for a first build; a well-structured extraction prompt with JSON schema output is good enough to demonstrate the concept.
- **Deterministic constitution scoring (Module F) instead of an ML model**: explainable, fast to build, and defensible when asked "how did it decide this?"
- **Single API + role-gated responses instead of separate backends per role (Module E)**: dramatically less code to maintain for an MVP while still demonstrating the RBAC concept convincingly.

## Environment / Package Notes

- Python packages: install with `pip install <package> --break-system-packages` in this environment.
- Keep secrets (API keys, ABDM sandbox credentials) out of the repo — use environment variables / `.env` (gitignored).
