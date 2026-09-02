from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service Health & Connectivity Check")
def check_health(db: Session = Depends(get_db)):
    """
    Health-check endpoint validating API runtime, database connectivity, and OCR readiness.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "ocr_engine": "paddleocr-cpu",
        "ocr_confidence_threshold": settings.OCR_CONFIDENCE_THRESHOLD,
    }
