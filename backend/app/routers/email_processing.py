from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, UserToken, ExtractionSession, FieldTemplate
from app.auth.dependencies import get_current_user
from app.services.email_processor import process_emails

router = APIRouter()


@router.post("/process/{session_id}")
async def trigger_email_processing(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger email processing for a specific extraction session."""
    # Verify session exists and belongs to user
    session_result = await db.execute(
        select(ExtractionSession).where(
            ExtractionSession.id == session_id,
            ExtractionSession.user_id == current_user.id,
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get Gmail token
    token_result = await db.execute(
        select(UserToken).where(
            UserToken.user_id == current_user.id,
            UserToken.provider == "gmail",
        )
    )
    token = token_result.scalar_one_or_none()
    if not token:
        raise HTTPException(
            status_code=400,
            detail="Gmail is not connected. Please connect your Gmail account first.",
        )

    # Get field template
    template_result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == session.fields_template_id
        )
    )
    template = template_result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Field template not found")

    # Process emails
    try:
        processed_count = await process_emails(
            access_token=token.access_token,
            refresh_token=token.refresh_token,
            template_fields=template.fields,
            db=db,
            session_id=session.id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email processing failed: {str(e)}",
        )

    # Update session metadata
    from datetime import datetime

    session.total_processed = (session.total_processed or 0) + processed_count
    session.last_processed_at = datetime.utcnow()
    await db.commit()

    return {
        "message": f"Successfully processed {processed_count} document(s)",
        "processed": processed_count,
        "total_processed": session.total_processed,
    }


@router.get("/status")
async def email_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if Gmail is connected and ready for email processing."""
    token_result = await db.execute(
        select(UserToken).where(
            UserToken.user_id == current_user.id,
            UserToken.provider == "gmail",
        )
    )
    token = token_result.scalar_one_or_none()

    return {
        "gmail_connected": token is not None,
        "email": token.email_address if token else None,
    }
