"""WHOIS fallback connector.

RDAP is the modern, structured replacement for WHOIS, but not every
registry has finished migrating and RDAP responses sometimes omit fields
(registrant country, org, raw creation/expiry dates) that classic WHOIS
still returns. This runs `python-whois` as a supplement, not a replacement.
"""

import asyncio
from functools import partial

import whois

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


def _stringify(value):
    if isinstance(value, list):
        return [str(v) for v in value if v]
    if value is None:
        return None
    return str(value)


class WhoisConnector(BaseConnector):

    async def lookup(self, domain: str) -> ConnectorResult:

        loop = asyncio.get_event_loop()

        try:
            record = await loop.run_in_executor(
                None, partial(whois.whois, domain)
            )

            if not record or not record.get("domain_name"):
                return ConnectorResult(
                    source="WHOIS",
                    success=False,
                    error="No WHOIS record found.",
                )

            return ConnectorResult(
                source="WHOIS",
                success=True,
                data={
                    "registrar": _stringify(record.get("registrar")),
                    "creation_date": _stringify(record.get("creation_date")),
                    "expiration_date": _stringify(record.get("expiration_date")),
                    "updated_date": _stringify(record.get("updated_date")),
                    "name_servers": _stringify(record.get("name_servers")),
                    "status": _stringify(record.get("status")),
                    "org": _stringify(record.get("org")),
                    "country": _stringify(record.get("country")),
                    "emails": _stringify(record.get("emails")),
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="WHOIS",
                success=False,
                error=str(e),
            )
