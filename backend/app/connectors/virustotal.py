import os
import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class VirusTotalConnector(BaseConnector):

    async def lookup(self, domain: str) -> ConnectorResult:

        url = f"https://www.virustotal.com/api/v3/domains/{domain}"

        api_key = os.getenv("VT_API_KEY")

        if not api_key:
            return ConnectorResult(
                source="VirusTotal",
                success=False,
                error="VirusTotal API key not configured (VT_API_KEY env var missing)"
            )

        headers = {
            "x-apikey": api_key
        }

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()

                data = response.json()

                attrs = data["data"]["attributes"]

                return ConnectorResult(
                    source="VirusTotal",
                    success=True,
                    data={
                        "reputation": attrs.get("reputation"),
                        "categories": attrs.get("categories"),
                        "last_analysis_stats": attrs.get("last_analysis_stats"),
                        "creation_date": attrs.get("creation_date"),
                        "last_modification_date": attrs.get("last_modification_date")
                    }
                )

        except Exception as e:
            return ConnectorResult(
                source="VirusTotal",
                success=False,
                error=repr(e)
            )