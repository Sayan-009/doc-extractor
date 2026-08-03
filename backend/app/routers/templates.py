from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import User, FieldTemplate
from app.schemas.template import FieldTemplateCreate, FieldTemplateUpdate, FieldTemplateResponse
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[FieldTemplateResponse])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all field templates for the current user."""
    result = await db.execute(
        select(FieldTemplate)
        .where(FieldTemplate.user_id == current_user.id)
        .order_by(FieldTemplate.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{template_id}", response_model=FieldTemplateResponse)
async def get_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific field template by ID."""
    result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == template_id,
            FieldTemplate.user_id == current_user.id,
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template


@router.post("/", response_model=FieldTemplateResponse, status_code=201)
async def create_template(
    data: FieldTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new field template."""
    template = FieldTemplate(
        user_id=current_user.id,
        name=data.name,
        fields=data.fields,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.put("/{template_id}", response_model=FieldTemplateResponse)
async def update_template(
    template_id: int,
    data: FieldTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing field template (ownership verified)."""
    result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == template_id,
            FieldTemplate.user_id == current_user.id,
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if data.name is not None:
        template.name = data.name
    if data.fields is not None:
        template.fields = data.fields

    await db.commit()
    await db.refresh(template)
    return template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a field template (ownership verified)."""
    result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == template_id,
            FieldTemplate.user_id == current_user.id,
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted successfully"}
