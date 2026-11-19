"""
service.py (users) - "my account" rules.

NID (national ID) number, as decided for SafeZone:
  - Only the FORMAT is checked (10, 13 or 17 digits). Real checks with the
    Election Commission need a government agreement and cost money, so they
    are out of scope for a free student project (NFR-6).
  - One NID can belong to only ONE account.
  - The NID is stored scrambled (nid_hash) + its last 4 digits for display.
  - It is required before a person's FIRST theft report (checked in the report task).
"""
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.audit import write_audit
from app.config import settings
from app.db import get_db
from app.errors import AppError
from app.ratelimit import check_limit
from app.security import hash_nid


def add_nid(user: dict, nid: str) -> dict:
    """Link an NID number to the logged-in user. Returns the updated user."""
    check_limit(f"nid:{user['_id']}", settings.nid_tries_per_hour, 3600)
    if user.get("nid_hash"):
        raise AppError(409, "nid_already_added", "Your account already has an NID. Contact staff to change it.")

    users = get_db()["users"]
    try:
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"nid_hash": hash_nid(nid), "nid_last4": nid[-4:],
                      "nid_added_at": datetime.now(timezone.utc)}},
        )
    except DuplicateKeyError:
        raise AppError(409, "nid_in_use", "This NID is already linked to another account.",
                       {"nid": "This NID is already linked to another account."})

    write_audit("user.nid_add", "users", entity_id=user["_id"], actor_id=user["_id"],
                actor_role=user["role"], after={"changed": ["nid"]})  # R8: never the number itself
    return users.find_one({"_id": user["_id"]})


def has_nid(user: dict) -> bool:
    """Used by the report task: a person must add an NID before the first report."""
    return bool(user.get("nid_hash"))
