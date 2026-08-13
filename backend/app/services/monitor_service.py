"""Automatic monitoring/alerting for saved entities (bonus objective).

A watched target is re-investigated on a schedule (APScheduler background
job). If new correlated entities show up that weren't present in the
previous snapshot, an alert is written to Mongo. This is intentionally a
single-process, in-memory-scheduled job -- fine for a hackathon deployment;
swap for a real task queue (Celery/RQ) if this needs to survive restarts
or scale across workers.
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.mongo import watchlist_collection, alerts_collection


class MonitorServiceUnavailable(Exception):
    pass


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


class MonitorService:

    async def add(self, query: str, type_: str, interval_hours: int, label: str | None, user_id: str | None = None) -> dict:
        col = watchlist_collection()
        if col is None:
            raise MonitorServiceUnavailable("MONGO_URI not configured.")

        doc = {
            "query": query,
            "type": type_,
            "interval_hours": interval_hours,
            "label": label,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc),
            "last_checked": None,
            "entity_count_baseline": 0,
            "known_entity_ids": [],
        }

        inserted = await col.insert_one(doc)
        doc["_id"] = inserted.inserted_id
        return _serialize(doc)

    async def list_all(self, user_id: str | None = None) -> list[dict]:
        col = watchlist_collection()
        if col is None:
            raise MonitorServiceUnavailable("MONGO_URI not configured.")

        query_filter = {"user_id": user_id}
        docs = await col.find(query_filter).to_list(length=200)
        return [_serialize(d) for d in docs]

    async def remove(self, watch_id: str, user_id: str | None = None) -> bool:
        col = watchlist_collection()
        if col is None:
            raise MonitorServiceUnavailable("MONGO_URI not configured.")

        try:
            oid = ObjectId(watch_id)
        except InvalidId:
            return False

        query_filter: dict = {"_id": oid, "user_id": user_id}

        result = await col.delete_one(query_filter)
        return result.deleted_count > 0

    async def list_alerts(self, unacknowledged_only: bool = False, user_id: str | None = None) -> list[dict]:
        col = alerts_collection()
        if col is None:
            raise MonitorServiceUnavailable("MONGO_URI not configured.")

        query_filter: dict = {"user_id": user_id}
        if unacknowledged_only:
            query_filter["acknowledged"] = False

        docs = await col.find(query_filter).sort("created_at", -1).to_list(length=200)
        return [_serialize(d) for d in docs]

    async def acknowledge_alert(self, alert_id: str, user_id: str | None = None) -> bool:
        col = alerts_collection()
        if col is None:
            raise MonitorServiceUnavailable("MONGO_URI not configured.")

        try:
            oid = ObjectId(alert_id)
        except InvalidId:
            return False

        query_filter: dict = {"_id": oid, "user_id": user_id}

        result = await col.update_one(query_filter, {"$set": {"acknowledged": True}})
        return result.matched_count > 0

    async def run_check(self, watch_doc: dict, investigate_fn) -> dict | None:
        """Re-runs the investigation for a watched target and raises an
        alert if new entities appeared since the last check. `investigate_fn`
        is InvestigationService.investigate, injected to avoid a circular
        import."""

        watch_col = watchlist_collection()
        alert_col = alerts_collection()
        if watch_col is None or alert_col is None:
            return None

        result = await investigate_fn(
            watch_doc["query"], watch_doc["type"], watch_doc.get("user_id")
        )

        current_ids = {
            e["id"] for e in result.get("correlation", {}).get("entities", [])
        }
        known_ids = set(watch_doc.get("known_entity_ids", []))
        new_ids = current_ids - known_ids

        await watch_col.update_one(
            {"_id": watch_doc["_id"]},
            {
                "$set": {
                    "last_checked": datetime.now(timezone.utc),
                    "known_entity_ids": list(current_ids),
                    "entity_count_baseline": len(current_ids),
                }
            },
        )

        if known_ids and new_ids:
            new_entities = [
                e for e in result.get("correlation", {}).get("entities", [])
                if e["id"] in new_ids
            ]

            alert_doc = {
                "watchlist_id": str(watch_doc["_id"]),
                "query": watch_doc["query"],
                "user_id": watch_doc.get("user_id"),
                "created_at": datetime.now(timezone.utc),
                "new_entities": new_entities,
                "message": f"{len(new_entities)} new entit"
                           f"{'y' if len(new_entities) == 1 else 'ies'} discovered for '{watch_doc['query']}'",
                "acknowledged": False,
            }

            inserted = await alert_col.insert_one(alert_doc)
            alert_doc["_id"] = inserted.inserted_id
            return _serialize(alert_doc)

        return None
