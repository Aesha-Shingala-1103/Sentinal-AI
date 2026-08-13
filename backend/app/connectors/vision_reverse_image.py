"""True reverse-image search via Google Cloud Vision's Web Detection API.

This is Google's own documented, legitimate endpoint for "find pages that
use this image" and "find visually similar images" -- the actual reverse-
image-search bonus objective, as opposed to the perceptual-hash same-photo
detection in image_correlation_service.py (which needs no key at all).
Requires GOOGLE_VISION_API_KEY; returns "not configured" without one
rather than failing.
"""

import os

import httpx


class VisionWebDetectionConnector:

    ENDPOINT = "https://vision.googleapis.com/v1/images:annotate"

    async def lookup_by_url(self, image_url: str) -> dict:

        api_key = os.getenv("GOOGLE_VISION_API_KEY")

        if not api_key:
            return {
                "success": False,
                "error": "GOOGLE_VISION_API_KEY not configured.",
            }

        body = {
            "requests": [
                {
                    "image": {"source": {"imageUri": image_url}},
                    "features": [{"type": "WEB_DETECTION", "maxResults": 15}],
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    self.ENDPOINT,
                    params={"key": api_key},
                    json=body,
                )

            response.raise_for_status()
            data = response.json()

            annotation = data.get("responses", [{}])[0].get("webDetection", {})

            return {
                "success": True,
                "data": {
                    "full_matching_images": [
                        m.get("url") for m in annotation.get("fullMatchingImages", [])
                    ],
                    "pages_with_matching_images": [
                        {"url": p.get("url"), "title": p.get("pageTitle")}
                        for p in annotation.get("pagesWithMatchingImages", [])
                    ],
                    "visually_similar_images": [
                        m.get("url") for m in annotation.get("visuallySimilarImages", [])
                    ],
                    "best_guess_labels": [
                        g.get("label") for g in annotation.get("bestGuessLabels", [])
                    ],
                },
            }

        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}
