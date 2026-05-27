from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db
from scheduler import start_scheduler, stop_scheduler
from routers import monitors, health_checks, incidents, dashboard

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="Watchtower API",
    description="API uptime monitoring platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(monitors.router)
app.include_router(health_checks.router)
app.include_router(incidents.router)
app.include_router(dashboard.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "watchtower-api"}
