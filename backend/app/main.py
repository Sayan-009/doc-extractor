import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import auth, templates, sessions, upload, gmail, email_processing, export
from app.services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created/verified")

    start_scheduler()
    logger.info("✅ Application started")

    yield

    # Shutdown
    stop_scheduler()
    logger.info("🛑 Application stopped")


app = FastAPI(
    title="DocExtract API",
    description="AI-powered document extraction platform",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(templates.router, prefix="/api/templates", tags=["Field Templates"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Extraction Sessions"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(gmail.router, prefix="/api/gmail", tags=["Gmail"])
app.include_router(email_processing.router, prefix="/api/email", tags=["Email Processing"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])


# Global exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred"},
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/")
async def root():
    return {
        "message": "DocExtract API v2.0",
        "docs": "/docs",
        "health": "/health",
    }
