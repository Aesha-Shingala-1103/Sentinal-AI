from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CaseCreate(BaseModel):
    query: str
    type: str
    result: dict[str, Any]
    tags: list[str] = Field(default_factory=list)
    notes: str = ""


class CaseSummary(BaseModel):
    id: str
    query: str
    type: str
    tags: list[str]
    notes: str
    created_at: datetime
    updated_at: datetime
    risk_level: str | None = None


class CaseDetail(CaseSummary):
    result: dict[str, Any]


class CaseNoteUpdate(BaseModel):
    notes: str


class CaseTagUpdate(BaseModel):
    tags: list[str]
