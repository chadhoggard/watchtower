from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum


class EnvironmentTag(str, Enum):
    dev = "dev"
    staging = "staging"
    prod = "prod"


class MonitorStatus(str, Enum):
    healthy = "healthy"
    degraded = "degraded"
    down = "down"
    unknown = "unknown"


class IncidentStatus(str, Enum):
    ongoing = "ongoing"
    resolved = "resolved"


# Monitor schemas
class MonitorCreate(BaseModel):
    name: str = Field(..., max_length=255)
    url: str = Field(..., max_length=2048)
    http_method: str = Field(default="GET", max_length=10)
    expected_status_code: int = Field(default=200)
    check_interval_minutes: int = Field(default=5, ge=1, le=1440)
    environment: EnvironmentTag = EnvironmentTag.prod
    description: Optional[str] = None


class MonitorUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    url: Optional[str] = Field(None, max_length=2048)
    http_method: Optional[str] = Field(None, max_length=10)
    expected_status_code: Optional[int] = None
    check_interval_minutes: Optional[int] = Field(None, ge=1, le=1440)
    environment: Optional[EnvironmentTag] = None
    description: Optional[str] = None


class MonitorResponse(BaseModel):
    id: UUID
    name: str
    url: str
    http_method: str
    expected_status_code: int
    check_interval_minutes: int
    environment: EnvironmentTag
    description: Optional[str]
    current_status: MonitorStatus
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# HealthCheck schemas
class HealthCheckResponse(BaseModel):
    id: UUID
    monitor_id: UUID
    status: MonitorStatus
    http_status_code: Optional[int]
    response_time_ms: Optional[float]
    error_message: Optional[str]
    checked_at: datetime

    class Config:
        from_attributes = True


# Incident schemas
class IncidentResponse(BaseModel):
    id: UUID
    monitor_id: UUID
    status: IncidentStatus
    started_at: datetime
    resolved_at: Optional[datetime]
    duration_seconds: Optional[int]
    reason: Optional[str]

    class Config:
        from_attributes = True


# Dashboard schemas
class MonitorDashboardItem(BaseModel):
    id: UUID
    name: str
    url: str
    environment: EnvironmentTag
    current_status: MonitorStatus
    latest_response_time_ms: Optional[float]
    uptime_percentage: float
    last_checked_at: Optional[datetime]


class DashboardResponse(BaseModel):
    monitors: list[MonitorDashboardItem]
    total_monitors: int
    healthy_count: int
    degraded_count: int
    down_count: int


# Status page schemas
class StatusPageMonitor(BaseModel):
    name: str
    url: str
    environment: EnvironmentTag
    current_status: MonitorStatus
    uptime_percentage: float


class OverallStatus(str, Enum):
    operational = "All Systems Operational"
    partial = "Partial Outage"
    major = "Major Outage"


class StatusPageResponse(BaseModel):
    overall_status: OverallStatus
    monitors: list[StatusPageMonitor]


# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
