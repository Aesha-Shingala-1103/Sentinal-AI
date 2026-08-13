import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class RDAPConnector(BaseConnector):

    BASE_URL = "https://rdap.org/domain/"

    async def lookup(self, domain: str) -> ConnectorResult:

        try:

            async with httpx.AsyncClient(
                timeout=20,
                follow_redirects=True
            ) as client:

                response = await client.get(
                    f"{self.BASE_URL}{domain}"
                )

                response.raise_for_status()

                data = response.json()

                return ConnectorResult(
                    source="RDAP",
                    success=True,
                    data={
                        "handle": data.get("handle"),
                        "status": data.get("status", []),
                        "nameservers": [
                            ns.get("ldhName")
                            for ns in data.get("nameservers", [])
                        ],
                        "entities": [
                            entity.get("handle")
                            for entity in data.get("entities", [])
                        ]
                    }
                )

        except Exception as e:

            return ConnectorResult(
                source="RDAP",
                success=False,
                error=str(e)
            )