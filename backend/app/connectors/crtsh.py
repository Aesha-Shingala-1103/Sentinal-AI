import httpx

from app.models.connector import ConnectorResult


class CrtShConnector:

    BASE_URL = "https://crt.sh/"

    async def lookup(self, domain: str) -> ConnectorResult:

        try:

            async with httpx.AsyncClient(timeout=30) as client:

                response = await client.get(
                    self.BASE_URL,
                    params={
                        "q": domain,
                        "output": "json"
                    },
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/120.0 Safari/537.36"
                        )
                    }
                )

            if response.status_code == 404:
                # crt.sh returns 404 when a query matches zero certificates --
                # treat as a successful lookup with no results, not a failure.
                return ConnectorResult(
                    source="crt.sh",
                    success=True,
                    data={"certificates": []}
                )

            if response.status_code != 200:

                return ConnectorResult(
                    source="crt.sh",
                    success=False,
                    error=f"HTTP {response.status_code}"
                )

            data = response.json()

            certificates = []

            for cert in data[:25]:

                certificates.append({

                    "issuer": cert.get("issuer_name"),

                    "common_name": cert.get("common_name"),

                    "name_value": cert.get("name_value"),

                    "logged_at": cert.get("entry_timestamp")

                })

            return ConnectorResult(

                source="crt.sh",

                success=True,

                data={
                    "certificates": certificates
                }

            )

        except Exception as e:

            return ConnectorResult(
                source="crt.sh",
                success=False,
                error=str(e)
            )