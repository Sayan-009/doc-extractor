from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.database import get_db
from app.models import User, UserToken
from app.auth.dependencies import get_current_user
from app.config import settings

router = APIRouter()

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
]


@router.get("/status")
async def gmail_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if the current user has a connected Gmail account."""
    result = await db.execute(
        select(UserToken).where(
            UserToken.user_id == current_user.id,
            UserToken.provider == "gmail",
        )
    )
    token = result.scalar_one_or_none()

    return {
        "connected": token is not None,
        "email": token.email_address if token else None,
    }


@router.get("/connect")
async def connect_gmail(current_user: User = Depends(get_current_user)):
    """Return the Google OAuth URL to connect Gmail."""
    redirect_uri = f"{settings.BACKEND_URL}/api/gmail/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": str(current_user.id),  # Pass user ID in state for callback
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    return {"auth_url": auth_url}


@router.get("/callback")
async def gmail_callback(
    code: str,
    state: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Handle Gmail OAuth callback — exchange code for tokens and store them."""
    redirect_uri = f"{settings.BACKEND_URL}/api/gmail/callback"

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange Gmail auth code")

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token received")

    # Get Gmail user profile
    async with httpx.AsyncClient() as client:
        profile_response = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/profile",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    email_address = None
    if profile_response.status_code == 200:
        email_address = profile_response.json().get("emailAddress")

    # Get user ID from state parameter
    user_id = int(state) if state else None
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user context")

    # Store or update token
    result = await db.execute(
        select(UserToken).where(
            UserToken.user_id == user_id,
            UserToken.provider == "gmail",
        )
    )
    existing_token = result.scalar_one_or_none()

    if existing_token:
        existing_token.access_token = access_token
        if refresh_token:
            existing_token.refresh_token = refresh_token
        existing_token.email_address = email_address
    else:
        new_token = UserToken(
            user_id=user_id,
            provider="gmail",
            access_token=access_token,
            refresh_token=refresh_token or "",
            email_address=email_address,
            token_uri="https://oauth2.googleapis.com/token",
        )
        db.add(new_token)

    await db.commit()

    # Redirect to frontend settings page
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/settings?gmail=connected",
        status_code=302,
    )


@router.post("/disconnect")
async def disconnect_gmail(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect Gmail by removing the stored token."""
    result = await db.execute(
        select(UserToken).where(
            UserToken.user_id == current_user.id,
            UserToken.provider == "gmail",
        )
    )
    token = result.scalar_one_or_none()

    if not token:
        raise HTTPException(status_code=404, detail="Gmail is not connected")

    await db.delete(token)
    await db.commit()
    return {"message": "Gmail disconnected successfully"}
