from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from database import get_db
from models import Incident
from schemas import IncidentResponse

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Incident)
        .order_by(Incident.started_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{monitor_id}", response_model=list[IncidentResponse])
async def get_monitor_incidents(monitor_id: UUID, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Incident)
        .where(Incident.monitor_id == monitor_id)
        .order_by(Incident.started_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
