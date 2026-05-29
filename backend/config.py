from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Individual DB vars — used in production (ECS injects these separately)
    db_host: Optional[str] = None
    db_port: int = 5432
    db_name: str = "watchtower"
    db_username: Optional[str] = None
    db_password: Optional[str] = None

    # Full URL fallback — used locally via .env or DATABASE_URL
    database_url: Optional[str] = None

    discord_webhook_url: str = ""
    cors_origins: str = "http://localhost:3000"
    degraded_threshold_ms: int = 2000
    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_days: int = 30
    watchtower_api_key: str = ""

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        if self.db_host and self.db_username and self.db_password:
            return (
                f"postgresql+asyncpg://{self.db_username}:{self.db_password}"
                f"@{self.db_host}:{self.db_port}/{self.db_name}"
            )
        # Local default
        return "postgresql+asyncpg://watchtower:watchtower@localhost:5432/watchtower"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
