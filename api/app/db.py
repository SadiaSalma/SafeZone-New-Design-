"""
db.py - the ONE place that connects to MongoDB.

Other files never create their own connection. They do:
    from app.db import get_db
    reports = get_db()["reports"]

Words:
  client      - the connection to the MongoDB server (one for the whole app)
  database    - a named group of collections, ours is "safezone"
  collection  - like a table, e.g. "users", "reports"
  document    - one record, like {"name": "Rahim", "phone": "+8801..."}
"""
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.config import settings

# Created once. PyMongo connects "lazily": nothing happens until the first real query.
# serverSelectionTimeoutMS=2000 -> give up after 2 seconds if the database is not running.
# tz_aware=True -> dates come back with their time zone (we store everything in UTC).
client: MongoClient = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000, tz_aware=True)


def get_db() -> Database:
    """Return the SafeZone database (its name comes from MONGODB_DB in .env)."""
    return client[settings.mongodb_db]


def database_status() -> dict:
    """Ask the database 'are you alive?'. Used by the health check.

    Never raises: if the database is down it returns {"ok": False, ...}.
    """
    try:
        hello = client.admin.command("hello")  # a quick, harmless question to the server
        return {"ok": True, "name": settings.mongodb_db, "replica_set": hello.get("setName")}
    except PyMongoError:
        return {"ok": False, "name": settings.mongodb_db, "replica_set": None}
