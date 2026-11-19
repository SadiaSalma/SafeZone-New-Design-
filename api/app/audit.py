"""
audit.py - writes the audit log: a record of every important action (FR-27).

Design Revisions R8: the audit log can never be edited, so it must NOT hold
personal data. For personal fields we write only WHICH fields changed,
e.g. {"changed": ["name_en", "phone"]}, never the values themselves.
"""
from datetime import datetime, timezone

from bson import ObjectId

from app.db import get_db


def write_audit(
    action: str,
    entity: str,
    entity_id: ObjectId | None = None,
    actor_id: ObjectId | None = None,
    actor_role: str = "visitor",
    after: dict | None = None,
    session=None,
) -> None:
    """Add one line to the audit log. `session` lets it join a transaction."""
    get_db()["audit_logs"].insert_one(
        {
            "actor_id": actor_id,
            "actor_role": actor_role,
            "action": action,  # e.g. "user.register"
            "entity": entity,  # e.g. "users"
            "entity_id": entity_id,
            "after": after or {},
            "created_at": datetime.now(timezone.utc),
        },
        session=session,
    )
