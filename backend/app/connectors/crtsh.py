import httpx

from app.models.connector import ConnectorResult


class CrtShConnector:

    BASE_URL = "https://crt.sh/"

    async def lookup(self, domain: str) -> ConnectorResult:

        try:

            async with httpx.AsyncClient(timeout=20) as client:

                response = await client.get(
                    self.BASE_URL,
                    params={
                        "q": domain,
                        "output": "json"
                    }
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