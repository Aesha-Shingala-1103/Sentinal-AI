"""Cross-case pattern linking (the "common link across investigations" ask).

When you run a new investigation, this checks your own saved cases for any
that share a correlated entity (same email, same wallet, same domain,
same discovered username, etc.) with the current one -- surfacing "you've
seen this before" connections an investigator would otherwise have to
remember or manually cross-reference. Read-only, scoped to the same
user_id as the current session (or the anonymous bucket), so it never
crosses between different investigators' cases.
"""

from app.database.mongo import cases_collection


async def find_related_cases(entities: list[dict], user_id: str | None, exclude_query: str | None = None, limit: int = 6) -> list[dict]:

    col = cases_collection()
    if col is None or not entities:
        return []

    values = list({e["value"] for e in entities if e.get("value")})
    if not values:
        return []

    try:
        cursor = col.find(
            {
                "user_id": user_id,
                "result.correlation.entities.value": {"$in": values},
                **({"query": {"$ne": exclude_query}} if exclude_query else {}),
            },
            projection={"result": 0},
        ).sort("updated_at", -1).limit(limit)

        docs = await cursor.to_list(length=limit)

    except Exception:  # noqa: BLE001
        # Mongo mock or older driver may not support all operators identically;
        # fail closed (no related cases) rather than break the investigation.
        return []

    related = []
    for d in docs:
        related.append({
            "id": str(d["_id"]),
            "query": d["query"],
            "type": d["type"],
            "updated_at": d["updated_at"],
            "tags": d.get("tags", []),
        })

    return related
