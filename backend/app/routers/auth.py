from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.database import get_db
from app.models import User
from app.schemas.auth import UserCreate, UserResponse, TokenResponse
from app.auth.jwt_handler import create_access_token, create_refresh_token, decode_access_token
from app.auth.dependencies import get_current_user
from app.config import settings

router = APIRouter()

REFRESH_COOKIE_KEY = "refresh_token"
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_KEY,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=REFRESH_COOKIE_KEY,
        path="/api/auth",
        samesite="none",
        secure=True,
    )


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(email=user_data.email)
    user.hash_password(user_data.password)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not user.verify_password(user_data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Refresh the access token using the refresh token cookie."""
    token = request.cookies.get(REFRESH_COOKIE_KEY)
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    payload = decode_access_token(token)
    if not payload:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # Verify user still exists
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Issue new tokens
    new_access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    _set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(access_token=new_access_token, token_type="bearer")


@router.post("/logout")
async def logout(response: Response):
    """Clear the refresh token cookie."""
    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return current_user


@router.post("/change-password")
async def change_password(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's password."""
    body = await request.json()
    current_password = body.get("current_password")
    new_password = body.get("new_password")

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Both current and new password are required")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    if current_user.is_google_user and not current_user.password_hash:
        raise HTTPException(status_code=400, detail="Google accounts cannot change password here")

    if not current_user.verify_password(current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hash_password(new_password)
    await db.commit()

    return {"message": "Password updated successfully"}


@router.get("/google")
async def google_login():
    """Return the Google OAuth authorization URL."""
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    return {"auth_url": auth_url}


@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback — exchange code for tokens, create/find user, redirect to frontend."""
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"

    # Exchange authorization code for tokens
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
        raise HTTPException(status_code=400, detail="Failed to exchange Google auth code")

    token_data = token_response.json()
    google_access_token = token_data.get("access_token")

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get Google user info")

    google_user = userinfo_response.json()
    email = google_user.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=email, is_google_user=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Generate JWT tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Redirect to frontend with access token
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}"
    resp = RedirectResponse(url=redirect_url, status_code=302)
    _set_refresh_cookie(resp, refresh_token)
    return resp
