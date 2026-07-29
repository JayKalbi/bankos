import logging
from fastapi import FastAPI
from prometheus_client import make_asgi_app
from src.core.config import settings
from src.middleware.logging import RequestLoggingMiddleware
from src.api import health, auth

# Setup Logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("identity_service.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Identity & Authentication Service"
)

# Middleware
app.add_middleware(RequestLoggingMiddleware)

# Prometheus Metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# API Routers
app.include_router(health.router)
app.include_router(auth.router)

logger.info(f"Started {settings.PROJECT_NAME} v{settings.VERSION}")
