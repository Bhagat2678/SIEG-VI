import pytest
from app.services.ocr import ocr_service
from app.services.entity_extraction import entity_extraction_service


def test_ocr_service_extraction(sample_prescription_image):
    ocr_result = ocr_service.extract_text(sample_prescription_image)
    assert ocr_result is not None
    assert len(ocr_result.raw_text) > 0
    assert ocr_result.average_confidence >= 0.0
    # Verify key words from image are in raw_text
    lower_text = ocr_result.raw_text.lower()
    assert "paracetamol" in lower_text or "metformin" in lower_text or "telmisartan" in lower_text


def test_entity_extraction_deterministic():
    sample_text = """
    AIIMS Outpatient Clinic
    Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension
    Rx:
    Tab Metformin 500mg 1-0-1
    Tab Telmisartan 40mg 1-0-0
    Tab Paracetamol 650mg SOS
    Tab Pantoprazole 40mg OD
    """
    extracted = entity_extraction_service.extract(raw_text=sample_text, ocr_confidence=0.88)
    assert extracted is not None
    assert len(extracted.medications) >= 3

    drugs = [m.drug.lower() for m in extracted.medications]
    assert "metformin" in drugs
    assert "paracetamol" in drugs
    assert "telmisartan" in drugs

    # Check dosages
    metformin = next(m for m in extracted.medications if m.drug.lower() == "metformin")
    assert "500" in (metformin.dosage or "")

    # Check diagnoses
    assert any("diabetes" in d.lower() for d in extracted.past_diagnoses)
    assert any("hypertension" in d.lower() for d in extracted.past_diagnoses)


def test_lab_report_entity_extraction():
    lab_text = """
    LAL PATH LABS
    Date: 20/08/2026
    Hemoglobin: 10.5 g/dL (Ref: 13.0 - 17.0) LOW
    Fasting Blood Sugar: 168 mg/dL (Ref: 70 - 100) HIGH
    HbA1c: 8.2 % (Ref: 4.0 - 5.6) ABNORMAL
    Serum Creatinine: 1.1 mg/dL (Ref: 0.7 - 1.3)
    """
    extracted = entity_extraction_service.extract(raw_text=lab_text, ocr_confidence=0.92)
    assert len(extracted.investigations) >= 3

    tests = [inv.test for inv in extracted.investigations]
    assert "Hemoglobin" in tests
    assert "Fasting Blood Sugar" in tests
    assert "HbA1c" in tests

    fbs = next(inv for inv in extracted.investigations if inv.test == "Fasting Blood Sugar")
    assert fbs.abnormal is True


def test_document_upload_endpoint(client, sample_prescription_image):
    # Create session
    create_res = client.post("/sessions", json={"language": "en"})
    session_id = create_res.json()["session_id"]

    # Upload prescription image
    files = {"file": ("rx.png", sample_prescription_image, "image/png")}
    upload_res = client.post(f"/sessions/{session_id}/documents", files=files)
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert data["document_id"] is not None
    assert data["session_id"] == session_id
    assert len(data["extracted_medications"]) > 0

    # Verify session structured history has been updated with OCR data
    get_res = client.get(f"/sessions/{session_id}")
    history = get_res.json()["history"]
    meds = history["drug_allergy_history"]["current_medications"]
    assert len(meds) > 0
    assert all(m["source"] == "ocr" for m in meds)
