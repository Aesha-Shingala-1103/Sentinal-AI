"""Image correlation service (reverse-image-search bonus objective).

Rather than running invasive internet-wide facial recognition against a
target photo -- which is how tools like Clearview/PimEyes work and raises
serious surveillance concerns -- this takes a narrower, defensible
approach that is still genuinely useful for investigators: it downloads
the profile/avatar images that OTHER connectors already discovered
(GitHub avatar, Gravatar avatar, matched social profiles) and computes a
perceptual hash (pHash) for each one. Images that hash to near-identical
values are almost certainly the same photo reused across platforms --
a strong, explainable identity-correlation signal -- without doing
biometric face matching against the open web.

If you want true reverse-image search (find *other* pages using this
photo), the connector is intentionally pluggable: set
GOOGLE_VISION_API_KEY to enable Google Cloud Vision's Web Detection
endpoint, which is a documented, legitimate API for this and will be
picked up automatically.
"""

import asyncio
import os

import httpx

from app.connectors.vision_reverse_image import VisionWebDetectionConnector

try:
    import imagehash
    from PIL import Image
    import io
    HASHING_AVAILABLE = True
except ImportError:  # pragma: no cover
    HASHING_AVAILABLE = False


HEADERS = {"User-Agent": "Sentinel-AI-OSINT/1.0"}


async def _fetch_and_hash(client: httpx.AsyncClient, label: str, url: str):
    try:
        response = await client.get(url, headers=HEADERS, timeout=10, follow_redirects=True)
        response.raise_for_status()

        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        phash = imagehash.phash(image)

        return {"label": label, "url": url, "hash": str(phash), "ok": True}

    except Exception as e:  # noqa: BLE001
        return {"label": label, "url": url, "hash": None, "ok": False, "error": str(e)}


def _extract_image_candidates(sources: list) -> list[dict]:
    """Pull every plausible profile-image URL out of already-collected
    connector results."""

    candidates = []

    for result in sources:
        if not result.get("success"):
            continue

        source = result["source"]
        data = result.get("data") or {}

        if source == "GitHub" and data.get("avatar_url"):
            candidates.append({"label": f"GitHub ({data.get('login')})", "url": data["avatar_url"]})

        elif source == "Gravatar" and data.get("avatar_url"):
            candidates.append({"label": "Gravatar", "url": data["avatar_url"]})

    return candidates


async def correlate_images(sources: list) -> dict:

    if not HASHING_AVAILABLE:
        return {
            "enabled": False,
            "reason": "imagehash/Pillow not installed on server.",
            "images": [],
            "matches": [],
        }

    candidates = _extract_image_candidates(sources)

    vision_key = os.getenv("GOOGLE_VISION_API_KEY")

    if not candidates:
        return {
            "enabled": True,
            "images": [],
            "matches": [],
            "reverse_search_configured": bool(vision_key),
        }

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[
            _fetch_and_hash(client, c["label"], c["url"]) for c in candidates
        ])

    hashed = [r for r in results if r["ok"]]

    # Compare every pair; small Hamming distance == visually near-identical image
    matches = []
    for i in range(len(hashed)):
        for j in range(i + 1, len(hashed)):
            h1 = imagehash.hex_to_hash(hashed[i]["hash"])
            h2 = imagehash.hex_to_hash(hashed[j]["hash"])
            distance = h1 - h2

            if distance <= 8:  # near-identical perceptual hash
                matches.append({
                    "a": hashed[i]["label"],
                    "b": hashed[j]["label"],
                    "hamming_distance": distance,
                    "confidence": max(0, round(100 - distance * 8)),
                })

    return {
        "enabled": True,
        "images": results,
        "matches": matches,
        "reverse_search_configured": bool(vision_key),
        "reverse_search": await _run_reverse_search(candidates, vision_key),
    }


async def _run_reverse_search(candidates: list[dict], vision_key: str | None) -> dict | None:
    """If GOOGLE_VISION_API_KEY is set, run true reverse-image search
    (find other pages/images matching this photo) on the first discovered
    avatar. Returns None if not configured or no candidates."""

    if not vision_key or not candidates:
        return None

    connector = VisionWebDetectionConnector()
    result = await connector.lookup_by_url(candidates[0]["url"])

    return {"source_image": candidates[0]["url"], **result}
