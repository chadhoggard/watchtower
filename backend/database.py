from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import get_settings

settings = get_settings()

engine = create_async_engine(settings.resolved_database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    # Import models so Base.metadata knows about them
    import models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add sort_order column if it doesn't exist (for existing deployments)
        await conn.execute(
            __import__("sqlalchemy").text(
                "ALTER TABLE monitors ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0"
            )
        )
