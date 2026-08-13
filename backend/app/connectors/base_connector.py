from abc import ABC, abstractmethod
from app.models.connector import ConnectorResult


class BaseConnector(ABC):

    @abstractmethod
    async def lookup(self, query: str) -> ConnectorResult:
        pass