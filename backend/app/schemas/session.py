from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class ExtractionSessionCreate(BaseModel):
    session_name: str
    fields_template_id: int
    auto_process: bool = False
    schedule_minutes: Optional[int] = None
    expires_at: Optional[datetime] = None

class ExtractionSessionUpdate(BaseModel):
    session_name: Optional[str] = None
    fields_template_id: Optional[int] = None
    auto_process: Optional[bool] = None
    schedule_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class ExtractionSessionResponse(BaseModel):
    id: int
    user_id: int
    session_name: str
    fields_template_id: int
    auto_process: bool
    schedule_minutes: Optional[int]
    last_processed_at: Optional[datetime]
    next_process_at: Optional[datetime]
    expires_at: Optional[datetime]
    is_active: bool
    total_processed: int
    created_at: datetime
    template_name: Optional[str] = None

    class Config:
        from_attributes = True

class ExtractedRowResponse(BaseModel):
    id: int
    session_id: int
    source_filename: Optional[str]
    source_type: str
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
