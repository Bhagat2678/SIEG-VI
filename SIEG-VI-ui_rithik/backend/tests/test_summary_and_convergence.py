import pytest


def test_voice_and_ocr_convergence(client, sample_prescription_image, sample_lab_report_image):
    """
    Step 11 & Step 13 Checkpoint:
    Simulates complete end-to-end patient journey:
    1. Create Session
    2. Voice Track intake (chief complaint, HPI, ROS)
    3. Document Track intake 1: Prescription OCR (drugs, dosages, past conditions)
    4. Document Track intake 2: Lab Report OCR (investigations, values, abnormal flags)
    5. Verify clean convergence in shared schema without overwriting
    6. Fetch Doctor Summary (Module C)
    7. Doctor Confirms & Updates status to physician_reviewed
    """
    # 1. Create Session
    create_res = client.post(
        "/sessions",
        json={
            "patient_id": "ABHA-1122-3344-55",
            "language": "hi",
            "consent": {"granted": True},
        },
    )
    assert create_res.status_code == 201
    session_id = create_res.json()["session_id"]

    # 2. Voice Track Intake
    voice_payload = {
        "chief_complaint": "Acute onset high fever with severe headache",
        "hpi": {
            "onset": "2 days ago",
            "site": "Head & whole body",
            "character": "Throbbing, high grade",
            "radiation": "None",
            "associated_symptoms": ["Chills", "Myalgia", "Nausea"],
            "timing": "Continuous",
            "exacerbating_relieving_factors": "Worse on exertion",
            "severity": "7/10",
        },
        "review_of_systems": {
            "respiratory": "No cough, no breathlessness",
            "neurological": "Frontal headache, no photophobia",
        },
        "red_flags": [],
        "personal_history": {
            "diet": "Vegetarian",
            "habits": ["Non-smoker"],
        },
    }
    voice_res = client.post(f"/sessions/{session_id}/voice-history", json=voice_payload)
    assert voice_res.status_code == 200

    # 3. Document Track 1: Upload Prescription Image
    files1 = {"file": ("prescription.png", sample_prescription_image, "image/png")}
    doc1_res = client.post(f"/sessions/{session_id}/documents", files=files1)
    assert doc1_res.status_code == 200

    # 4. Document Track 2: Upload Lab Report Image
    files2 = {"file": ("lab_report.png", sample_lab_report_image, "image/png")}
    doc2_res = client.post(f"/sessions/{session_id}/documents", files=files2)
    assert doc2_res.status_code == 200

    # 5. Verify Convergence in Shared Schema
    session_res = client.get(f"/sessions/{session_id}")
    assert session_res.status_code == 200
    h = session_res.json()["history"]

    # Voice fields intact
    assert h["chief_complaint"] == "Acute onset high fever with severe headache"
    assert h["hpi"]["onset"] == "2 days ago"
    assert "Nausea" in h["hpi"]["associated_symptoms"]
    assert h["review_of_systems"]["respiratory"] == "No cough, no breathlessness"

    # OCR prescription fields intact
    meds = h["drug_allergy_history"]["current_medications"]
    assert len(meds) > 0
    assert any(m["drug"].lower() == "paracetamol" for m in meds)
    assert any(m["drug"].lower() == "metformin" for m in meds)

    # OCR lab report fields intact
    invs = h["prior_investigations"]
    assert len(invs) > 0
    assert any(inv["test"] == "Hemoglobin" for inv in invs)
    assert any(inv["test"] == "Fasting Blood Sugar" for inv in invs)

    # 6. Doctor Summary Read Endpoint (Module C)
    summary_res = client.get(f"/sessions/{session_id}/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()

    assert summary["session_id"] == session_id
    assert summary["patient_id"] == "ABHA-1122-3344-55"
    assert "structured_summary" in summary
    assert "clinical_markdown" in summary
    assert "# Clinical Intake Summary" in summary["clinical_markdown"]
    assert "Chief Complaint" in summary["clinical_markdown"]
    assert "SOCRATES" in summary["clinical_markdown"] or "History of Present Illness" in summary["clinical_markdown"]
    assert "Prior Investigations" in summary["clinical_markdown"]

    # 7. Doctor Review & Confirm
    status_res = client.patch(
        f"/sessions/{session_id}/status",
        json={"status": "physician_reviewed"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "physician_reviewed"


def test_emergency_red_flag_alert(client):
    create_res = client.post("/sessions", json={"language": "en"})
    session_id = create_res.json()["session_id"]

    # Patient reports chest pain & shortness of breath
    voice_payload = {
        "chief_complaint": "Severe acute crushing chest pain radiating to left arm",
        "hpi": {
            "onset": "30 minutes ago",
            "associated_symptoms": ["difficulty breathing", "sweating"],
            "severity": "10/10",
        },
        "red_flags": ["Severe crushing chest pain"],
    }
    client.post(f"/sessions/{session_id}/voice-history", json=voice_payload)

    summary_res = client.get(f"/sessions/{session_id}/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()

    assert summary["has_emergency_alert"] is True
    assert len(summary["red_flags"]) > 0
    assert "PRIORITY RED FLAGS DETECTED" in summary["clinical_markdown"]
