import json
import asyncio
import logging
from google import genai
from groq import Groq
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize clients if keys exist
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


async def extract_fields(pdf_text: str, fields: list) -> dict:
    """
    Extract custom fields from PDF text using Groq LLM (fallback to Google Gemini if configured).

    Args:
        pdf_text: Raw text extracted from PDF.
        fields: List of field dicts, e.g. [{"name": "Invoice Number", "type": "text", "required": true}]

    Returns:
        Dictionary with extracted field values.
    """
    if not groq_client and not gemini_client:
        raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured")

    if not pdf_text or not pdf_text.strip():
        raise ValueError("PDF text is empty — cannot extract fields")

    # Build field descriptions for the prompt
    field_descriptions = []
    for f in fields:
        name = f.get("name", f) if isinstance(f, dict) else str(f)
        ftype = f.get("type", "text") if isinstance(f, dict) else "text"
        required = f.get("required", False) if isinstance(f, dict) else False
        field_descriptions.append(f"- {name} (type: {ftype}, required: {required})")

    field_names = [
        f.get("name", f) if isinstance(f, dict) else str(f) for f in fields
    ]

    prompt = f"""You are a document data extraction assistant. Extract the following fields from the document text below.
Return ONLY a valid JSON object with the field names as keys. Do not include markdown code block syntax (like ```json).

Fields to extract:
{chr(10).join(field_descriptions)}

Document text:
---
{pdf_text}
---

Return a JSON object with exactly these keys: {json.dumps(field_names)}
If a field cannot be found in the document, use null as the value."""

    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Prefer Groq if key is present
            if groq_client:
                logger.info(f"Extracting with Groq (Attempt {attempt + 1})...")
                
                def _call_groq():
                    chat_completion = groq_client.chat.completions.create(
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a precise data extraction engine. Output raw JSON ONLY. No explanation."
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model="llama-3.3-70b-versatile",
                        response_format={"type": "json_object"},
                        temperature=0.1
                    )
                    return chat_completion.choices[0].message.content

                response_text = await asyncio.to_thread(_call_groq)
            
            # Fallback to Gemini
            else:
                logger.info(f"Extracting with Gemini (Attempt {attempt + 1})...")
                response = await asyncio.to_thread(
                    gemini_client.models.generate_content,
                    model="gemini-2.5-flash-lite",
                    contents=prompt,
                    config={"response_mime_type": "application/json"},
                )
                response_text = response.text

            result = json.loads(response_text)
            logger.info(f"Successfully extracted {len(result)} fields")
            return result

        except json.JSONDecodeError as e:
            logger.warning(f"Attempt {attempt + 1}: Failed to parse JSON response: {e}")
            if attempt == max_retries - 1:
                # Last ditch effort to strip backticks
                text = response_text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())

        except Exception as e:
            logger.error(f"Attempt {attempt + 1}: API extraction error: {e}")
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff

    return {}
