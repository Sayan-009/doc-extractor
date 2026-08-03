import httpx
from fastapi import HTTPException
from app.config import settings

async def verify_google_token(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        user_info = response.json()
        if user_info.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Invalid Google client ID")
        return user_info
