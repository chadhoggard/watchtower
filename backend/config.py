from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://watchtower:watchtower@localhost:5432/watchtower"
    discord_webhook_url: str = ""
    cors_origins: str = "http://localhost:3000"
    degraded_threshold_ms: int = 2000

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
