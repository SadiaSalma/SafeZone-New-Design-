"""
Tests for the health endpoint.

A test is a small program that uses our code and checks the answer.
If the answer is wrong, the test fails and tells us exactly what broke.

These tests must pass whether or not the database is running, so we
"pretend" the database is up (monkeypatch). The real database checks
live in test_db.py.
"""
from fastapi.testclient import TestClient

from app import main

# TestClient is a pretend browser that talks to our app directly,
# without starting the real server.
client = TestClient(main.app)


def test_health_says_ok(monkeypatch):
    # Pretend the database answered "I'm fine"
    monkeypatch.setattr(main, "database_status", lambda: {"ok": True, "name": "safezone", "replica_set": "rs0"})

    response = client.get("/api/v1/health")  # visit the address

    assert response.status_code == 200  # 200 means "OK, success"
    assert response.json()["status"] == "ok"  # the answer says "ok"


def test_health_always_answers_even_without_database():
    # Whatever the database is doing, the backend itself must still answer
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] in {"ok", "degraded"}


def test_docs_page_adds_the_safety_header_for_try_it_out():
    page = client.get("/docs")
    assert page.status_code == 200
    assert "req.headers['X-SafeZone'] = '1'" in page.text
