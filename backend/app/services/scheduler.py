import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start the APScheduler background scheduler."""
    if not scheduler.running:
        scheduler.start()
        logger.info("Background scheduler started")


def stop_scheduler():
    """Shutdown the APScheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")


def add_session_job(session_id: int, interval_minutes: int):
    """Register or update a recurring email processing job for a session."""
    job_id = f"session_{session_id}"
    scheduler.add_job(
        _process_session_emails,
        trigger=IntervalTrigger(minutes=interval_minutes),
        id=job_id,
        replace_existing=True,
        kwargs={"session_id": session_id},
    )
    logger.info(f"Scheduled job '{job_id}' every {interval_minutes} minutes")


def remove_session_job(session_id: int):
    """Remove a session's scheduled job if it exists."""
    job_id = f"session_{session_id}"
    try:
        scheduler.remove_job(job_id)
        logger.info(f"Removed job '{job_id}'")
    except Exception:
        pass


async def _process_session_emails(session_id: int):
    """Background task: process emails for a specific extraction session."""
    from app.database import AsyncSessionLocal
    from app.models import ExtractionSession, UserToken, FieldTemplate
    from app.services.email_processor import process_emails
    from sqlalchemy import select
    from datetime import datetime, timedelta

    logger.info(f"Running scheduled email processing for session {session_id}")

    async with AsyncSessionLocal() as db:
        # Get active session
        result = await db.execute(
            select(ExtractionSession).where(
                ExtractionSession.id == session_id,
                ExtractionSession.is_active == True,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            logger.warning(f"Session {session_id} not found or inactive, skipping")
            return

        # Get user's Gmail token
        token_result = await db.execute(
            select(UserToken).where(
                UserToken.user_id == session.user_id,
                UserToken.provider == "gmail",
            )
        )
        token = token_result.scalar_one_or_none()
        if not token:
            logger.warning(f"No Gmail token for user {session.user_id}, skipping")
            return

        # Get field template
        template_result = await db.execute(
            select(FieldTemplate).where(
                FieldTemplate.id == session.fields_template_id
            )
        )
        template = template_result.scalar_one_or_none()
        if not template:
            logger.warning(f"Template {session.fields_template_id} not found, skipping")
            return

        try:
            processed = await process_emails(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                template_fields=template.fields,
                db=db,
                session_id=session.id,
            )

            # Update session metadata
            session.total_processed = (session.total_processed or 0) + processed
            session.last_processed_at = datetime.utcnow()
            if session.schedule_minutes:
                session.next_process_at = datetime.utcnow() + timedelta(
                    minutes=session.schedule_minutes
                )
            await db.commit()

            logger.info(
                f"Session {session_id}: processed {processed} documents "
                f"(total: {session.total_processed})"
            )

        except Exception as e:
            logger.error(f"Error processing session {session_id}: {e}")
