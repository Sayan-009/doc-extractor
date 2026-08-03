from sqlalchemy import Column, DateTime, Integer, String, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class FieldTemplate(Base):
    __tablename__ = "field_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    fields = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="templates")
    sessions = relationship("ExtractionSession", back_populates="template")
