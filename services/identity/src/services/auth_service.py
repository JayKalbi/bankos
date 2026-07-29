from fastapi import HTTPException
from src.schemas.auth import LoginRequest, TokenResponse, RegisterRequest
from src.core.security import verify_password, create_access_token
from src.repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def authenticate_user(self, username: str, password: str) -> TokenResponse:
        user = self.user_repo.get_user_by_username(username)

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        subject = str(user.id)
        role = "USER"

        token = create_access_token(subject=subject, role=role)
        return TokenResponse(access_token=token)

    def register_user(self, req: RegisterRequest) -> dict:
        existing_user = self.user_repo.get_user_by_username(req.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        from src.models.user import User
        from src.core.security import get_password_hash

        new_user = User(
            username=req.username,
            password_hash=get_password_hash(req.password)
        )
        created_user = self.user_repo.create_user(new_user)
        return {"id": created_user.id, "username": created_user.username}

    def get_user_by_id(self, user_id: int):
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
