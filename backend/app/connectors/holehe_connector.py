import asyncio
import json
import tempfile
from pathlib import Path

from app.models.connector import ConnectorResult


class HoleheConnector:

    async def lookup(self, email: str) -> ConnectorResult:

        try:

            with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:

                output_file = tmp.name

            process = await asyncio.create_subprocess_exec(
                "holehe",
                email,
                "--only-used",
                "--json",
                output_file,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            await process.communicate()

            if not Path(output_file).exists():

                return ConnectorResult(
                    source="Holehe",
                    success=False,
                    error="No output generated"
                )

            with open(output_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            Path(output_file).unlink(missing_ok=True)

            return ConnectorResult(
                source="Holehe",
                success=True,
                data=data
            )

        except Exception as e:

            return ConnectorResult(
                source="Holehe",
                success=False,
                error=str(e)
            )