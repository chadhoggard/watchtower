import httpx
from datetime import datetime
from config import get_settings
from models import Monitor

settings = get_settings()


async def send_down_alert(monitor: Monitor, error_message: str | None):
    """Send a Discord webhook alert when a monitor goes down."""
    if not settings.discord_webhook_url:
        return

    embed = {
        "title": f"🔴 Monitor Down: {monitor.name}",
        "description": f"**URL:** {monitor.url}\n**Environment:** {monitor.environment}\n**Error:** {error_message or 'Unknown'}",
        "color": 15158332,  # Red
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {"text": "Watchtower Alert"},
    }

    payload = {"embeds": [embed]}

    try:
        async with httpx.AsyncClient() as client:
            await client.post(settings.discord_webhook_url, json=payload)
    except Exception:
        pass  # Don't fail health checks due to alert failures


async def send_recovery_alert(monitor: Monitor):
    """Send a Discord webhook alert when a monitor recovers."""
    if not settings.discord_webhook_url:
        return

    embed = {
        "title": f"🟢 Monitor Recovered: {monitor.name}",
        "description": f"**URL:** {monitor.url}\n**Environment:** {monitor.environment}\n**Status:** Back online",
        "color": 3066993,  # Green
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {"text": "Watchtower Alert"},
    }

    payload = {"embeds": [embed]}

    try:
        async with httpx.AsyncClient() as client:
            await client.post(settings.discord_webhook_url, json=payload)
    except Exception:
        pass
