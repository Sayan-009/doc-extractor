from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import io

from app.database import get_db
from app.models import User, ExtractionSession, ExtractedRow
from app.auth.dependencies import get_current_user
from app.services.export_service import generate_csv_from_rows

router = APIRouter()


@router.get("/sessions/{session_id}/data")
async def get_session_data(
    session_id: int,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated extracted data rows for a session."""
    # Verify session ownership
    session_result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get total count
    count_result = await db.execute(
        select(func.count(ExtractedRow.id)).where(
            ExtractedRow.session_id == session_id
        )
    )
    total = count_result.scalar()

    # Get paginated rows
    offset = (page - 1) * per_page
    rows_result = await db.execute(
        select(ExtractedRow)
        .where(ExtractedRow.session_id == session_id)
        .order_by(ExtractedRow.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    rows = rows_result.scalars().all()

    formatted_rows = []
    for row in rows:
        row_dict = {
            "id": row.id,
            "source_filename": row.source_filename,
            "source_type": row.source_type,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        if isinstance(row.data, dict):
            row_dict.update(row.data)
        formatted_rows.append(row_dict)

    return {
        "rows": formatted_rows,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if total else 0,
    }


@router.get("/sessions/{session_id}/download")
async def download_csv(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and download a CSV file from all extracted rows in a session."""
    # Verify session ownership
    session_result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get all extracted rows
    rows_result = await db.execute(
        select(ExtractedRow)
        .where(ExtractedRow.session_id == session_id)
        .order_by(ExtractedRow.created_at.asc())
    )
    rows = rows_result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="No data to export")

    # Build row dicts with metadata + extracted data
    row_dicts = []
    for row in rows:
        row_dict = {
            "source_filename": row.source_filename or "",
            "source_type": row.source_type or "",
        }
        if isinstance(row.data, dict):
            row_dict.update(row.data)
        row_dicts.append(row_dict)

    csv_content = await generate_csv_from_rows(row_dicts)

    # Stream CSV response
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{session.session_name}.csv"'
        },
    )
