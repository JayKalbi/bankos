from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200

def test_login_success():
    response = client.post("/auth/login", json={"username": "demo", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.json()