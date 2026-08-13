"""Bitcoin wallet intelligence connector.

Uses blockchain.info's free, keyless public API to pull balance, transaction
count, and first/last activity timestamps for a BTC address.
"""

from datetime import datetime, timezone as dt_timezone

import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class BitcoinWalletConnector(BaseConnector):

    BASE_URL = "https://blockchain.info/rawaddr/"

    async def lookup(self, address: str) -> ConnectorResult:

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(
                    f"{self.BASE_URL}{address}",
                    params={"limit": 5},
                )

            if response.status_code == 404:
                return ConnectorResult(
                    source="Bitcoin",
                    success=False,
                    error="Address not found or has never transacted.",
                )

            response.raise_for_status()
            data = response.json()

            txs = data.get("txs", [])
            first_seen = None
            last_seen = None

            if txs:
                times = [tx.get("time") for tx in txs if tx.get("time")]
                if times:
                    last_seen = datetime.fromtimestamp(
                        max(times), tz=dt_timezone.utc
                    ).isoformat()
                    first_seen = datetime.fromtimestamp(
                        min(times), tz=dt_timezone.utc
                    ).isoformat()

            return ConnectorResult(
                source="Bitcoin",
                success=True,
                data={
                    "address": data.get("address"),
                    "balance_btc": round(data.get("final_balance", 0) / 1e8, 8),
                    "total_received_btc": round(data.get("total_received", 0) / 1e8, 8),
                    "total_sent_btc": round(data.get("total_sent", 0) / 1e8, 8),
                    "n_tx": data.get("n_tx"),
                    "first_seen": first_seen,
                    "last_seen": last_seen,
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="Bitcoin",
                success=False,
                error=str(e),
            )
