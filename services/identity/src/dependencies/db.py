from fastapi import Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.repositories.user_repository import UserRepository
from src.services.auth_service import AuthService

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repo)
