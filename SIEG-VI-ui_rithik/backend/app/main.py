import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import settings
from app.db import init_db
from app.routers import health_router, sessions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield


app = FastAPI(
    title="AyurLife Backend API",
    description="""
# AyurLife Clinical Intake & OCR Platform API

AyurLife turns patient wait-time in OPDs into structured, AI-guided clinical intake.
This backend provides:
- **Shared Structured History Schema**: Single source of truth for clinical intake.
- **Module A Voice Track Contract**: Endpoints for speech-to-text dialogue engine.
- **Module B OCR Pipeline**: Offline PaddleOCR & Medical Entity Extraction for prescriptions & lab reports.
- **Module C Summary Generator**: Standard clinical ordering (SOCRATES + Labs + Meds) for physician consultation.
- **Session Lifecycle Management**: `draft` -> `physician_reviewed` -> `submitted_to_abdm`.
""",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for Kiosk frontend and Doctor consultation screen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health_router)
app.include_router(sessions_router)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
