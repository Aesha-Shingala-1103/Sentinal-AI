"""DNS records connector.

Pulls A, AAAA, MX, NS, TXT, and SOA records for a domain directly from DNS
resolvers -- real, live records, no key required.
"""

import asyncio
from functools import partial

import dns.resolver

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "SOA"]


class DNSConnector(BaseConnector):

    async def lookup(self, domain: str) -> ConnectorResult:

        records: dict[str, list[str]] = {}

        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 8

        loop = asyncio.get_event_loop()

        try:
            for rtype in RECORD_TYPES:
                try:
                    answers = await loop.run_in_executor(
                        None, partial(resolver.resolve, domain, rtype)
                    )
                    records[rtype] = [str(a).strip() for a in answers]
                except (
                    dns.resolver.NoAnswer,
                    dns.resolver.NXDOMAIN,
                    dns.resolver.NoNameservers,
                    dns.resolver.LifetimeTimeout,
                ):
                    records[rtype] = []

            has_data = any(records.values())

            if not has_data:
                return ConnectorResult(
                    source="DNS",
                    success=False,
                    error="No DNS records resolved for this domain.",
                )

            # Surface anything that looks like SPF/DMARC/domain verification
            security_txt = [
                t for t in records.get("TXT", [])
                if any(tag in t.lower() for tag in ("spf", "dmarc", "verif", "google-site", "ms=", "_dmarc"))
            ]

            return ConnectorResult(
                source="DNS",
                success=True,
                data={
                    "a": records.get("A", []),
                    "aaaa": records.get("AAAA", []),
                    "mx": records.get("MX", []),
                    "ns": records.get("NS", []),
                    "txt": records.get("TXT", []),
                    "soa": records.get("SOA", []),
                    "security_related_txt": security_txt,
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="DNS",
                success=False,
                error=str(e),
            )
