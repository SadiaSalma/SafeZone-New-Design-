"""
Tests for Task 5: the database connection.

The first test works without a database. The others need the project database
running (VS Code: Terminal -> Run Task -> "SafeZone: start database").
If it is not running, they are SKIPPED with a message saying what to do.
"""
import pytest
from fastapi.testclient import TestClient

from app import main
from app.db import database_status, get_db

client = TestClient(main.app)

needs_database = pytest.mark.skipif(
    not database_status()["ok"],
    reason="Database not running. Start it: Terminal -> Run Task -> 'SafeZone: start database'",
)


def test_health_says_degraded_when_database_is_down(monkeypatch):
    # Pretend the database is down (monkeypatch swaps the function just for this test)
    monkeypatch.setattr(main, "database_status", lambda: {"ok": False, "name": "x", "replica_set": None})
    body = client.get("/api/v1/health").json()
    assert body["status"] == "degraded"
    assert body["database"]["ok"] is False


@needs_database
def test_tests_use_the_test_database():
    assert get_db().name == "safezone_test"  # never the real "safezone"


@needs_database
def test_health_reports_database_and_replica_set():
    body = client.get("/api/v1/health").json()
    assert body["status"] == "ok"
    assert body["database"] == {"ok": True, "name": "safezone_test", "replica_set": "rs0"}


@needs_database
def test_write_read_and_delete_a_document():
    things = get_db()["practice"]
    things.delete_many({})

    result = things.insert_one({"thana": "Mirpur", "ward": 6})
    found = things.find_one({"_id": result.inserted_id})
    assert found["thana"] == "Mirpur" and found["ward"] == 6

    things.delete_one({"_id": result.inserted_id})
    assert things.count_documents({}) == 0


@needs_database
def test_transaction_is_all_or_nothing():
    """A transaction: two writes that both happen, or neither does (needs the replica set)."""
    db = get_db()
    db["practice"].delete_many({})

    # 1) Success: both documents are saved together
    with db.client.start_session() as session:
        with session.start_transaction():
            db["practice"].insert_one({"step": 1}, session=session)
            db["practice"].insert_one({"step": 2}, session=session)
    assert db["practice"].count_documents({}) == 2

    # 2) Failure half-way: the first write must be undone too
    with pytest.raises(RuntimeError):
        with db.client.start_session() as session:
            with session.start_transaction():
                db["practice"].insert_one({"step": 3}, session=session)
                raise RuntimeError("something went wrong in the middle")
    assert db["practice"].count_documents({}) == 2  # step 3 was rolled back

    db["practice"].delete_many({})
