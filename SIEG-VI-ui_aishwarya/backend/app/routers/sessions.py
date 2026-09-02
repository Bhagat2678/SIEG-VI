import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models.history import SessionRecord, DocumentRecord
from app.schemas.history import (
    SessionCreateRequest,
    SessionResponse,
    StructuredHistorySchema,
    VoiceHistoryUpdateRequest,
    HistoryPartialUpdateRequest,
    StatusUpdateRequest,
    DocumentUploadResponse,
    DoctorSummaryResponse,
    SessionStatus,
    ConsentInfo,
    HPI,
    DrugAllergyHistory,
    PersonalHistory,
    MedicationItem,
    PriorInvestigation,
)
from app.services.ocr import ocr_service
from app.services.entity_extraction import entity_extraction_service
from app.services.summary import summary_service

router = APIRouter(prefix="/sessions", tags=["Sessions & History"])


def _load_history_schema(record: SessionRecord) -> StructuredHistorySchema:
    """Helper to convert SessionRecord history_data into validated StructuredHistorySchema"""
    data = dict(record.history_data or {})
    data["session_id"] = record.id
    data["patient_id"] = record.patient_id
    data["language"] = record.language
    data["status"] = record.status
    data["created_at"] = record.created_at
    data["updated_at"] = record.updated_at
    return StructuredHistorySchema(**data)


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED, summary="Create a new session / history draft")
def create_session(request: SessionCreateRequest, db: Session = Depends(get_db)):
    """
    Initializes a new patient intake session with an empty structured history schema in 'draft' status.
    Accepts an optional ABHA patient_id; if omitted, generates a unique session-scoped ID.
    """
    session_id = str(uuid.uuid4())
    patient_id = request.patient_id or f"PAT-{uuid.uuid4().hex[:8].upper()}"

    initial_schema = StructuredHistorySchema(
        session_id=session_id,
        patient_id=patient_id,
        language=request.language,
        chief_complaint=request.chief_complaint,
        consent=request.consent if request.consent else ConsentInfo(),
        status=SessionStatus.DRAFT,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db_session = SessionRecord(
        id=session_id,
        patient_id=patient_id,
        language=request.language,
        status=SessionStatus.DRAFT.value,
        history_data=initial_schema.model_dump(mode="json"),
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return SessionResponse(
        session_id=db_session.id,
        patient_id=db_session.patient_id,
        language=db_session.language,
        status=SessionStatus(db_session.status),
        history=_load_history_schema(db_session),
        created_at=db_session.created_at,
        updated_at=db_session.updated_at,
    )


@router.get("/{session_id}", response_model=SessionResponse, summary="Fetch structured history for a session")
def get_session(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves the current state of the structured clinical history schema for the given session ID.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    return SessionResponse(
        session_id=record.id,
        patient_id=record.patient_id,
        language=record.language,
        status=SessionStatus(record.status),
        history=_load_history_schema(record),
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.patch("/{session_id}", response_model=SessionResponse, summary="Partial update to history fields")
def patch_session_history(
    session_id: str,
    update_data: HistoryPartialUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    General partial update to write or amend fields in the shared structured schema.
    Used by doctor screen or general update workflows.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    current_history = _load_history_schema(record)
    history_dict = current_history.model_dump(mode="json")

    # Update provided non-null fields
    update_dict = update_data.model_dump(exclude_unset=True, mode="json")
    for key, val in update_dict.items():
        if val is not None:
            history_dict[key] = val

    history_dict["updated_at"] = datetime.utcnow().isoformat()
    record.history_data = history_dict
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    return SessionResponse(
        session_id=record.id,
        patient_id=record.patient_id,
        language=record.language,
        status=SessionStatus(record.status),
        history=_load_history_schema(record),
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.post("/{session_id}/voice-history", response_model=SessionResponse, summary="Module A Voice write contract endpoint")
def update_voice_history(
    session_id: str,
    payload: VoiceHistoryUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Contract endpoint for Module A (Voice Engine).
    Accepts structured fields elicited during voice dialogue (chief_complaint, SOCRATES HPI,
    review_of_systems, red_flags, verbal past history) and safely merges them into the shared schema.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    current_history = _load_history_schema(record)

    # Merge Voice Track fields
    if payload.chief_complaint:
        current_history.chief_complaint = payload.chief_complaint

    if payload.hpi:
        current_hpi_dict = current_history.hpi.model_dump(exclude_unset=True)
        new_hpi_dict = payload.hpi.model_dump(exclude_unset=True)
        current_hpi_dict.update(new_hpi_dict)
        current_history.hpi = HPI(**current_hpi_dict)

    if payload.review_of_systems:
        current_history.review_of_systems.update(payload.review_of_systems)

    if payload.red_flags:
        for rf in payload.red_flags:
            if rf not in current_history.red_flags:
                current_history.red_flags.append(rf)

    if payload.past_medical_surgical_history:
        for item in payload.past_medical_surgical_history:
            if item not in current_history.past_medical_surgical_history:
                current_history.past_medical_surgical_history.append(item)

    if payload.family_history:
        for fh in payload.family_history:
            if fh not in current_history.family_history:
                current_history.family_history.append(fh)

    if payload.personal_history:
        if payload.personal_history.diet:
            current_history.personal_history.diet = payload.personal_history.diet
        if payload.personal_history.habits:
            for habit in payload.personal_history.habits:
                if habit not in current_history.personal_history.habits:
                    current_history.personal_history.habits.append(habit)

    current_history.updated_at = datetime.utcnow()
    record.history_data = current_history.model_dump(mode="json")
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    return SessionResponse(
        session_id=record.id,
        patient_id=record.patient_id,
        language=record.language,
        status=SessionStatus(record.status),
        history=_load_history_schema(record),
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.patch("/{session_id}/status", response_model=SessionResponse, summary="Transition session status")
def update_session_status(
    session_id: str,
    status_update: StatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Moves session through the clinical lifecycle:
    'draft' -> 'physician_reviewed' -> 'submitted_to_abdm'.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    target_status = status_update.status

    # Validate transition
    valid_transitions = {
        SessionStatus.DRAFT: [SessionStatus.PHYSICIAN_REVIEWED],
        SessionStatus.PHYSICIAN_REVIEWED: [SessionStatus.SUBMITTED_TO_ABDM, SessionStatus.DRAFT],
        SessionStatus.SUBMITTED_TO_ABDM: [],
    }

    current_enum = SessionStatus(record.status)
    if target_status not in valid_transitions.get(current_enum, []) and target_status != current_enum:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{current_enum.value}' to '{target_status.value}'",
        )

    record.status = target_status.value
    history_dict = dict(record.history_data or {})
    history_dict["status"] = target_status.value
    history_dict["updated_at"] = datetime.utcnow().isoformat()
    record.history_data = history_dict
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    return SessionResponse(
        session_id=record.id,
        patient_id=record.patient_id,
        language=record.language,
        status=SessionStatus(record.status),
        history=_load_history_schema(record),
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.post("/{session_id}/documents", response_model=DocumentUploadResponse, summary="Upload prescription/report for OCR & entity extraction")
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Module B pipeline endpoint:
    1. Saves uploaded prescription or lab report image.
    2. Runs PaddleOCR (CPU mobile model) to extract raw text & line confidence scores.
    3. Runs clinical entity extraction to parse medications, dosages, lab tests, and past history.
    4. Merges extracted entities into the session's shared JSON schema with source='ocr'.
    5. Flags low confidence documents for clinician manual review.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    doc_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "doc.png")[1]
    saved_filename = f"{session_id}_{doc_id}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    # Read bytes and save to disk
    file_bytes = await file.read()
    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    # Step 7: Run OCR on saved document
    ocr_result = ocr_service.extract_text(saved_path)

    # Step 8: Run Entity Extraction
    extracted = entity_extraction_service.extract(
        raw_text=ocr_result.raw_text,
        ocr_confidence=ocr_result.average_confidence,
    )

    # Save document record
    doc_record = DocumentRecord(
        id=doc_id,
        session_id=session_id,
        filename=file.filename or saved_filename,
        file_path=saved_path,
        file_size=len(file_bytes),
        raw_text=ocr_result.raw_text,
        ocr_confidence=ocr_result.average_confidence,
        low_confidence=ocr_result.low_confidence or extracted.low_confidence,
        extracted_entities=extracted.model_dump(mode="json"),
    )
    db.add(doc_record)

    # Step 9: Merge into Session's Structured History Schema
    current_history = _load_history_schema(record)

    # Merge extracted medications (preventing exact duplicates)
    for med in extracted.medications:
        if not any(
            existing.drug.lower() == med.drug.lower() and existing.dosage == med.dosage
            for existing in current_history.drug_allergy_history.current_medications
        ):
            current_history.drug_allergy_history.current_medications.append(med)

    # Merge extracted lab investigations
    for inv in extracted.investigations:
        if not any(
            existing.test.lower() == inv.test.lower() and existing.date == inv.date
            for existing in current_history.prior_investigations
        ):
            current_history.prior_investigations.append(inv)

    # Merge extracted diagnoses to past medical history
    for diag in extracted.past_diagnoses:
        if diag not in current_history.past_medical_surgical_history:
            current_history.past_medical_surgical_history.append(diag)

    current_history.updated_at = datetime.utcnow()
    record.history_data = current_history.model_dump(mode="json")
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)

    msg = "Document digitized and entities merged into structured history successfully."
    if extracted.review_needed:
        msg = f"Document digitized with low confidence ({ocr_result.average_confidence:.2f}). Marked for clinician review."

    return DocumentUploadResponse(
        document_id=doc_id,
        session_id=session_id,
        filename=file.filename or saved_filename,
        ocr_confidence=ocr_result.average_confidence,
        low_confidence=ocr_result.low_confidence or extracted.low_confidence,
        review_needed=extracted.review_needed,
        raw_text=ocr_result.raw_text,
        extracted_medications=extracted.medications,
        extracted_investigations=extracted.investigations,
        extracted_diagnoses=extracted.past_diagnoses,
        message=msg,
    )


@router.get("/{session_id}/summary", response_model=DoctorSummaryResponse, summary="Fetch doctor-facing clinical summary (Module C)")
def get_session_summary(session_id: str, db: Session = Depends(get_db)):
    """
    Returns the full synthesized clinical summary formatted in standard clinical order:
    Chief Complaint -> HPI (SOCRATES) -> Past Medical/Surgical -> Medications & Allergies ->
    Family History -> Personal History -> ROS -> Prior Investigations -> Red Flags.
    Includes structured JSON plus formatted physician Markdown ready for UI display.
    """
    record = db.query(SessionRecord).filter(SessionRecord.id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")

    history = _load_history_schema(record)

    # Check if any uploaded documents have low confidence
    has_low_conf_docs = (
        db.query(DocumentRecord)
        .filter(DocumentRecord.session_id == session_id, DocumentRecord.low_confidence == True)
        .count()
        > 0
    )

    summary = summary_service.generate_doctor_summary(
        history=history,
        low_confidence_documents_present=has_low_conf_docs,
    )
    return summary
