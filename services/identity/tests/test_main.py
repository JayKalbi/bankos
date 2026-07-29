from fastapi.testclient import TestClient
from src.main import app

import uuid

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200

def test_auth_flow():
    # Use random username to avoid collisions across test runs
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    test_cred = f"Secret{uuid.uuid4().hex[:8]}!"

    # 1. Register User
    register_res = client.post("/auth/register", json={"username": username, "password": test_cred})
    assert register_res.status_code == 200
    user_data = register_res.json()
    assert user_data["username"] == username
    assert "id" in user_data

    # 2. Duplicate Registration should fail
    dup_res = client.post("/auth/register", json={"username": username, "password": test_cred})
    assert dup_res.status_code == 400
    assert dup_res.json()["detail"] == "Username already registered"

    # 3. Invalid Login should fail
    bad_login_res = client.post("/auth/login", data={"username": username, "password": "wrong_value"})
    assert bad_login_res.status_code == 401

    # 4. Successful Login
    login_res = client.post("/auth/login", data={"username": username, "password": test_cred})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]

    # 5. Get Current User (Protected Endpoint)
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["username"] == username
    assert me_data["id"] == user_data["id"]

    # 6. Invalid Token
    bad_me_res = client.get("/auth/me", headers={"Authorization": f"Bearer invalid_token"})
    assert bad_me_res.status_code == 401
