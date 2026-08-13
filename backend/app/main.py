from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.investigate import router as investigate_router
from app.api.cases import router as cases_router
from app.api.watchlist import router as watchlist_router
from app.api.sources_health import router as health_router
from app.api.auth import router as auth_router
from app.services.investigation_service import InvestigationService
from app.services.scheduler import start_scheduler
from app.database.mongo import check_connection

# Load environment variables from backend/.env
load_dotenv()

import os

print("=" * 50)
print("VT_API_KEY:", "configured" if os.getenv("VT_API_KEY") else "missing")
print("GEMINI_API_KEY:", "configured" if os.getenv("GEMINI_API_KEY") else "missing")
print("HIBP_API_KEY:", "configured" if os.getenv("HIBP_API_KEY") else "missing (optional)")
print("MONGO_URI:", "configured" if os.getenv("MONGO_URI") else "missing (using in-memory dev database)")
print("=" * 50)

app = FastAPI(
    title="Sentinel AI",
    description="AI Powered OSINT Investigation Platform",
    version="1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Investigation API
app.include_router(
    investigate_router,
    prefix="/api",
    tags=["Investigation"]
)

# Auth (basic login feature)
app.include_router(
    auth_router,
    prefix="/api",
    tags=["Auth"]
)

# Case management (save / tag / annotate investigations)
app.include_router(
    cases_router,
    prefix="/api",
    tags=["Cases"]
)

# Watchlist + alerting (monitoring bonus objective)
app.include_router(
    watchlist_router,
    prefix="/api",
    tags=["Monitoring"]
)

# Source health / rate-limit visibility
app.include_router(
    health_router,
    prefix="/api",
    tags=["Source Health"]
)


@app.on_event("startup")
async def on_startup():
    db_status = await check_connection()
    print("Database:", db_status)

    # Background sweep that re-checks watched targets and raises alerts.
    # No-ops safely if MONGO_URI isn't configured.
    service = InvestigationService()
    start_scheduler(service.investigate)


@app.get("/api/health/db")
async def db_health():
    return await check_connection()


@app.get("/")
async def home():
    return {
        "message": "Sentinel AI Backend Running 🚀"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


@app.get("/version")
async def version():
    return {
        "name": "Sentinel AI",
        "version": "1.0.0"
    }