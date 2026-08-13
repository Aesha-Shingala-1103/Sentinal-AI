"""FastAPI dependency that resolves the current user from a Bearer token.

`get_current_user` is required (401s if missing/invalid). `get_optional_user`
is used on routes that should work for anonymous users too but personalize
behavior when logged in -- none of the OSINT investigation endpoints
require login (the tool should still work for a quick anonymous lookup);
only case/watchlist ownership uses `get_current_user`.
"""

from fastapi import Header, HTTPException

from app.services.auth_service import AuthService
from app.utils.security import decode_access_token

_auth_service = AuthService()


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user = await _auth_service.get_user(payload["sub"])

    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")

    return user


async def get_optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization:
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
