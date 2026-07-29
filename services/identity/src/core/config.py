import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Identity Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "local")
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://bankos_admin:bankos_local_secret@localhost:5432/identity_db"
    )
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "dev-secret-key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
