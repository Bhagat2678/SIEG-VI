from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field


class SessionStatus(str, Enum):
    DRAFT = "draft"
    PHYSICIAN_REVIEWED = "physician_reviewed"
    SUBMITTED_TO_ABDM = "submitted_to_abdm"


class DataSource(str, Enum):
    VOICE = "voice"
    OCR = "ocr"
    MANUAL = "manual"
    LAB_FEED = "lab_feed"


class HPI(BaseModel):
    """History of Present Illness (SOCRATES framework)"""
    onset: Optional[str] = Field(default=None, description="When the symptom started (e.g., '2 days ago', 'sudden')")
    site: Optional[str] = Field(default=None, description="Location of symptom (e.g., 'forehead', 'epigastrium')")
    character: Optional[str] = Field(default=None, description="Nature of symptom (e.g., 'throbbing', 'burning', 'continuous')")
    radiation: Optional[str] = Field(default=None, description="Where it spreads (e.g., 'none', 'left arm')")
    associated_symptoms: List[str] = Field(default_factory=list, description="Other symptoms (e.g., ['chills', 'body ache'])")
    timing: Optional[str] = Field(default=None, description="Pattern over time (e.g., 'worse in evening', 'intermittent')")
    exacerbating_relieving_factors: Optional[str] = Field(default=None, description="Factors making it better or worse")
    severity: Optional[str] = Field(default=None, description="Severity assessment (e.g., 'mild', 'moderate', 'severe', '7/10')")


class MedicationItem(BaseModel):
    """Single medication entity extracted from voice or prescription OCR"""
    drug: str = Field(..., description="Medication or salt name (e.g., 'Paracetamol')")
    dosage: Optional[str] = Field(default=None, description="Strength / dose (e.g., '500mg')")
    frequency: Optional[str] = Field(default=None, description="Dosing schedule (e.g., '1-1-1', 'twice daily', 'TDS')")
    source: Optional[str] = Field(default="ocr", description="Data source: 'voice' | 'ocr' | 'manual'")


class DrugAllergyHistory(BaseModel):
    """Current medications and known adverse drug reactions/allergies"""
    current_medications: List[MedicationItem] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list, description="Known drug, food, or environmental allergies")


class PersonalHistory(BaseModel):
    """Patient personal habits and lifestyle"""
    diet: Optional[str] = Field(default=None, description="Diet type (e.g., 'vegetarian', 'non-vegetarian')")
    habits: List[str] = Field(default_factory=list, description="Habits (e.g., ['smoking: non-smoker', 'alcohol: none'])")


class PriorInvestigation(BaseModel):
    """Diagnostic test result extracted from lab reports / OCR"""
    test: str = Field(..., description="Investigation name (e.g., 'Hemoglobin', 'Blood Sugar Fasting')")
    value: str = Field(..., description="Observed result value (e.g., '13.5 g/dL', '110 mg/dL')")
    reference_range: Optional[str] = Field(default=None, description="Biological reference range (e.g., '12.0 - 15.0')")
    date: Optional[str] = Field(default=None, description="Date of report if extracted (e.g., '2026-08-15')")
    abnormal: Optional[bool] = Field(default=None, description="Flag indicating if value is outside reference range")
    source: Optional[str] = Field(default="ocr", description="Data source: 'ocr' | 'manual' | 'lab_feed'")


class PrakritiScores(BaseModel):
    """Ayurvedic constitution proportion scores"""
    vata: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    pitta: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    kapha: Optional[float] = Field(default=None, ge=0.0, le=100.0)


class ConstitutionAnalysis(BaseModel):
    """AYUSH / Ayurvedic intake findings"""
    prakriti: Optional[PrakritiScores] = Field(default=None)
    notes: Optional[str] = Field(default=None)


