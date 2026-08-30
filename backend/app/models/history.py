import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db import Base

# Universal JSON type that automatically uses JSONB on Postgres
JsonType = JSON().with_variant(JSONB, "postgresql")


class SessionRecord(Base):
    """
    Core Session database record holding metadata and the complete JSONB structured history.
    """
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    patient_id = Column(String(100), nullable=False, index=True)
    language = Column(String(10), default="hi", nullable=False)
    status = Column(String(50), default="draft", nullable=False, index=True)
    
    # Complete structured history payload in JSONB
    history_data = Column(JsonType, nullable=False, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    documents = relationship(
        "DocumentRecord",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="DocumentRecord.created_at.desc()",
    )


class DocumentRecord(Base):
    """
    Stores digitized medical documents, OCR output, confidence metrics, and extracted entities.
    """
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    
    raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=0.0, nullable=False)
    low_confidence = Column(Boolean, default=False, nullable=False)
    extracted_entities = Column(JsonType, nullable=True, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    session = relationship("SessionRecord", back_populates="documents")
