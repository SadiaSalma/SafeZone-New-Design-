"""
repository.py (auth) - the ONLY place in this module that reads or writes MongoDB.

Keeping database code here keeps service.py readable,
and lets tests check each part separately (design doc, Section 3.3).
"""
from datetime import datetime

from bson import ObjectId

from app.db import get_db


def find_users_with_phone_or_email(phone: str, email: str) -> list[dict]:
    return list(get_db()["users"].find({"$or": [{"phone": phone}, {"email": email}]}, {"phone": 1, "email": 1}))


def find_user_by_email(email: str) -> dict | None:
    return get_db()["users"].find_one({"email": email})


def insert_user(user: dict, session=None) -> ObjectId:
    return get_db()["users"].insert_one(user, session=session).inserted_id


def replace_unused_codes(target: str, purpose: str) -> None:
    """A new code makes older, unused codes for the same purpose useless."""
    get_db()["otp_codes"].delete_many({"target": target, "purpose": purpose, "used_at": None})


def insert_code(target: str, channel: str, purpose: str, code_hash: str, expires_at: datetime, now: datetime) -> None:
    get_db()["otp_codes"].insert_one(
        {
            "target": target,
            "channel": channel,
            "purpose": purpose,
            "code_hash": code_hash,  # only the scrambled code, never the code itself
            "attempts": 0,
            "expires_at": expires_at,  # MongoDB deletes the code automatically after this time
            "used_at": None,
            "created_at": now,
        }
    )
