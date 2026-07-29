from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from src.core.security import decode_access_token
from src.services.auth_service import AuthService
from src.dependencies.db import get_auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service)
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token payload format")

    user = auth_service.get_user_by_id(user_id)
    return user
