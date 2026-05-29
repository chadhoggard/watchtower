from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Monitor
from schemas import MonitorCreate, MonitorUpdate, MonitorResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/api/monitors", tags=["monitors"])


@router.post("/", response_model=MonitorResponse, status_code=201)
async def create_monitor(monitor_data: MonitorCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    monitor = Monitor(**monitor_data.model_dump())
    db.add(monitor)
    await db.commit()
    await db.refresh(monitor)
    return monitor


@router.get("/", response_model=list[MonitorResponse])
async def list_monitors(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Monitor).order_by(Monitor.sort_order, Monitor.created_at.desc()))
    return result.scalars().all()


class ReorderItem(BaseModel):
    id: UUID
    sort_order: int


@router.patch("/reorder", status_code=204)
async def reorder_monitors(items: List[ReorderItem], db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    for item in items:
        result = await db.execute(select(Monitor).where(Monitor.id == item.id))
        monitor = result.scalar_one_or_none()
        if monitor:
            monitor.sort_order = item.sort_order
    await db.commit()


@router.get("/{monitor_id}", response_model=MonitorResponse)
async def get_monitor(monitor_id: UUID, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Monitor).where(Monitor.id == monitor_id))
    monitor = result.scalar_one_or_none()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return monitor


@router.put("/{monitor_id}", response_model=MonitorResponse)
async def update_monitor(monitor_id: UUID, monitor_data: MonitorUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Monitor).where(Monitor.id == monitor_id))
    monitor = result.scalar_one_or_none()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    update_data = monitor_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(monitor, key, value)

    await db.commit()
    await db.refresh(monitor)
    return monitor


@router.delete("/{monitor_id}", status_code=204)
async def delete_monitor(monitor_id: UUID, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Monitor).where(Monitor.id == monitor_id))
    monitor = result.scalar_one_or_none()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    await db.delete(monitor)
    await db.commit()
