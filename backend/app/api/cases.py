import csv
import io
import json

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse

from app.models.case import CaseCreate, CaseNoteUpdate, CaseTagUpdate
from app.services.case_service import CaseService, CaseServiceUnavailable
from app.utils.deps import get_optional_user

router = APIRouter()
service = CaseService()


def _uid(user: dict | None) -> str | None:
    return user["id"] if user else None


@router.post("/cases")
async def create_case(payload: CaseCreate, user: dict | None = Depends(get_optional_user)):
    try:
        return await service.create(
            payload.query, payload.type, payload.result, payload.tags, payload.notes, _uid(user)
        )
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/cases")
async def list_cases(tag: str | None = Query(default=None), user: dict | None = Depends(get_optional_user)):
    try:
        return await service.list_cases(tag, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/cases/{case_id}")
async def get_case(case_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        case = await service.get(case_id, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.patch("/cases/{case_id}/notes")
async def update_notes(case_id: str, payload: CaseNoteUpdate, user: dict | None = Depends(get_optional_user)):
    try:
        case = await service.update_notes(case_id, payload.notes, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.patch("/cases/{case_id}/tags")
async def update_tags(case_id: str, payload: CaseTagUpdate, user: dict | None = Depends(get_optional_user)):
    try:
        case = await service.update_tags(case_id, payload.tags, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.delete("/cases/{case_id}")
async def delete_case(case_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        deleted = await service.delete(case_id, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not deleted:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"deleted": True}


# ---------------------------------------------------------------------
# Server-side export (objective 4: exportable intelligence report)
# ---------------------------------------------------------------------

def _flatten_case(case: dict) -> list[dict]:
    rows = []
    result = case.get("result") or {}

    for s in result.get("sources", []):
        if not s.get("success") or not s.get("data"):
            continue
        for key, value in s["data"].items():
            if value in (None, "", []):
                continue
            display = ", ".join(map(str, value)) if isinstance(value, list) else (
                json.dumps(value) if isinstance(value, dict) else str(value)
            )
            rows.append({"field": key, "value": display, "source": s["source"]})

    for e in result.get("correlation", {}).get("entities", []):
        rows.append({
            "field": f"entity:{e.get('type')}",
            "value": e.get("value"),
            "source": ", ".join(e.get("sources", [])),
        })

    return rows


@router.get("/cases/{case_id}/export.json")
async def export_case_json(case_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        case = await service.get(case_id, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    buffer = io.StringIO(json.dumps(case, indent=2, default=str))

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{case["query"]}_case.json"'},
    )


@router.get("/cases/{case_id}/export.csv")
async def export_case_csv(case_id: str, user: dict | None = Depends(get_optional_user)):
    try:
        case = await service.get(case_id, _uid(user))
    except CaseServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    rows = _flatten_case(case)

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["field", "value", "source"])
    writer.writeheader()
    writer.writerows(rows)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{case["query"]}_case.csv"'},
    )