class ConsentInfo(BaseModel):
    """Patient consent record"""
    granted: bool = Field(default=False)
    scope: List[str] = Field(default_factory=lambda: ["history_collection", "ocr_digitization", "doctor_review"])
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class StructuredHistorySchema(BaseModel):
    """
    Locked Shared Structured History JSON Schema (WORKFLOW.md §2).
    Shared across Voice Engine (Module A), OCR Pipeline (Module B), 
    Summary Generator (Module C), and Doctor's Screen.
    """
    patient_id: str = Field(..., description="Patient ABHA ID or session-generated identifier")
    session_id: str = Field(..., description="Unique session identifier UUID")
    language: str = Field(default="hi", description="Intake language code (e.g., 'hi', 'en')")
    chief_complaint: Optional[str] = Field(default=None, description="Primary reason for visit")
    hpi: HPI = Field(default_factory=HPI, description="SOCRATES HPI breakdown")
    past_medical_surgical_history: List[str] = Field(default_factory=list, description="Past conditions, surgeries, hospitalizations")
    drug_allergy_history: DrugAllergyHistory = Field(default_factory=DrugAllergyHistory)
    family_history: List[str] = Field(default_factory=list, description="Significant family medical history")
    personal_history: PersonalHistory = Field(default_factory=PersonalHistory)
    review_of_systems: Dict[str, str] = Field(default_factory=dict, description="ROS findings per system")
    prior_investigations: List[PriorInvestigation] = Field(default_factory=list, description="Extracted lab & imaging reports")
    constitution_analysis: Optional[ConstitutionAnalysis] = Field(default=None, description="AYUSH Dashavidha Pariksha")
    red_flags: List[str] = Field(default_factory=list, description="Emergency red flags detected during intake")
    consent: ConsentInfo = Field(default_factory=ConsentInfo)
    status: SessionStatus = Field(default=SessionStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# --- API Request & Response Schemas ---

class SessionCreateRequest(BaseModel):
    patient_id: Optional[str] = Field(default=None, description="Optional ABHA ID; if omitted, generated automatically")
    language: str = Field(default="hi", description="Preferred language ('hi', 'en', etc.)")
    chief_complaint: Optional[str] = Field(default=None)
    consent: Optional[ConsentInfo] = None


class VoiceHistoryUpdateRequest(BaseModel):
    """
    Module A (Voice Engine) Write Contract Payload.
    The voice engine POSTs/PATCHes these specific fields during or at the end of the voice interview.
    """
    chief_complaint: Optional[str] = Field(default=None, description="Elicited primary complaint")
    hpi: Optional[HPI] = Field(default=None, description="Structured SOCRATES HPI breakdown")
    review_of_systems: Optional[Dict[str, str]] = Field(default=None, description="System review findings (e.g. {'respiratory': 'no cough'})")
    red_flags: Optional[List[str]] = Field(default=None, description="Any red flags detected during the conversation")
    past_medical_surgical_history: Optional[List[str]] = Field(default=None, description="Conditions mentioned verbally")
    family_history: Optional[List[str]] = Field(default=None)
    personal_history: Optional[PersonalHistory] = Field(default=None)


class HistoryPartialUpdateRequest(BaseModel):
    """General partial update for history fields (used by doctor screen or general updates)"""
    chief_complaint: Optional[str] = None
    hpi: Optional[HPI] = None
    past_medical_surgical_history: Optional[List[str]] = None
    drug_allergy_history: Optional[DrugAllergyHistory] = None
    family_history: Optional[List[str]] = None
    personal_history: Optional[PersonalHistory] = None
    review_of_systems: Optional[Dict[str, str]] = None
    prior_investigations: Optional[List[PriorInvestigation]] = None
    constitution_analysis: Optional[ConstitutionAnalysis] = None
    red_flags: Optional[List[str]] = None
    consent: Optional[ConsentInfo] = None


class StatusUpdateRequest(BaseModel):
    status: SessionStatus = Field(..., description="Target status: 'draft', 'physician_reviewed', 'submitted_to_abdm'")
    physician_notes: Optional[str] = Field(default=None, description="Optional clinician review note")


class DocumentUploadResponse(BaseModel):
    document_id: str
    session_id: str
    filename: str
    ocr_confidence: float
    low_confidence: bool
    review_needed: bool
    raw_text: str
    extracted_medications: List[MedicationItem]
    extracted_investigations: List[PriorInvestigation]
    extracted_diagnoses: List[str]
    message: str


class SessionResponse(BaseModel):
    session_id: str
    patient_id: str
    language: str
    status: SessionStatus
    history: StructuredHistorySchema
    created_at: datetime
    updated_at: datetime


class DoctorSummaryResponse(BaseModel):
    """Formatted summary structured for physician review (Module C output)"""
    session_id: str
    patient_id: str
    language: str
    status: SessionStatus
    red_flags: List[str]
    has_emergency_alert: bool
    low_confidence_documents_present: bool
    structured_summary: Dict[str, Any]
    clinical_markdown: str
    created_at: datetime
    updated_at: datetime
