"""Case-wise saving, tagging, and notes (functional requirement 4)."""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.mongo import cases_collection


class CaseServiceUnavailable(Exception):
    pass


def _require_collection():
    col = cases_collection()
    if col is None:
        raise CaseServiceUnavailable(
            "MONGO_URI is not configured on the server, so cases can't be persisted."
        )
    return col


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


class CaseService:

    async def create(self, query: str, type_: str, result: dict, tags: list[str], notes: str, user_id: str | None = None) -> dict:
        col = _require_collection()

        now = datetime.now(timezone.utc)

        doc = {
            "query": query,
            "type": type_,
            "result": result,
            "tags": tags or [],
            "notes": notes or "",
            "created_at": now,
            "updated_at": now,
            "user_id": user_id,
            "risk_level": (result or {}).get("risk", {}).get("level")
                or (result or {}).get("summary", {}).get("risk_level"),
        }

        inserted = await col.insert_one(doc)
        doc["_id"] = inserted.inserted_id

        return _serialize(doc)

    async def list_cases(self, tag: str | None = None, user_id: str | None = None) -> list[dict]:
        col = _require_collection()

        query_filter: dict = {"user_id": user_id}
        if tag:
            query_filter["tags"] = tag

        cursor = col.find(
            query_filter,
            projection={"result": 0},  # keep list view light
        ).sort("updated_at", -1)

        docs = await cursor.to_list(length=200)
        return [_serialize(d) for d in docs]

    async def get(self, case_id: str, user_id: str | None = None) -> dict | None:
        col = _require_collection()

        try:
            oid = ObjectId(case_id)
        except InvalidId:
            return None

        query_filter: dict = {"_id": oid, "user_id": user_id}

        doc = await col.find_one(query_filter)
        return _serialize(doc) if doc else None

    async def update_notes(self, case_id: str, notes: str, user_id: str | None = None) -> dict | None:
        col = _require_collection()

        try:
            oid = ObjectId(case_id)
        except InvalidId:
            return None

        query_filter: dict = {"_id": oid, "user_id": user_id}

        result = await col.update_one(
            query_filter,
            {"$set": {"notes": notes, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.matched_count == 0:
            return None
        return await self.get(case_id, user_id)

    async def update_tags(self, case_id: str, tags: list[str], user_id: str | None = None) -> dict | None:
        col = _require_collection()

        try:
            oid = ObjectId(case_id)
        except InvalidId:
            return None

        query_filter: dict = {"_id": oid, "user_id": user_id}

        result = await col.update_one(
            query_filter,
            {"$set": {"tags": tags, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.matched_count == 0:
            return None
        return await self.get(case_id, user_id)

    async def delete(self, case_id: str, user_id: str | None = None) -> bool:
        col = _require_collection()

        try:
            oid = ObjectId(case_id)
        except InvalidId:
            return False

        query_filter: dict = {"_id": oid, "user_id": user_id}

        result = await col.delete_one(query_filter)
        return result.deleted_count > 0
