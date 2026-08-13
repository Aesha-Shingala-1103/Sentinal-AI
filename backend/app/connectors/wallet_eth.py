"""Ethereum wallet intelligence connector.

Uses Ethplorer's public API. Ethplorer documents a shared, rate-limited
demo key ("freekey") for exactly this kind of non-commercial lookup; set
ETHPLORER_API_KEY in the environment to use your own key instead once you
have real traffic.
"""

import os

import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class EthereumWalletConnector(BaseConnector):

    BASE_URL = "https://api.ethplorer.io/getAddressInfo/"

    async def lookup(self, address: str) -> ConnectorResult:

        api_key = os.getenv("ETHPLORER_API_KEY", "freekey")

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(
                    f"{self.BASE_URL}{address}",
                    params={"apiKey": api_key},
                )

            response.raise_for_status()
            data = response.json()

            if data.get("error"):
                return ConnectorResult(
                    source="Ethereum",
                    success=False,
                    error=data["error"].get("message", "Ethplorer error"),
                )

            eth = data.get("ETH", {})
            tokens = data.get("tokens", [])

            return ConnectorResult(
                source="Ethereum",
                success=True,
                data={
                    "address": data.get("address"),
                    "balance_eth": eth.get("balance"),
                    "total_in": eth.get("totalIn"),
                    "total_out": eth.get("totalOut"),
                    "is_contract": data.get("contractInfo") is not None,
                    "token_count": len(tokens),
                    "top_tokens": [
                        {
                            "name": t.get("tokenInfo", {}).get("name"),
                            "symbol": t.get("tokenInfo", {}).get("symbol"),
                            "balance": t.get("balance"),
                        }
                        for t in tokens[:8]
                    ],
                },
            )

        except Exception as e:  # noqa: BLE001
            return ConnectorResult(
                source="Ethereum",
                success=False,
                error=str(e),
            )
