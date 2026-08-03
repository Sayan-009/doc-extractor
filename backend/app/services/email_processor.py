import base64
import tempfile
import asyncio
import logging
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import extract_fields
from app.models import ExtractedRow, ExtractionSession

logger = logging.getLogger(__name__)


def _build_gmail_service(access_token: str, refresh_token: str):
    """Build Gmail API service with auto-refresh credentials."""
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )
    return build("gmail", "v1", credentials=creds)


async def process_emails(
    access_token: str,
    refresh_token: str,
    template_fields: list,
    db: AsyncSession,
    session_id: int,
) -> int:
    """
    Fetch unread emails with PDF attachments from Gmail, extract data, and save to DB.

    Returns the number of documents processed.
    """
    service = await asyncio.to_thread(
        _build_gmail_service, access_token, refresh_token
    )

    # Search for unread emails with PDF attachments
    results = await asyncio.to_thread(
        lambda: service.users()
        .messages()
        .list(userId="me", q="is:unread has:attachment filename:pdf", maxResults=10)
        .execute()
    )

    messages = results.get("messages", [])
    if not messages:
        logger.info("No unread emails with PDF attachments found")
        return 0

    processed = 0

    for msg_meta in messages:
        msg_id = msg_meta["id"]
        try:
            # Fetch full message
            msg = await asyncio.to_thread(
                lambda mid=msg_id: service.users()
                .messages()
                .get(userId="me", id=mid, format="full")
                .execute()
            )

            # Get subject from headers
            headers = msg.get("payload", {}).get("headers", [])
            subject = next(
                (h["value"] for h in headers if h["name"].lower() == "subject"),
                "Unknown",
            )

            # Find PDF attachments in message parts
            parts = msg.get("payload", {}).get("parts", [])
            for part in parts:
                filename = part.get("filename", "")
                if not filename.lower().endswith(".pdf"):
                    continue

                att_id = part.get("body", {}).get("attachmentId")
                if not att_id:
                    continue

                # Download attachment
                att = await asyncio.to_thread(
                    lambda aid=att_id, mid=msg_id: service.users()
                    .messages()
                    .attachments()
                    .get(userId="me", messageId=mid, id=aid)
                    .execute()
                )

                pdf_data = base64.urlsafe_b64decode(att["data"])

                # Extract text from PDF directly from bytes
                pdf_text = await extract_text_from_pdf(pdf_data)

                if not pdf_text or not pdf_text.strip():
                    logger.warning(f"No text extracted from {filename}")
                    continue

                # Extract fields with AI
                try:
                    extracted_data = await extract_fields(pdf_text, template_fields)
                except Exception as e:
                    logger.error(f"AI extraction failed for {filename}: {e}")
                    continue

                # Save extracted row to database
                row = ExtractedRow(
                    session_id=session_id,
                    source_filename=filename,
                    source_type="gmail",
                    data=extracted_data,
                )
                db.add(row)
                processed += 1
                logger.info(f"Processed: {filename} from '{subject}'")

            # Mark email as read
            await asyncio.to_thread(
                lambda mid=msg_id: service.users()
                .messages()
                .modify(
                    userId="me",
                    id=mid,
                    body={"removeLabelIds": ["UNREAD"]},
                )
                .execute()
            )

        except Exception as e:
            logger.error(f"Error processing message {msg_id}: {e}")
            continue

    if processed > 0:
        await db.commit()

    logger.info(f"Total documents processed: {processed}")
    return processed
