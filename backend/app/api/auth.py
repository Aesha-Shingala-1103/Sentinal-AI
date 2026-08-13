from fastapi import APIRouter, Depends, HTTPException

from app.models.user import UserRegister, UserLogin, TokenResponse, UserPublic
from app.services.auth_service import AuthService, AuthError
from app.utils.deps import get_current_user

router = APIRouter()
service = AuthService()


@router.post("/auth/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    try:
        return await service.register(payload.name, payload.email, payload.password)
    except AuthError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    try:
        return await service.login(payload.email, payload.password)
    except AuthError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/auth/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
