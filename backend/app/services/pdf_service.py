import fitz
import asyncio

async def extract_text_from_pdf(file_content: bytes) -> str:
    def _extract():
        text = ""
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text
    
    return await asyncio.to_thread(_extract)
