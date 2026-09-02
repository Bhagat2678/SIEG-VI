import pytest


def test_create_session(client):
    payload = {
        "patient_id": "ABHA-9876-5432-10",
        "language": "hi",
        "chief_complaint": "Bukhar do din se (Fever for 2 days)",
        "consent": {
            "granted": True,
            "scope": ["history_collection", "ocr_digitization", "doctor_review"],
        },
    }
    response = client.post("/sessions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["session_id"] is not None
    assert data["patient_id"] == "ABHA-9876-5432-10"
    assert data["language"] == "hi"
    assert data["status"] == "draft"
    assert data["history"]["chief_complaint"] == "Bukhar do din se (Fever for 2 days)"
    assert data["history"]["consent"]["granted"] is True


def test_get_session(client):
    # Create session
    create_res = client.post("/sessions", json={"language": "en"})
    session_id = create_res.json()["session_id"]

    # Fetch session
    get_res = client.get(f"/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["session_id"] == session_id
    assert get_res.json()["status"] == "draft"


def test_voice_history_update_contract(client):
    create_res = client.post("/sessions", json={"language": "hi"})
    session_id = create_res.json()["session_id"]

    voice_payload = {
        "chief_complaint": "Severe fever and body pain",
        "hpi": {
            "onset": "2 days ago",
            "site": "Generalized",
            "character": "High grade, continuous",
            "radiation": "None",
            "associated_symptoms": ["Chills", "Headache"],
            "timing": "Worse in evening",
            "exacerbating_relieving_factors": "Mild relief with rest",
            "severity": "Moderate (6/10)",
        },
        "review_of_systems": {
            "respiratory": "No breathlessness, mild dry cough",
            "cardiovascular": "No chest pain",
        },
        "red_flags": [],
        "past_medical_surgical_history": ["Asthma since childhood"],
        "personal_history": {
            "diet": "Vegetarian",
            "habits": ["Non-smoker"],
        },
    }

    res = client.post(f"/sessions/{session_id}/voice-history", json=voice_payload)
    assert res.status_code == 200
    history = res.json()["history"]

    assert history["chief_complaint"] == "Severe fever and body pain"
    assert history["hpi"]["onset"] == "2 days ago"
    assert history["hpi"]["associated_symptoms"] == ["Chills", "Headache"]
    assert history["review_of_systems"]["respiratory"] == "No breathlessness, mild dry cough"
    assert "Asthma since childhood" in history["past_medical_surgical_history"]
    assert history["personal_history"]["diet"] == "Vegetarian"


def test_status_transitions(client):
    create_res = client.post("/sessions", json={})
    session_id = create_res.json()["session_id"]
    assert create_res.json()["status"] == "draft"

    # Move draft -> physician_reviewed
    status_res = client.patch(
        f"/sessions/{session_id}/status",
        json={"status": "physician_reviewed"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "physician_reviewed"

    # Move physician_reviewed -> submitted_to_abdm
    abdm_res = client.patch(
        f"/sessions/{session_id}/status",
        json={"status": "submitted_to_abdm"},
    )
    assert abdm_res.status_code == 200
    assert abdm_res.json()["status"] == "submitted_to_abdm"

    # Invalid transition from submitted_to_abdm
    invalid_res = client.patch(
        f"/sessions/{session_id}/status",
        json={"status": "draft"},
    )
    assert invalid_res.status_code == 400
