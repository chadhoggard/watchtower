import logging
import httpx
from datetime import datetime
from config import get_settings
from models import Monitor

settings = get_settings()
logger = logging.getLogger(__name__)


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
            response = await client.post(settings.discord_webhook_url, json=payload)
            if response.status_code not in (200, 204):
                logger.error("Discord down alert failed: HTTP %s — %s", response.status_code, response.text)
            else:
                logger.info("Discord down alert sent for monitor '%s'", monitor.name)
    except Exception as e:
        logger.error("Discord down alert error for monitor '%s': %s", monitor.name, e)


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
            response = await client.post(settings.discord_webhook_url, json=payload)
            if response.status_code not in (200, 204):
                logger.error("Discord recovery alert failed: HTTP %s — %s", response.status_code, response.text)
            else:
                logger.info("Discord recovery alert sent for monitor '%s'", monitor.name)
    except Exception as e:
        logger.error("Discord recovery alert error for monitor '%s': %s", monitor.name, e)
