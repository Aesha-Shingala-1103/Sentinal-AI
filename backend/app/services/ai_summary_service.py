import os
import json
from google import genai


class AISummaryService:

    async def summarize(self, query: str, query_type: str, sources: list):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            return {
                "risk_level": "Unknown",
                "summary": "Gemini API key not configured.",
                "key_findings": [],
                "recommendations": []
            }

        try:

            client = genai.Client(
                api_key=api_key
            )

            prompt = f"""
You are an OSINT Investigation Analyst.

Target:
{query}

Type:
{query_type}

Collected Data:
{json.dumps(sources, indent=2)}

Return ONLY JSON in this format:

{{
    "risk_level":"",
    "summary":"",
    "key_findings":[],
    "recommendations":[]
}}
"""

            import asyncio

            response = None

            for attempt in range(3):
                try:
                    response = client.models.generate_content(
                        model="gemini-flash-latest",
                        contents=prompt
                    )
                    break

                except Exception as e:
                    if "503" in str(e):
                        await asyncio.sleep(3)
                        continue
                    raise

            if response is None:
                raise Exception("Gemini unavailable after 3 retries.")

            print("\n========== GEMINI RAW RESPONSE ==========")
            print(response.text)
            print("=========================================\n")

            text = response.text.strip()

            text = (
                text.replace("```json", "")
                    .replace("```", "")
                    .strip()
            )

            return json.loads(text)

        except Exception as e:

            return {
                "risk_level": "Unknown",
                "summary": "Unable to generate AI summary.",
                "key_findings": [],
                "recommendations": [],
                "error": str(e)
            }