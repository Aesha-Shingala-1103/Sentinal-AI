from fastapi import APIRouter, HTTPException, Depends

from app.models.watchlist import WatchlistCreate
from app.services.monitor_service import MonitorService, MonitorServiceUnavailable
from app.utils.deps import get_optional_user

router = APIRouter()
service = MonitorService()


def _uid(user: dict | None) -> str | None:
    return user["id"] if user else None


@router.post("/watchlist")
async def add_watch(payload: WatchlistCreate, user: dict | None = Depends(get_optional_user)):
    try:
        return await service.add(
            payload.query, payload.type, payload.interval_hours, payload.label, _uid(user)
        )
    except MonitorServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/watchlist")
async def list_watches(user: dict | None = Depends(get_optional_user)):
    try:
        return await service.list_all(_uid(user))
    except MonitorServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.delete("/watchlist/{watch_id}")
async def remove_watch(watch_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        removed = await service.remove(watch_id, _uid(user))
    except MonitorServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not removed:
        raise HTTPException(status_code=404, detail="Watch not found")
    return {"deleted": True}


@router.get("/alerts")
async def list_alerts(unacknowledged_only: bool = False, user: dict | None = Depends(get_optional_user)):
    try:
        return await service.list_alerts(unacknowledged_only, _uid(user))
    except MonitorServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        ok = await service.acknowledge_alert(alert_id, _uid(user))
    except MonitorServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not ok:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"acknowledged": True}
