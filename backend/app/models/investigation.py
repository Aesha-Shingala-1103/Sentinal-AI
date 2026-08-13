from pydantic import BaseModel
from typing import Literal
from typing import Any

class InvestigationRequest(BaseModel):
    query: str
    type: Literal[
        "email",
        "username",
        "domain",
        "phone",
        "wallet"
    ]


class InvestigationResponse(BaseModel):
    success: bool
    query: str
    type: str
    sources: list
    profile: dict[str, Any] = {}
    risk: dict[str, Any] = {}
    correlation: dict[str, Any] = {}
    graph: dict[str, Any]
    timeline: list
    image_correlation: dict[str, Any] = {}
    synthetic_identity: dict[str, Any] = {}
    related_cases: list = []
    summary: dict
    message: str | None = None