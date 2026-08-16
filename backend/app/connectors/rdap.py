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

                events = {}
                for event in data.get("events", []):
                    action = event.get("eventAction")
                    date = event.get("eventDate")
                    if action and date:
                        events[action] = date

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
                        ],
                        "registration_date": events.get("registration"),
                        "expiration_date": events.get("expiration"),
                        "last_changed_date": events.get("last changed"),
                    }
                )

        except Exception as e:

            return ConnectorResult(
                source="RDAP",
                success=False,
                error=str(e)
            )