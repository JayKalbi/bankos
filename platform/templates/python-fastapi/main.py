from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="BankOS Service", description="Enterprise Microservice Template", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "UP"}