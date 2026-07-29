from fastapi import HTTPException
from src.schemas.auth import LoginRequest, TokenResponse
from src.core.security import verify_password, create_access_token
from src.repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def authenticate_user(self, req: LoginRequest) -> TokenResponse:
        # Check DB first
        user = self.user_repo.get_user_by_username(req.username)

        if user:
            if not verify_password(req.password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            subject = str(user.id)
            role = "USER"
        else:
            # Mock authentication fallback for walking skeleton
            if req.username == "demo" and req.password == "password":
                subject = "customer_1001"
                role = "USER"
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(subject=subject, role=role)
        return TokenResponse(access_token=token)
