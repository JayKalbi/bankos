import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from src.core.config import settings

logger = logging.getLogger("identity_service.middleware")
logger.setLevel(settings.LOG_LEVEL)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id", "unknown")
        logger.info(f"Incoming Request: {request.method} {request.url.path} [ReqID: {request_id}]")
        response = await call_next(request)
        return response
