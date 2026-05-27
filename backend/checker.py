import httpx
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import Monitor, HealthCheck, Incident, MonitorStatus, IncidentStatus
from config import get_settings
from alerts import send_down_alert, send_recovery_alert

settings = get_settings()


async def run_check_for_monitor(monitor: Monitor, db: AsyncSession) -> HealthCheck:
    """Run a health check for a single monitor."""
    status = MonitorStatus.down
    http_status_code = None
    response_time_ms = None
    error_message = None

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            start = datetime.utcnow()
            response = await client.request(method=monitor.http_method, url=monitor.url)
            end = datetime.utcnow()

            http_status_code = response.status_code
            response_time_ms = (end - start).total_seconds() * 1000

            if response.status_code == monitor.expected_status_code:
                if response_time_ms > settings.degraded_threshold_ms:
                    status = MonitorStatus.degraded
                else:
                    status = MonitorStatus.healthy
            else:
                status = MonitorStatus.down
                error_message = f"Expected status {monitor.expected_status_code}, got {response.status_code}"

    except httpx.TimeoutException:
        status = MonitorStatus.down
        error_message = "Request timed out"
    except httpx.ConnectError as e:
        status = MonitorStatus.down
        error_message = f"Connection error: {str(e)}"
    except Exception as e:
        status = MonitorStatus.down
        error_message = f"Unexpected error: {str(e)}"

    # Create health check record
    health_check = HealthCheck(
        monitor_id=monitor.id,
        status=status,
        http_status_code=http_status_code,
        response_time_ms=response_time_ms,
        error_message=error_message,
        checked_at=datetime.utcnow(),
    )
    db.add(health_check)

    # Handle incident tracking
    previous_status = monitor.current_status

    if status == MonitorStatus.down and previous_status in (MonitorStatus.healthy, MonitorStatus.degraded, MonitorStatus.unknown):
        # Create new incident
        incident = Incident(
            monitor_id=monitor.id,
            status=IncidentStatus.ongoing,
            started_at=datetime.utcnow(),
            reason=error_message,
        )
        db.add(incident)
        await send_down_alert(monitor, error_message)

    elif status in (MonitorStatus.healthy, MonitorStatus.degraded) and previous_status == MonitorStatus.down:
        # Resolve ongoing incidents
        result = await db.execute(
            select(Incident)
            .where(Incident.monitor_id == monitor.id)
            .where(Incident.status == IncidentStatus.ongoing)
        )
        ongoing_incidents = result.scalars().all()
        for incident in ongoing_incidents:
            incident.status = IncidentStatus.resolved
            incident.resolved_at = datetime.utcnow()
            incident.duration_seconds = int((incident.resolved_at - incident.started_at).total_seconds())
        await send_recovery_alert(monitor)

    # Update monitor status
    monitor.current_status = status
    monitor.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(health_check)
    return health_check
