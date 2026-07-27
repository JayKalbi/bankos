import os
import time
import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from pydantic import BaseModel
import jwt
from prometheus_client import make_asgi_app
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

# Setup Logging
logger = logging.getLogger("identity_service")
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

app = FastAPI(title="Identity Service", version="1.0.0")

# Prometheus Metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Database Setup
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/identity_db")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-key")

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning("Database not available on startup")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = request.headers.get("x-request-id", "unknown")
    logger.info(f"Incoming Request: {request.method} {request.url.path} [ReqID: {request_id}]")
    response = await call_next(request)
    return response

@app.get("/health")
def health():
    return {"status": "UP"}
@app.get("/ready")
def ready():
    return {"status": "READY"}
@app.get("/live")
def live():
    return {"status": "ALIVE"}

@app.post("/auth/login")
def login(req: LoginRequest):
    # Mock authentication for walking skeleton
    if req.username == "demo" and req.password == "password":
        token = jwt.encode({"sub": "customer_1001", "role": "USER", "exp": int(time.time()) + 3600}, JWT_SECRET, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")