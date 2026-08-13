"""GitHub profile and repository connector."""
import httpx

from app.connectors.base_connector import BaseConnector
from app.models.connector import ConnectorResult


class GitHubConnector(BaseConnector):

    async def lookup(self, username: str) -> ConnectorResult:

        url = f"https://api.github.com/users/{username}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(
                    url,
                    headers={
                        "Accept": "application/vnd.github+json",
                        "User-Agent": "Sentinel-AI"
                    }
                )

                if response.status_code == 404:
                    return ConnectorResult(
                        source="GitHub",
                        success=False,
                        error="User not found"
                    )

                response.raise_for_status()

                user = response.json()

                return ConnectorResult(
                    source="GitHub",
                    success=True,
                    data={
                        "login": user.get("login"),
                        "name": user.get("name"),
                        "bio": user.get("bio"),
                        "followers": user.get("followers"),
                        "following": user.get("following"),
                        "public_repos": user.get("public_repos"),
                        "company": user.get("company"),
                        "location": user.get("location"),
                        "blog": user.get("blog"),
                        "html_url": user.get("html_url"),
                        "avatar_url": user.get("avatar_url")
                    }
                )

        except Exception as e:
            return ConnectorResult(
                source="GitHub",
                success=False,
                error=repr(e)
            )