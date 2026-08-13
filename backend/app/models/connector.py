from pydantic import BaseModel
from typing import Any


class ConnectorResult(BaseModel):
    source: str
    success: bool
    data: Any = None
    error: str | None = None