"""Basic login feature: register / login / lookup-current-user.

Deliberately simple -- no email verification, password reset, OAuth, etc.
This is meant to give the app a login gate and let cases/watchlist entries
be scoped to a user, not to be a production auth system.
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.mongo import users_collection
from app.utils.security import hash_password, verify_password, create_access_token


class AuthError(Exception):
    pass


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "created_at": doc["created_at"],
    }


class AuthService:

    async def register(self, name: str, email: str, password: str) -> dict:
        col = users_collection()
        email = email.lower().strip()

        existing = await col.find_one({"email": email})
        if existing:
            raise AuthError("An account with this email already exists.")

        doc = {
            "name": name.strip(),
            "email": email,
            "password_hash": hash_password(password),
            "created_at": datetime.now(timezone.utc),
        }

        inserted = await col.insert_one(doc)
        doc["_id"] = inserted.inserted_id

        user = _serialize(doc)
        token = create_access_token(subject=user["id"])

        return {"access_token": token, "token_type": "bearer", "user": user}

    async def login(self, email: str, password: str) -> dict:
        col = users_collection()
        email = email.lower().strip()

        doc = await col.find_one({"email": email})

        if not doc or not verify_password(password, doc["password_hash"]):
            raise AuthError("Incorrect email or password.")

        user = _serialize(doc)
        token = create_access_token(subject=user["id"])

        return {"access_token": token, "token_type": "bearer", "user": user}

    async def get_user(self, user_id: str) -> dict | None:
        col = users_collection()

        try:
            oid = ObjectId(user_id)
        except InvalidId:
            return None

        doc = await col.find_one({"_id": oid})
        return _serialize(doc) if doc else None
