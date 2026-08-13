"""Multi-platform username enumeration connector (Sherlock/WhatsMyName-style).

Fans a single username out across ~30 public platforms concurrently and
reports which ones have a matching public profile. Only requests public
profile pages -- the same request a browser makes when you visit the URL.
"""

import asyncio

import httpx

from app.connectors.base_connector import BaseConnector
from app.connectors.site_definitions import SITES
from app.models.connector import ConnectorResult

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}


class UsernameEnumConnector(BaseConnector):

    async def _check_site(self, client: httpx.AsyncClient, site: dict, username: str):

        url = site["url"].format(username)

        try:
            response = await client.get(
                url,
                headers=HEADERS,
                timeout=8,
                follow_redirects=True,
            )

            method = site["method"]
            exists = False

            if method == "status":
                exists = response.status_code == 200

            elif method == "status_negative":
                exists = response.status_code == 404

            elif method == "text_absent":
                exists = (
                    response.status_code == 200
                    and site.get("error_text", "") not in response.text
                )

            return {
                "platform": site["name"],
                "url": url,
                "exists": exists,
                "status_code": response.status_code,
            }

        except Exception:
            return {
                "platform": site["name"],
                "url": url,
                "exists": False,
                "status_code": None,
                "checked": False,
            }

    async def lookup(self, username: str) -> ConnectorResult:

        try:
            limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)

            async with httpx.AsyncClient(limits=limits) as client:
                tasks = [
                    self._check_site(client, site, username)
                    for site in SITES
                ]

                results = await asyncio.gather(*tasks)

            found = [r for r in results if r["exists"]]

            return ConnectorResult(
                source="UsernameEnum",
                success=True,
                data={
                    "username": username,
                    "sites_checked": len(SITES),
                    "profiles_found": len(found),
                    "matches": found,
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="UsernameEnum",
                success=False,
                error=str(e),
            )
