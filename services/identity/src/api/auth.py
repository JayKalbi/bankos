from fastapi import APIRouter, Depends
from src.schemas.auth import LoginRequest, TokenResponse, RegisterRequest, UserResponse
from src.services.auth_service import AuthService
from src.dependencies.db import get_auth_service
from src.dependencies.auth import get_current_user
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
def register(req: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.register_user(req)

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=TokenResponse)
def login(req: OAuth2PasswordRequestForm = Depends(), auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.authenticate_user(req.username, req.password)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
