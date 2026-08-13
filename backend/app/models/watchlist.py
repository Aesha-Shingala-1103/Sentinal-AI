from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WatchlistCreate(BaseModel):
    query: str
    type: str
    interval_hours: int = Field(default=24, ge=1, le=168)
    label: str | None = None


class WatchlistEntry(BaseModel):
    id: str
    query: str
    type: str
    interval_hours: int
    label: str | None = None
    created_at: datetime
    last_checked: datetime | None = None
    entity_count_baseline: int = 0


class Alert(BaseModel):
    id: str
    watchlist_id: str
    query: str
    created_at: datetime
    new_entities: list[dict[str, Any]]
    message: str
    acknowledged: bool = False
