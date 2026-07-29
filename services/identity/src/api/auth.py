from fastapi import APIRouter, Depends
from src.schemas.auth import LoginRequest, TokenResponse
from src.services.auth_service import AuthService
from src.dependencies.db import get_auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.authenticate_user(req)
