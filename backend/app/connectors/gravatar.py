"""Gravatar profile connector."""
import hashlib
import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class GravatarConnector(BaseConnector):

    async def lookup(self, email: str) -> ConnectorResult:

        email = email.strip().lower()

        email_hash = hashlib.sha256(email.encode()).hexdigest()

        url = f"https://api.gravatar.com/v3/profiles/{email_hash}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:

                response = await client.get(url)

                if response.status_code == 404:
                    return ConnectorResult(
                        source="Gravatar",
                        success=False,
                        error="Profile not found"
                    )

                response.raise_for_status()

                profile = response.json()

                return ConnectorResult(
                    source="Gravatar",
                    success=True,
                    data={
                        "hash": email_hash,
                        "display_name": profile.get("displayName"),
                        "description": profile.get("description"),
                        "profile_url": profile.get("profileUrl"),
                        "avatar_url": profile.get("avatarUrl"),
                        "job_title": profile.get("jobTitle"),
                        "company": profile.get("company"),
                        "location": profile.get("location")
                    }
                )

        except Exception as e:

            return ConnectorResult(
                source="Gravatar",
                success=False,
                error=repr(e)
            )