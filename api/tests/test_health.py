"""
Tests for the health endpoint.

A test is a small program that uses our code and checks the answer.
If the answer is wrong, the test fails and tells us exactly what broke.
"""
from fastapi.testclient import TestClient

from app.main import app

# TestClient is a pretend browser that talks to our app directly,
# without starting the real server.
client = TestClient(app)


def test_health_says_ok():
    response = client.get("/api/v1/health")      # visit the address

    assert response.status_code == 200           # 200 means "OK, success"
    assert response.json()["status"] == "ok"     # the answer says "ok"
