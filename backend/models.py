import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Text, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import enum


class EnvironmentTag(str, enum.Enum):
    dev = "dev"
    staging = "staging"
    prod = "prod"


class MonitorStatus(str, enum.Enum):
    healthy = "healthy"
    degraded = "degraded"
    down = "down"
    unknown = "unknown"


class IncidentStatus(str, enum.Enum):
    ongoing = "ongoing"
    resolved = "resolved"


class Monitor(Base):
    __tablename__ = "monitors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    http_method: Mapped[str] = mapped_column(String(10), default="GET")
    expected_status_code: Mapped[int] = mapped_column(Integer, default=200)
    check_interval_minutes: Mapped[int] = mapped_column(Integer, default=5)
    environment: Mapped[str] = mapped_column(SAEnum(EnvironmentTag), default=EnvironmentTag.prod)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    current_status: Mapped[str] = mapped_column(SAEnum(MonitorStatus), default=MonitorStatus.unknown)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    health_checks: Mapped[list["HealthCheck"]] = relationship(back_populates="monitor", cascade="all, delete-orphan")
    incidents: Mapped[list["Incident"]] = relationship(back_populates="monitor", cascade="all, delete-orphan")


class HealthCheck(Base):
    __tablename__ = "health_checks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    monitor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("monitors.id"), nullable=False)
    status: Mapped[str] = mapped_column(SAEnum(MonitorStatus), nullable=False)
    http_status_code: Mapped[int] = mapped_column(Integer, nullable=True)
    response_time_ms: Mapped[float] = mapped_column(Float, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    monitor: Mapped["Monitor"] = relationship(back_populates="health_checks")


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    monitor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("monitors.id"), nullable=False)
    status: Mapped[str] = mapped_column(SAEnum(IncidentStatus), default=IncidentStatus.ongoing)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=True)

    monitor: Mapped["Monitor"] = relationship(back_populates="incidents")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
