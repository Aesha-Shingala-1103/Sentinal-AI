"""IP geolocation connector.

Geolocates the IP addresses a domain resolves to, using ip-api.com's free,
keyless endpoint (45 req/min limit on the free tier). Purely infrastructure
metadata (country, ISP, ASN) -- not personal geolocation of any individual.
"""

import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class IPGeoConnector(BaseConnector):

    BASE_URL = "http://ip-api.com/json/"

    async def lookup(self, ip: str) -> ConnectorResult:

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    f"{self.BASE_URL}{ip}",
                    params={"fields": "status,message,country,regionName,city,isp,org,as,lat,lon,query"},
                )

            response.raise_for_status()
            data = response.json()

            if data.get("status") != "success":
                return ConnectorResult(
                    source="IPGeo",
                    success=False,
                    error=data.get("message", "Lookup failed."),
                )

            return ConnectorResult(
                source="IPGeo",
                success=True,
                data={
                    "ip": data.get("query"),
                    "country": data.get("country"),
                    "region": data.get("regionName"),
                    "city": data.get("city"),
                    "isp": data.get("isp"),
                    "org": data.get("org"),
                    "asn": data.get("as"),
                    "lat": data.get("lat"),
                    "lon": data.get("lon"),
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="IPGeo",
                success=False,
                error=str(e),
            )
