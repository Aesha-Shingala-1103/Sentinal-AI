from fastapi import APIRouter

from app.utils.resilience import registry

router = APIRouter()


@router.get("/sources/health")
async def sources_health():
    snapshot = registry.snapshot()

    healthy = sum(1 for s in snapshot if s["status"] == "healthy")

    return {
        "sources": snapshot,
        "total": len(snapshot),
        "healthy": healthy,
    }
