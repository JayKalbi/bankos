from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200

def test_evaluate():
    response = client.post("/evaluate", json={"customerId": "customer_1001", "requestedAmount": 5000})
    assert response.status_code == 200
    assert response.json()["decision"] == "APPROVED"
