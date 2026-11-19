"""
service.py (auth) - the real work and the business rules for accounts.

Sign-up steps (FR-1 with revision R1):
  1. Limit: max registrations per hour from one device (R9).
  2. The phone and email must not already be registered.
  3. Save the user with an Argon2 password hash, status "pending_verify",
     and write an audit log entry - both in ONE transaction.
  4. Create a 6-digit code (max 3 per hour per email) and deliver it.
"""
from datetime import datetime, timedelta, timezone

from pymongo.errors import DuplicateKeyError

from app.audit import write_audit
from app.config import settings
from app.db import client
from app.errors import AppError
from app.notify import mask_email, send_code
from app.ratelimit import check_limit
from app.security import hash_code, hash_password, new_code
from app.modules.auth import repository
from app.modules.auth.schemas import RegisterIn

ONE_HOUR = 3600


def register(data: RegisterIn, ip: str) -> dict:
    check_limit(f"register:ip:{ip}", settings.registrations_per_hour_per_ip, ONE_HOUR)

    # Is the phone or email already used? Tell the person exactly which field.
    clashes = repository.find_users_with_phone_or_email(data.phone, data.email)
    if clashes:
        raise _already_registered(data, clashes)

    now = datetime.now(timezone.utc)
    user = {
        "name_en": data.name_en,
        "name_bn": data.name_bn or "",
        "phone": data.phone,
        "email": data.email,
        "email_verified_at": None,
        "password_hash": hash_password(data.password),  # never the real password
        "role": "victim",
        "status": "pending_verify",
        "failed_logins": 0,
        "locked_until": None,
        "created_at": now,
        "deleted_at": None,
    }

    # Save the user and the audit entry together: both happen, or neither does.
    try:
        with client.start_session() as session:
            with session.start_transaction():
                user_id = repository.insert_user(user, session=session)
                write_audit(
                    "user.register", "users", entity_id=user_id, actor_id=user_id, actor_role="victim",
                    after={"changed": ["name_en", "name_bn", "phone", "email"]},  # R8: names of fields only
                    session=session,
                )
    except DuplicateKeyError:  # someone registered the same phone/email at the same moment
        raise _already_registered(data, repository.find_users_with_phone_or_email(data.phone, data.email))

    demo_code = issue_code(data.email, "register")
    return {
        "user_id": str(user_id),
        "status": "pending_verify",
        "code_sent_to": mask_email(data.email),
        "channel": settings.otp_channel,
        "demo_code": demo_code,
        "message": "Account created. Enter the 6-digit code we sent to confirm it.",
    }


def issue_code(email: str, purpose: str) -> str | None:
    """Create, save and deliver a new code. Returns the code only in demo_screen mode."""
    check_limit(f"code:{purpose}:{email}", settings.codes_per_hour_per_target, ONE_HOUR)
    return _create_and_send(email, purpose)


def resend_code(email: str, purpose: str) -> dict:
    """Send a new code. The answer is the same whether or not the email exists,
    so nobody can use this to find out who has an account."""
    check_limit(f"code:{purpose}:{email}", settings.codes_per_hour_per_target, ONE_HOUR)
    user = repository.find_user_by_email(email)
    demo_code = None
    if user and user["status"] == "pending_verify":
        demo_code = _create_and_send(email, purpose)
    return {"message": "If an account is waiting for a code, we have sent a new one.", "demo_code": demo_code}


# ---------------------------------------------------------------- helpers
def _create_and_send(email: str, purpose: str) -> str | None:
    """Save a new code and deliver it. Returns the code only in demo_screen mode."""
    now = datetime.now(timezone.utc)
    code = new_code()
    repository.replace_unused_codes(email, purpose)
    repository.insert_code(
        target=email,
        channel=settings.otp_channel,
        purpose=purpose,
        code_hash=hash_code(code, email, purpose),
        expires_at=now + timedelta(minutes=settings.otp_minutes),
        now=now,
    )
    send_code(email, code, purpose)
    return code if settings.otp_channel == "demo_screen" else None


def _already_registered(data: RegisterIn, clashes: list[dict]) -> AppError:
    fields = {}
    if any(u.get("phone") == data.phone for u in clashes):
        fields["phone"] = "This phone number is already registered."
    if any(u.get("email") == data.email for u in clashes):
        fields["email"] = "This email is already registered."
    return AppError(409, "already_registered", "An account with these details already exists. Try logging in.", fields)
