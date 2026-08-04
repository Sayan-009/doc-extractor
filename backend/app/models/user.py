from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from passlib.context import CryptContext
from sqlalchemy.orm import relationship
from .base import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    is_google_user = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    templates = relationship("FieldTemplate", back_populates="user")
    tokens = relationship("UserToken", back_populates="user")
    sessions = relationship("ExtractionSession", back_populates="user")

    def verify_password(self, plain_password: str) -> bool:
        if not self.password_hash:
            return False
        # Truncate to 71 chars to prevent bcrypt 72-byte limit errors
        return pwd_context.verify(plain_password[:71], self.password_hash)

    def hash_password(self, plain_password: str):
        # Truncate to 71 chars to prevent bcrypt 72-byte limit errors
        self.password_hash = pwd_context.hash(plain_password[:71])
