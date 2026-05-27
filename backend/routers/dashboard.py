from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from database import get_db
from models import Monitor, HealthCheck, MonitorStatus
from schemas import (
    DashboardResponse,
    MonitorDashboardItem,
    StatusPageResponse,
    StatusPageMonitor,
    OverallStatus,
)

router = APIRouter(tags=["dashboard"])


async def calculate_uptime(monitor_id, db: AsyncSession) -> float:
    """Calculate uptime percentage over last 24 hours."""
    since = datetime.utcnow() - timedelta(hours=24)
    result = await db.execute(
        select(HealthCheck)
        .where(HealthCheck.monitor_id == monitor_id)
        .where(HealthCheck.checked_at >= since)
    )
    checks = result.scalars().all()
    if not checks:
        return 100.0
    healthy_checks = sum(1 for c in checks if c.status in (MonitorStatus.healthy, MonitorStatus.degraded))
    return round((healthy_checks / len(checks)) * 100, 2)


async def get_latest_check(monitor_id, db: AsyncSession):
    result = await db.execute(
        select(HealthCheck)
        .where(HealthCheck.monitor_id == monitor_id)
        .order_by(HealthCheck.checked_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/api/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Monitor).order_by(Monitor.created_at.desc()))
    monitors = result.scalars().all()

    items = []
    healthy_count = 0
    degraded_count = 0
    down_count = 0

    for monitor in monitors:
        uptime = await calculate_uptime(monitor.id, db)
        latest_check = await get_latest_check(monitor.id, db)

        if monitor.current_status == MonitorStatus.healthy:
            healthy_count += 1
        elif monitor.current_status == MonitorStatus.degraded:
            degraded_count += 1
        elif monitor.current_status == MonitorStatus.down:
            down_count += 1

        items.append(MonitorDashboardItem(
            id=monitor.id,
            name=monitor.name,
            url=monitor.url,
            environment=monitor.environment,
            current_status=monitor.current_status,
            latest_response_time_ms=latest_check.response_time_ms if latest_check else None,
            uptime_percentage=uptime,
            last_checked_at=latest_check.checked_at if latest_check else None,
        ))

    return DashboardResponse(
        monitors=items,
        total_monitors=len(monitors),
        healthy_count=healthy_count,
        degraded_count=degraded_count,
        down_count=down_count,
    )


@router.get("/api/status", response_model=StatusPageResponse)
async def get_status_page(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Monitor).order_by(Monitor.name))
    monitors = result.scalars().all()

    status_monitors = []
    has_down = False
    has_degraded = False

    for monitor in monitors:
        uptime = await calculate_uptime(monitor.id, db)
        if monitor.current_status == MonitorStatus.down:
            has_down = True
        elif monitor.current_status == MonitorStatus.degraded:
            has_degraded = True

        status_monitors.append(StatusPageMonitor(
            name=monitor.name,
            url=monitor.url,
            environment=monitor.environment,
            current_status=monitor.current_status,
            uptime_percentage=uptime,
        ))

    if has_down:
        overall = OverallStatus.major
    elif has_degraded:
        overall = OverallStatus.partial
    else:
        overall = OverallStatus.operational

    return StatusPageResponse(
        overall_status=overall,
        monitors=status_monitors,
    )
