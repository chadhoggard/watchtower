from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from database import get_db
from models import HealthCheck, Monitor
from schemas import HealthCheckResponse
from checker import run_check_for_monitor
from utils.auth import get_current_user

router = APIRouter(prefix="/api/health-checks", tags=["health-checks"])


@router.get("/{monitor_id}", response_model=list[HealthCheckResponse])
async def get_health_checks(monitor_id: UUID, limit: int = 50, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(HealthCheck)
        .where(HealthCheck.monitor_id == monitor_id)
        .order_by(HealthCheck.checked_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/{monitor_id}/trigger", response_model=HealthCheckResponse)
async def trigger_health_check(monitor_id: UUID, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Monitor).where(Monitor.id == monitor_id))
    monitor = result.scalar_one_or_none()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    health_check = await run_check_for_monitor(monitor, db)
    return health_check
