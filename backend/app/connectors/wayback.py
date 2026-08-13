import httpx

from app.models.connector import ConnectorResult


class WaybackConnector:

    URL = "https://archive.org/wayback/available"

    async def lookup(self, domain: str):

        try:

            async with httpx.AsyncClient(timeout=15) as client:

                response = await client.get(
                    self.URL,
                    params={"url": domain}
                )

            data = response.json()

            snapshot = (
                data.get("archived_snapshots", {})
                .get("closest", {})
            )

            return ConnectorResult(
                source="Wayback",
                success=True,
                data={
                    "available": snapshot.get("available", False),
                    "timestamp": snapshot.get("timestamp"),
                    "url": snapshot.get("url")
                }
            )

        except Exception as e:

            return ConnectorResult(
                source="Wayback",
                success=False,
                error=str(e)
            )