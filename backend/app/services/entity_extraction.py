import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.config import settings
from app.schemas.history import MedicationItem, PriorInvestigation

logger = logging.getLogger("medikiosk.extraction")


class ExtractedMedicalEntities(BaseModel):
    medications: List[MedicationItem] = Field(default_factory=list)
    investigations: List[PriorInvestigation] = Field(default_factory=list)
    past_diagnoses: List[str] = Field(default_factory=list)
    confidence: float = 1.0
    low_confidence: bool = False
    review_needed: bool = False
    review_reasons: List[str] = Field(default_factory=list)


# Common medical drug names and salt patterns frequently found in Indian prescriptions
COMMON_DRUGS = [
    "paracetamol", "crocin", "dolo", "calpol", "amoxicillin", "augmentin", "moxikind",
    "metformin", "glycomet", "pantoprazole", "pan", "pan-d", "pantocid", "omeprazole",
    "rabeprazole", "rabicer", "azithromycin", "azithral", "zithromax", "amlodipine",
    "stamlo", "telmisartan", "telma", "atorvastatin", "atorva", "rosuvastatin",
    "cetirizine", "cetzine", "levocetirizine", "levocet", "montelukast", "montek-lc",
    "ibuprofen", "combiflam", "diclofenac", "voveran", "aceclofenac", "zerodol",
    "ciprofloxacin", "ciro", "ofloxacin", "zenflox", "doxycycline", "dox-1",
    "losartan", "losar", "glimepiride", "amaryl", "vildagliptin", "galvus",
    "salbutamol", "asthalin", "budesonide", "foracort", "ranitidine", "rantac",
    "ondansetron", "emset", "tramadol", "ultram", "aspirin", "ecosprin"
]

# Lab test names commonly in reports
LAB_TEST_PATTERNS = [
    (r"\b(hemoglobin|hb|hgb)\b", "Hemoglobin", "12.0 - 16.0 g/dL"),
    (r"\b(fasting blood sugar|fbs|glucose fasting|fasting blood glucose)\b", "Fasting Blood Sugar", "70 - 100 mg/dL"),
    (r"\b(post prandial blood sugar|ppbs|glucose pp)\b", "Post Prandial Blood Sugar", "100 - 140 mg/dL"),
    (r"\b(random blood sugar|rbs)\b", "Random Blood Sugar", "70 - 140 mg/dL"),
    (r"\b(hba1c|glycated hemoglobin)\b", "HbA1c", "4.0 - 5.6 %"),
    (r"\b(serum creatinine|creatinine|s\. creatinine)\b", "Serum Creatinine", "0.7 - 1.3 mg/dL"),
    (r"\b(blood urea|urea)\b", "Blood Urea", "15 - 45 mg/dL"),
    (r"\b(total leukocyte count|tlc|wbc count|total wbc)\b", "Total Leukocyte Count (TLC)", "4000 - 11000 /uL"),
    (r"\b(platelet count|platelets)\b", "Platelet Count", "1.5 - 4.5 Lakhs/uL"),
    (r"\b(serum bilirubin|total bilirubin|t\. bilirubin)\b", "Serum Bilirubin Total", "0.2 - 1.2 mg/dL"),
    (r"\b(sgpt|alt)\b", "SGPT (ALT)", "10 - 40 U/L"),
    (r"\b(sgot|ast)\b", "SGOT (AST)", "10 - 40 U/L"),
    (r"\b(serum uric acid|uric acid)\b", "Serum Uric Acid", "3.5 - 7.2 mg/dL"),
    (r"\b(serum cholesterol|total cholesterol)\b", "Total Cholesterol", "125 - 200 mg/dL"),
    (r"\b(thyroid stimulating hormone|tsh)\b", "TSH", "0.4 - 4.2 uIU/mL"),
    (r"\b(esr|erythrocyte sedimentation rate)\b", "ESR", "0 - 20 mm/hr"),
]

