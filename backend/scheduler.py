import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from database import async_session
from models import Monitor
from checker import run_check_for_monitor

scheduler = AsyncIOScheduler()


async def run_all_checks():
    """Run health checks for all monitors."""
    async with async_session() as db:
        result = await db.execute(select(Monitor))
        monitors = result.scalars().all()
        for monitor in monitors:
            try:
                await run_check_for_monitor(monitor, db)
            except Exception as e:
                print(f"Error checking monitor {monitor.name}: {e}")


def start_scheduler():
    """Start the APScheduler with a job to run checks every minute."""
    scheduler.add_job(run_all_checks, "interval", minutes=1, id="health_checks", replace_existing=True)
    scheduler.start()


def stop_scheduler():
    """Stop the scheduler."""
    scheduler.shutdown()
