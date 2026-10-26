import sys
from pathlib import Path

# Add project root to sys.path so 'ml' module is discoverable
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.exceptions import (
    AgriAssistException,
    agriassist_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

app = FastAPI(
    title="AgriAssist API",
    description="Actionable Agricultural Intelligence Platform for Farmers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security Headers & CORS Configuration
from app.middleware.security import SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers
app.add_exception_handler(AgriAssistException, agriassist_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Static Uploads directory
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.farms import router as farms_router
from app.routers.weather import router as weather_router
from app.routers.cultivation import router as cultivation_router
from app.routers.recommendations import router as recommendations_router
from app.routers.ai import router as ai_router
from app.routers.disease import router as disease_router
from app.routers.market import router as market_router
from app.routers.labour import router as labour_router
from app.routers.rental import router as rental_router
from app.routers.notifications import router as notifications_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(farms_router)
app.include_router(weather_router)
app.include_router(cultivation_router)
app.include_router(recommendations_router)
app.include_router(ai_router)
app.include_router(disease_router)
app.include_router(market_router)
app.include_router(labour_router)
app.include_router(rental_router)
app.include_router(notifications_router)



@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": "AgriAssist",
        "tagline": "Your Farm. Your Data. Smarter Decisions.",
        "environment": settings.ENVIRONMENT,
        "database_target": f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    }
