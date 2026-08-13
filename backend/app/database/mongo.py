"""Database layer and persistence.

Uses Motor (the async MongoDB driver) against MONGO_URI. If MONGO_URI isn't
set, this automatically falls back to an in-process, in-memory Mongo-
compatible store (`mongomock_motor`) with the exact same async API -- so
cases, watchlist, and auth all work out of the box for local dev/demo
without anyone needing to stand up a cluster first. Nothing in `app/`
outside this file needs to know which backend is active. The in-memory
store does not persist across restarts; plug in a real MONGO_URI (e.g. a
free MongoDB Atlas cluster) for anything that needs to survive a restart
or be shared across the team.
"""

import logging
import os

logger = logging.getLogger("sentinel.database")

_client = None
_db = None
_using_memory_fallback = False


def _connect():
    global _client, _db, _using_memory_fallback

    mongo_uri = os.getenv("MONGO_URI", "").strip()

    if mongo_uri:
        from motor.motor_asyncio import AsyncIOMotorClient

        _client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
        _db = _client.get_default_database()

        if _db is None:
            _db = _client["sentinel_ai"]

        _using_memory_fallback = False
        logger.info("Connected to MongoDB (MONGO_URI configured).")

    else:
        from mongomock_motor import AsyncMongoMockClient

        _client = AsyncMongoMockClient()
        _db = _client["sentinel_ai"]
        _using_memory_fallback = True
        logger.warning(
            "MONGO_URI not set -- using an in-memory database. "
            "Cases/watchlist/users will NOT survive a server restart. "
            "Set MONGO_URI in backend/.env to persist data."
        )


def get_db():
    global _db

    if _db is None:
        _connect()

    return _db


def is_memory_fallback() -> bool:
    if _db is None:
        _connect()
    return _using_memory_fallback


async def check_connection() -> dict:
    """Used on startup and by a /health-style check to report real DB
    status instead of assuming a configured URI actually works."""

    db = get_db()

    if is_memory_fallback():
        return {"connected": True, "mode": "in-memory (dev fallback)", "persistent": False}

    try:
        await db.command("ping")
        return {"connected": True, "mode": "mongodb", "persistent": True}
    except Exception as e:  # noqa: BLE001
        return {"connected": False, "mode": "mongodb", "persistent": True, "error": str(e)}


def cases_collection():
    return get_db()["cases"]


def watchlist_collection():
    return get_db()["watchlist"]


def alerts_collection():
    return get_db()["alerts"]


def users_collection():
    return get_db()["users"]
