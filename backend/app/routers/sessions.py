from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import User, ExtractionSession, FieldTemplate, ExtractedRow
from app.schemas.session import (
    ExtractionSessionCreate,
    ExtractionSessionUpdate,
    ExtractionSessionResponse,
)
from app.auth.dependencies import get_current_user
from app.services.scheduler import add_session_job, remove_session_job

router = APIRouter()


@router.get("/", response_model=List[ExtractionSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all extraction sessions for the current user."""
    result = await db.execute(
        select(ExtractionSession)
        .where(ExtractionSession.user_id == current_user.id)
        .order_by(ExtractionSession.created_at.desc())
    )
    sessions = result.scalars().all()

    # Enrich with template name
    response = []
    for session in sessions:
        session_dict = ExtractionSessionResponse.model_validate(session).model_dump()

        # Fetch template name
        tmpl_result = await db.execute(
            select(FieldTemplate.name).where(
                FieldTemplate.id == session.fields_template_id
            )
        )
        template_name = tmpl_result.scalar_one_or_none()
        session_dict["template_name"] = template_name or "Unknown"
        response.append(session_dict)

    return response


@router.get("/{session_id}")
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific extraction session by ID."""
    result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session_dict = ExtractionSessionResponse.model_validate(session).model_dump()

    # Fetch template name
    tmpl_result = await db.execute(
        select(FieldTemplate.name).where(
            FieldTemplate.id == session.fields_template_id
        )
    )
    session_dict["template_name"] = tmpl_result.scalar_one_or_none() or "Unknown"

    return session_dict


@router.post("/", status_code=201)
async def create_session(
    data: ExtractionSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new extraction session."""
    # Verify template exists and belongs to user
    tmpl_result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == data.fields_template_id,
            FieldTemplate.user_id == current_user.id,
        )
    )
    template = tmpl_result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    session = ExtractionSession(
        user_id=current_user.id,
        session_name=data.session_name,
        fields_template_id=data.fields_template_id,
        auto_process=data.auto_process,
        schedule_minutes=data.schedule_minutes or 30,
        expires_at=data.expires_at,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Register background job if auto_process is enabled
    if session.auto_process and session.schedule_minutes:
        add_session_job(session.id, session.schedule_minutes)

    session_dict = ExtractionSessionResponse.model_validate(session).model_dump()
    session_dict["template_name"] = template.name
    return session_dict


@router.put("/{session_id}")
async def update_session(
    session_id: int,
    data: ExtractionSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an extraction session (ownership verified)."""
    result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if data.session_name is not None:
        session.session_name = data.session_name
    if data.auto_process is not None:
        session.auto_process = data.auto_process
    if data.schedule_minutes is not None:
        session.schedule_minutes = data.schedule_minutes
    if data.is_active is not None:
        session.is_active = data.is_active

    await db.commit()
    await db.refresh(session)

    # Update scheduler job
    if session.auto_process and session.is_active and session.schedule_minutes:
        add_session_job(session.id, session.schedule_minutes)
    else:
        remove_session_job(session.id)

    return ExtractionSessionResponse.model_validate(session)


@router.delete("/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a session and all its extracted rows."""
    result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Remove scheduler job
    remove_session_job(session.id)

    # Delete all extracted rows for this session
    rows_result = await db.execute(
        select(ExtractedRow).where(ExtractedRow.session_id == session.id)
    )
    for row in rows_result.scalars().all():
        await db.delete(row)

    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted successfully"}
