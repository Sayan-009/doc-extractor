from sqlalchemy import Column, DateTime, Integer, String, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class ExtractedRow(Base):
    __tablename__ = "extracted_rows"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("extraction_sessions.id"), nullable=False)
    source_filename = Column(String, nullable=True)
    source_type = Column(String, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("ExtractionSession", back_populates="extracted_rows")
