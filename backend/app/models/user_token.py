from sqlalchemy import Column, DateTime, Integer, String, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    email_address = Column(String, nullable=True)
    settings = Column(JSON, nullable=True)
    token_uri = Column(String, default="oauth2.googleapis.com/token")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="tokens")
