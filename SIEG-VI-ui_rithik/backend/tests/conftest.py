import io
import os

os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
try:
    import paddle
    paddle.set_flags({"FLAGS_use_mkldnn": 0})
except Exception:
    pass

import pytest
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database tables exist for tests"""
    init_db()
    yield


@pytest.fixture
def client():
    """FastAPI TestClient"""
    return TestClient(app)


@pytest.fixture
def sample_prescription_image() -> bytes:
    """
    Generates a synthetic clear printed prescription image in memory for testing OCR.
    """
    img = Image.new("RGB", (600, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    text_lines = [
        "AIIMS New Delhi - Outpatient Department",
        "Date: 15/08/2026",
        "Patient: Ramesh Kumar, Age: 45 / Male",
        "Diagnosis: Type 2 Diabetes Mellitus with Hypertension",
        "Rx:",
        "1. Tab Metformin 500mg - 1-0-1 (after meals)",
        "2. Tab Telmisartan 40mg - 1-0-0 (morning)",
        "3. Tab Paracetamol 650mg - SOS for fever",
        "4. Tab Pantoprazole 40mg - 1-0-0 (empty stomach)",
    ]

    y_pos = 30
    for line in text_lines:
        draw.text((30, y_pos), line, fill=(0, 0, 0))
        y_pos += 35

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sample_lab_report_image() -> bytes:
    """
    Generates a synthetic printed lab report image in memory.
    """
    img = Image.new("RGB", (600, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    text_lines = [
        "LAL PATH LABS - DIAGNOSTIC REPORT",
        "Date: 20/08/2026",
        "Hemoglobin: 10.5 g/dL (Ref: 13.0 - 17.0) LOW",
        "Fasting Blood Sugar: 168 mg/dL (Ref: 70 - 100) HIGH",
        "HbA1c: 8.2 % (Ref: 4.0 - 5.6) ABNORMAL",
        "Serum Creatinine: 1.1 mg/dL (Ref: 0.7 - 1.3)",
    ]

    y_pos = 30
    for line in text_lines:
        draw.text((30, y_pos), line, fill=(0, 0, 0))
        y_pos += 45

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
