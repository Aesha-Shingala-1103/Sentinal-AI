from fastapi import APIRouter, Depends

from app.models.investigation import (
    InvestigationRequest,
    InvestigationResponse
)

from app.services.investigation_service import InvestigationService
from app.utils.transliteration import generate_variants
from app.utils.deps import get_optional_user

router = APIRouter()

service = InvestigationService()


@router.post(
    "/investigate",
    response_model=InvestigationResponse
)
async def investigate(data: InvestigationRequest, user: dict | None = Depends(get_optional_user)):

    result = await service.investigate(
        data.query,
        data.type,
        user_id=user["id"] if user else None,
    )

    return InvestigationResponse(**result)


@router.get("/transliterate")
async def transliterate(query: str):
    """Local-language handling (bonus objective): returns Devanagari /
    Gujarati / Hinglish script variants of a query, useful for fanning
    username search out across the way an identity might actually be
    spelled online."""

    return generate_variants(query)