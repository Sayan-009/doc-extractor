from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class ExtractionSession(Base):
    __tablename__ = "extraction_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_name = Column(String, nullable=False)
    fields_template_id = Column(Integer, ForeignKey("field_templates.id"), nullable=False)
    auto_process = Column(Boolean, default=False)
    schedule_minutes = Column(Integer, nullable=True)
    last_processed_at = Column(DateTime(timezone=True), nullable=True)
    next_process_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    total_processed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")
    template = relationship("FieldTemplate", back_populates="sessions")
    extracted_rows = relationship("ExtractedRow", back_populates="session")
