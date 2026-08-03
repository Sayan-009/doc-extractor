from pydantic import BaseModel
from typing import Any, Optional, Union, List, Dict
from datetime import datetime

class FieldTemplateCreate(BaseModel):
    name: str
    fields: Union[List[Any], Dict[str, Any]]

class FieldTemplateUpdate(BaseModel):
    name: Optional[str] = None
    fields: Optional[Union[List[Any], Dict[str, Any]]] = None

class FieldTemplateResponse(BaseModel):
    id: int
    user_id: int
    name: str
    fields: Union[List[Any], Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
