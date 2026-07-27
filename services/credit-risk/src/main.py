import os
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from confluent_kafka import Producer

logger = logging.getLogger("credit_risk")
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

app = FastAPI(title="Credit Risk Service", version="1.0.0")

# Prometheus Metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092")
TOPIC = "risk.events.v1"

try:
    producer = Producer({'bootstrap.servers': KAFKA_BROKERS})
except Exception as e:
    logger.warning("Kafka not available on startup")
    producer = None

class EvaluationRequest(BaseModel):
    customerId: str
    requestedAmount: float

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = request.headers.get("x-request-id", "unknown")
    logger.info(f"Incoming Request: {request.method} {request.url.path} [ReqID: {request_id}]")
    response = await call_next(request)
    return response

@app.get("/health")
def health(): return {"status": "UP"}
@app.get("/ready")
def ready(): return {"status": "READY"}
@app.get("/live")
def live(): return {"status": "ALIVE"}

@app.post("/evaluate")
def evaluate_risk(req: EvaluationRequest):
    # Mock Risk Engine Logic
    risk_score = 750 if req.requestedAmount < 10000 else 600
    decision = "APPROVED" if risk_score > 700 else "REJECTED"
    
    event = {
        "customerId": req.customerId,
        "requestedAmount": req.requestedAmount,
        "riskScore": risk_score,
        "decision": decision
    }
    
    if producer:
        try:
            producer.produce(TOPIC, key=req.customerId, value=json.dumps(event))
            producer.flush()
            logger.info(f"Published RiskEvent to {TOPIC}")
        except Exception as e:
            logger.error(f"Failed to publish to Kafka: {e}")
            
    return event