from typing import Optional
from sqlalchemy.orm import Session
from src.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_username(self, username: str) -> Optional[User]:
        if not self.db:
            return None
        try:
            return self.db.query(User).filter(User.username == username).first()
        except Exception:
            return None
