"""
repository.py (auth) - the ONLY place in this module that reads or writes MongoDB.

Keeping database code here keeps service.py readable,
and lets tests check each part separately (design doc, Section 3.3).
"""
from datetime import datetime

from bson import ObjectId
from pymongo import ReturnDocument

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


def find_user_by_phone(phone: str) -> dict | None:
    return get_db()["users"].find_one({"phone": phone})


def find_user_by_id(user_id: ObjectId) -> dict | None:
    return get_db()["users"].find_one({"_id": user_id})


def find_open_code(target: str, purpose: str) -> dict | None:
    """The newest code for this person and purpose that has not been used yet."""
    return get_db()["otp_codes"].find_one({"target": target, "purpose": purpose, "used_at": None},
                                          sort=[("created_at", -1)])


def count_wrong_try(code_id: ObjectId) -> int:
    """Add 1 to the code's wrong-try counter and return the new number."""
    code = get_db()["otp_codes"].find_one_and_update(
        {"_id": code_id}, {"$inc": {"attempts": 1}}, return_document=ReturnDocument.AFTER
    )
    return code["attempts"] if code else 0


def delete_code(code_id: ObjectId) -> None:
    get_db()["otp_codes"].delete_one({"_id": code_id})


def mark_code_used(code_id: ObjectId, now: datetime, session=None) -> None:
    get_db()["otp_codes"].update_one({"_id": code_id}, {"$set": {"used_at": now}}, session=session)


def activate_user(user_id: ObjectId, now: datetime, session=None) -> None:
    get_db()["users"].update_one(
        {"_id": user_id, "status": "pending_verify"},
        {"$set": {"status": "active", "email_verified_at": now}},
        session=session,
    )


def insert_session(user_id: ObjectId, token_hash: str, expires_at: datetime, user_agent: str) -> None:
    """Save the long ticket (only its hash) so it can be checked and cancelled later."""
    get_db()["sessions"].insert_one(
        {"user_id": user_id, "token_hash": token_hash, "expires_at": expires_at,
         "revoked_at": None, "user_agent": user_agent[:300]}
    )


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
