"""Have I Been Pwned breach-exposure connector.

HIBP is the standard, authoritative service for checking whether an email
has appeared in a known, publicly-disclosed data breach. It requires a paid
API key (HIBP_API_KEY) since late 2024 -- this connector is fully wired and
will work the moment a key is supplied; until then it reports itself as
"not configured" rather than failing silently, so the gap is visible in the
Sources table and Source Health panel instead of being invisible.

We surface breach NAMES and metadata only (what HIBP's API returns) -- never
the leaked credentials/passwords themselves, which HIBP does not expose via
this endpoint and which this project does not attempt to fetch from anywhere.
"""

import os

import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class HIBPConnector(BaseConnector):

    BASE_URL = "https://haveibeenpwned.com/api/v3/breachedaccount/"

    async def lookup(self, email: str) -> ConnectorResult:

        api_key = os.getenv("HIBP_API_KEY")

        if not api_key:
            return ConnectorResult(
                source="HIBP",
                success=False,
                error="HIBP_API_KEY not configured. Get one at haveibeenpwned.com/API/Key.",
            )

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(
                    f"{self.BASE_URL}{email}",
                    params={"truncateResponse": "false"},
                    headers={
                        "hibp-api-key": api_key,
                        "user-agent": "Sentinel-AI-OSINT",
                    },
                )

            if response.status_code == 404:
                return ConnectorResult(
                    source="HIBP",
                    success=True,
                    data={"breaches": [], "breach_count": 0},
                )

            if response.status_code == 429:
                return ConnectorResult(
                    source="HIBP",
                    success=False,
                    error="Rate limited by HIBP (429). Try again shortly.",
                )

            response.raise_for_status()
            breaches = response.json()

            return ConnectorResult(
                source="HIBP",
                success=True,
                data={
                    "breach_count": len(breaches),
                    "breaches": [
                        {
                            "name": b.get("Name"),
                            "domain": b.get("Domain"),
                            "breach_date": b.get("BreachDate"),
                            "data_classes": b.get("DataClasses", []),
                            "is_sensitive": b.get("IsSensitive", False),
                            "pwn_count": b.get("PwnCount"),
                        }
                        for b in breaches
                    ],
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="HIBP",
                success=False,
                error=str(e),
            )
