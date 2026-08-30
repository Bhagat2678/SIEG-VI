from datetime import datetime
from typing import Any, Dict, List, Optional
from app.schemas.history import StructuredHistorySchema, DoctorSummaryResponse, SessionStatus

# Red flag keyword triggers for priority emergency alert
RED_FLAG_TRIGGERS = [
    "chest pain", "difficulty breathing", "shortness of breath", "dyspnea",
    "loss of consciousness", "syncope", "unresponsive", "severe abdominal pain",
    "coughing blood", "hemoptysis", "slurred speech", "facial drooping",
    "unilateral weakness", "seizure", "convulsions", "high grade fever with stiff neck"
]


class SummaryService:
    """
    Module C: Synthesizes voice intake (Module A) and OCR document data (Module B)
    into a standardized clinical summary for physician review.
    """

    def generate_doctor_summary(
        self,
        history: StructuredHistorySchema,
        low_confidence_documents_present: bool = False,
    ) -> DoctorSummaryResponse:
        """
        Generates the standard clinical ordered summary and clinician-ready Markdown view.
        """
        red_flags_detected = list(history.red_flags)

        # Detect emergency red flags in chief complaint & HPI if not already flagged
        text_corpus = f"{history.chief_complaint or ''} {history.hpi.character or ''} {' '.join(history.hpi.associated_symptoms)}".lower()
        for trigger in RED_FLAG_TRIGGERS:
            if trigger in text_corpus and trigger not in [rf.lower() for rf in red_flags_detected]:
                red_flags_detected.append(f"Emergency Alert: Mentioned '{trigger}' during intake")

        has_emergency = len(red_flags_detected) > 0

        # Structured sections in standard clinical order
        structured_summary = {
            "chief_complaint": history.chief_complaint or "Not provided",
            "hpi": history.hpi.model_dump(),
            "past_medical_surgical_history": history.past_medical_surgical_history,
            "drug_allergy_history": history.drug_allergy_history.model_dump(),
            "family_history": history.family_history,
            "personal_history": history.personal_history.model_dump(),
            "review_of_systems": history.review_of_systems,
            "prior_investigations": [inv.model_dump() for inv in history.prior_investigations],
            "red_flags": red_flags_detected,
            "constitution_analysis": history.constitution_analysis.model_dump() if history.constitution_analysis else None,
            "consent": history.consent.model_dump(),
        }

        # Render physician Markdown
        clinical_md = self._render_clinical_markdown(history, red_flags_detected, low_confidence_documents_present)

        return DoctorSummaryResponse(
            session_id=history.session_id,
            patient_id=history.patient_id,
            language=history.language,
            status=history.status,
            red_flags=red_flags_detected,
            has_emergency_alert=has_emergency,
            low_confidence_documents_present=low_confidence_documents_present,
            structured_summary=structured_summary,
            clinical_markdown=clinical_md,
            created_at=history.created_at,
            updated_at=history.updated_at,
        )

    def _render_clinical_markdown(
        self,
        h: StructuredHistorySchema,
        red_flags: List[str],
        low_confidence_docs: bool,
    ) -> str:
        md_lines: List[str] = []

        md_lines.append(f"# Clinical Intake Summary (Session: `{h.session_id}`)")
        md_lines.append(f"**Patient ID / ABHA:** `{h.patient_id}` | **Language:** `{h.language.upper()}` | **Status:** `{h.status.value.upper()}`\n")

        # Red flags warning banner
        if red_flags:
            md_lines.append("> ⚠️ **PRIORITY RED FLAGS DETECTED**:")
            for rf in red_flags:
                md_lines.append(f"> - {rf}")
            md_lines.append("")

        # Low confidence OCR warning banner
        if low_confidence_docs:
            md_lines.append("> ⚠️ **NOTE**: One or more uploaded records had low OCR confidence. Please verify physical document.\n")

        # 1. Chief Complaint
        md_lines.append("## 1. Chief Complaint")
        md_lines.append(f"**{h.chief_complaint or 'None recorded'}**\n")

        # 2. History of Present Illness (SOCRATES)
        md_lines.append("## 2. History of Present Illness (HPI)")
        hpi_items = []
        if h.hpi.onset:
            hpi_items.append(f"- **Onset**: {h.hpi.onset}")
        if h.hpi.site:
            hpi_items.append(f"- **Site**: {h.hpi.site}")
        if h.hpi.character:
            hpi_items.append(f"- **Character**: {h.hpi.character}")
        if h.hpi.radiation:
            hpi_items.append(f"- **Radiation**: {h.hpi.radiation}")
        if h.hpi.associated_symptoms:
            hpi_items.append(f"- **Associated Symptoms**: {', '.join(h.hpi.associated_symptoms)}")
        if h.hpi.timing:
            hpi_items.append(f"- **Timing / Pattern**: {h.hpi.timing}")
        if h.hpi.exacerbating_relieving_factors:
            hpi_items.append(f"- **Exacerbating / Relieving**: {h.hpi.exacerbating_relieving_factors}")
        if h.hpi.severity:
            hpi_items.append(f"- **Severity**: {h.hpi.severity}")

        if hpi_items:
            md_lines.extend(hpi_items)
        else:
            md_lines.append("*No specific HPI details documented.*")
        md_lines.append("")

        # 3. Past Medical & Surgical History
        md_lines.append("## 3. Past Medical & Surgical History")
        if h.past_medical_surgical_history:
            for item in h.past_medical_surgical_history:
                md_lines.append(f"- {item}")
        else:
            md_lines.append("*No significant past history recorded.*")
        md_lines.append("")

        # 4. Drug & Allergy History
        md_lines.append("## 4. Current Medications & Allergies")
        if h.drug_allergy_history.allergies:
            md_lines.append(f"**Known Allergies**: ⚠️ {', '.join(h.drug_allergy_history.allergies)}")
        else:
            md_lines.append("**Known Allergies**: *NKDA (No Known Drug Allergies)*")

        if h.drug_allergy_history.current_medications:
            md_lines.append("\n| Drug Name | Dosage | Frequency | Source |")
            md_lines.append("|---|---|---|---|")
            for med in h.drug_allergy_history.current_medications:
                md_lines.append(f"| {med.drug} | {med.dosage or '-'} | {med.frequency or '-'} | `{med.source}` |")
        else:
            md_lines.append("\n*No active medications recorded.*")
        md_lines.append("")

        # 5. Family History
        md_lines.append("## 5. Family History")
        if h.family_history:
            for fh in h.family_history:
                md_lines.append(f"- {fh}")
        else:
            md_lines.append("*Non-contributory / none stated.*")
        md_lines.append("")

        # 6. Personal History
        md_lines.append("## 6. Personal History")
        md_lines.append(f"- **Diet**: {h.personal_history.diet or 'Not specified'}")
        if h.personal_history.habits:
            md_lines.append(f"- **Habits**: {', '.join(h.personal_history.habits)}")
        else:
            md_lines.append("- **Habits**: None reported")
        md_lines.append("")

        # 7. Review of Systems (ROS)
        md_lines.append("## 7. Review of Systems (ROS)")
        if h.review_of_systems:
            for sys_name, finding in h.review_of_systems.items():
                md_lines.append(f"- **{sys_name.replace('_', ' ').title()}**: {finding}")
        else:
            md_lines.append("*System review negative / non-elicited.*")
        md_lines.append("")

        # 8. Prior Investigations
        md_lines.append("## 8. Prior Investigations & Lab Reports")
        if h.prior_investigations:
            md_lines.append("| Test Name | Value | Reference Range | Date | Flag | Source |")
            md_lines.append("|---|---|---|---|---|---|")
            for inv in h.prior_investigations:
                flag = "🔴 **ABNORMAL**" if inv.abnormal else "Normal"
                md_lines.append(f"| {inv.test} | {inv.value} | {inv.reference_range or '-'} | {inv.date or '-'} | {flag} | `{inv.source}` |")
        else:
            md_lines.append("*No previous laboratory or diagnostic reports uploaded.*")
        md_lines.append("")

        # 9. AYUSH Constitution (if available)
        if h.constitution_analysis and h.constitution_analysis.prakriti:
            p = h.constitution_analysis.prakriti
            md_lines.append("## 9. AYUSH Constitution Analysis (Prakriti)")
            md_lines.append(f"- **Vata**: {p.vata}% | **Pitta**: {p.pitta}% | **Kapha**: {p.kapha}%")
            if h.constitution_analysis.notes:
                md_lines.append(f"- **Notes**: {h.constitution_analysis.notes}")
            md_lines.append("")

        md_lines.append("---")
        md_lines.append("*Note: This AI-generated intake summary is a clinical draft intended for physician review and confirmation.*")

        return "\n".join(md_lines)


summary_service = SummaryService()