# Common diagnosis patterns
DIAGNOSIS_PATTERNS = [
    r"(type [12] diabetes mellitus|t2dm|t1dm|diabetes)",
    r"(essential hypertension|hypertension|htn|high blood pressure)",
    r"(hypothyroidism|hyperthyroidism)",
    r"(bronchial asthma|asthma|copd)",
    r"(urinary tract infection|uti)",
    r"(gastroesophageal reflux disease|gerd|acid peptic disease|apd)",
    r"(osteoarthritis|rheumatoid arthritis)",
    r"(dengue fever|malaria|typhoid fever|viral fever)",
    r"(acute bronchitis|pneumonia)",
    r"(ischemic heart disease|ihd|cad)",
    r"(dyslipidemia|hyperlipidemia)"
]


class EntityExtractionService:
    """
    Service for extracting clinical entities (drugs, dosages, frequencies, lab investigations, diagnoses)
    from raw OCR text. Works fully offline via deterministic clinical NLP rules, with optional LLM augmentation.
    """

    def extract(self, raw_text: str, ocr_confidence: float = 1.0) -> ExtractedMedicalEntities:
        """
        Main extraction entrypoint.
        """
        if not raw_text or len(raw_text.strip()) == 0:
            return ExtractedMedicalEntities(
                confidence=0.0,
                low_confidence=True,
                review_needed=True,
                review_reasons=["Empty or illegible document text"],
            )

        # 1. First run deterministic clinical rule-based extractor
        entities = self._extract_deterministic(raw_text, ocr_confidence)

        # 2. If an LLM API key is present and configured, we can refine using LLM
        if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY:
            try:
                llm_entities = self._extract_with_llm(raw_text)
                if llm_entities:
                    return llm_entities
            except Exception as e:
                logger.warning(f"LLM entity extraction failed, falling back to rule-based: {e}")

        return entities

    def _extract_deterministic(self, raw_text: str, ocr_confidence: float) -> ExtractedMedicalEntities:
        medications: List[MedicationItem] = []
        investigations: List[PriorInvestigation] = []
        diagnoses: List[str] = []
        review_reasons: List[str] = []

        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        # --- Extract Diagnoses ---
        for line in lines:
            lower_line = line.lower()
            for diag_pat in DIAGNOSIS_PATTERNS:
                match = re.search(diag_pat, lower_line, re.IGNORECASE)
                if match:
                    matched_diag = match.group(0).title()
                    if matched_diag not in diagnoses:
                        diagnoses.append(matched_diag)

        # --- Extract Medications ---
        dosage_regex = re.compile(r"(\d+(?:\.\d+)?\s*(?:mg|gm|g|mcg|ml|iu|tabs?|caps?))", re.IGNORECASE)
        freq_regex = re.compile(
            r"(\b[012]-[012]-[012]\b|\b(?:od|bd|tds|qid|tid|hs|sos|stat|once daily|twice daily|thrice daily)\b)",
            re.IGNORECASE,
        )

        for line in lines:
            lower_line = line.lower()
            # Look for drug names
            for drug_candidate in COMMON_DRUGS:
                # Word boundary match
                pattern = rf"\b{re.escape(drug_candidate)}\b"
                if re.search(pattern, lower_line):
                    drug_name = drug_candidate.capitalize()

                    # Extract dosage
                    dosage_match = dosage_regex.search(line)
                    dosage = dosage_match.group(1).strip() if dosage_match else None

                    # Extract frequency
                    freq_match = freq_regex.search(line)
                    frequency = freq_match.group(1).strip() if freq_match else None

                    # Check if already added
                    if not any(m.drug.lower() == drug_name.lower() for m in medications):
                        medications.append(
                            MedicationItem(
                                drug=drug_name,
                                dosage=dosage,
                                frequency=frequency,
                                source="ocr",
                            )
                        )

        # --- Extract Lab Investigations ---
        value_regex = re.compile(r"[:\s\-=]\s*([<>≤≥]?\s*\d+(?:\.\d+)?(?:\s*[a-zA-Z/%/uLdL]+)?)")
        date_regex = re.compile(r"\b(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2})\b")

        doc_date = None
        for line in lines:
            d_match = date_regex.search(line)
            if d_match and not doc_date:
                doc_date = d_match.group(1)

        for line in lines:
            lower_line = line.lower()
            for test_pat, standard_name, default_range in LAB_TEST_PATTERNS:
                if re.search(test_pat, lower_line, re.IGNORECASE):
                    # Clean line by removing reference ranges before extracting observed value
                    clean_line = re.sub(r"\(.*?ref.*?\)", "", line, flags=re.IGNORECASE)
                    clean_line = re.sub(r"\(.*?normal.*?\)", "", clean_line, flags=re.IGNORECASE)
                    clean_line = re.sub(r"ref(?:erence)?\s*(?:range)?\s*:?.*", "", clean_line, flags=re.IGNORECASE)
                    
                    # Look for value right after test name or colon
                    val_matches = re.findall(r"(\d+(?:\.\d+)?(?:\s*(?:g/dL|mg/dL|%|/uL|U/L|uIU/mL|mm/hr|Lakhs/uL))?)", clean_line)
                    if not val_matches:
                        val_matches = re.findall(r"(\d+(?:\.\d+)?)", line)

                    value = val_matches[0].strip() if val_matches else "Present"
                    
                    # Detect abnormality flag
                    abnormal = None
                    if re.search(r"\b(high|low|abnormal|elevated|\*|H|L)\b", line, re.IGNORECASE):
                        abnormal = True

                    if not any(inv.test == standard_name for inv in investigations):
                        investigations.append(
                            PriorInvestigation(
                                test=standard_name,
                                value=str(value).strip(),
                                reference_range=default_range,
                                date=doc_date,
                                abnormal=abnormal,
                                source="ocr",
                            )
                        )

        # Confidence checks
        low_confidence = ocr_confidence < settings.OCR_CONFIDENCE_THRESHOLD
        if low_confidence:
            review_reasons.append(
                f"OCR confidence score ({ocr_confidence:.2f}) is below threshold ({settings.OCR_CONFIDENCE_THRESHOLD:.2f})"
            )

        if not medications and not investigations and not diagnoses:
            review_reasons.append("No standard clinical entities (drugs/labs/diagnoses) identified in document text")

        review_needed = low_confidence or len(review_reasons) > 0

        return ExtractedMedicalEntities(
            medications=medications,
            investigations=investigations,
            past_diagnoses=diagnoses,
            confidence=ocr_confidence,
            low_confidence=low_confidence,
            review_needed=review_needed,
            review_reasons=review_reasons,
        )

    def _extract_with_llm(self, raw_text: str) -> Optional[ExtractedMedicalEntities]:
        """
        Structured LLM entity extraction using prompt-based JSON output when LLM is configured.
        """
        # Structured system prompt for clinical entity extraction
        prompt = f"""
You are an expert clinical document digitizer for MediKiosk+.
Extract all medical entities from the following raw OCR prescription / lab report text.

JSON Schema format required:
{{
  "medications": [
    {{"drug": "string", "dosage": "string or null", "frequency": "string or null", "source": "ocr"}}
  ],
  "investigations": [
    {{"test": "string", "value": "string", "reference_range": "string or null", "date": "string or null", "abnormal": true/false/null, "source": "ocr"}}
  ],
  "past_diagnoses": ["string"],
  "confidence_assessment": 0.0 to 1.0,
  "review_reasons": ["string"]
}}

Raw Document OCR Text:
---
{raw_text}
---
"""
        # Call LLM client if configured (e.g. httpx / OpenAI / Gemini client)
        # Returning None falls back seamlessly to deterministic extractor
        return None


entity_extraction_service = EntityExtractionService()
