import tempfile
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, FieldTemplate
from app.auth.dependencies import get_current_user
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import extract_fields

router = APIRouter()


@router.post("/test-extraction")
async def test_extraction(
    file: UploadFile = File(...),
    template_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a sample PDF and test field extraction against a template.
    Returns the extracted data as a preview.
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Get template
    result = await db.execute(
        select(FieldTemplate).where(
            FieldTemplate.id == template_id,
            FieldTemplate.user_id == current_user.id,
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Read file content
    pdf_content = await file.read()
    if not pdf_content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Extract text from PDF
    try:
        pdf_text = await extract_text_from_pdf(pdf_content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read PDF: {str(e)}")

    if not pdf_text or not pdf_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from this PDF. It may be scanned or image-based.",
        )

    # Extract fields using AI
    try:
        extracted_data = await extract_fields(pdf_text, template.fields)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

    return {
        "filename": file.filename,
        "template_name": template.name,
        "extracted_data": extracted_data,
        "text_length": len(pdf_text),
    }
