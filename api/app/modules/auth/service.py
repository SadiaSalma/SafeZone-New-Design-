"""
service.py (auth) - the real work and the business rules for accounts.

Sign-up steps (FR-1 with revision R1):
  1. Limit: max registrations per hour from one device (R9).
  2. The phone and email must not already be registered.
  3. Save the user with an Argon2 password hash, status "pending_verify",
     and write an audit log entry - both in ONE transaction.
  4. Create a 6-digit code (max 3 per hour per email) and deliver it.

Confirm-code steps (Task 8): the code must match, not be expired, and have
fewer than 5 wrong tries. Then the account becomes "active" and the person is
logged in straight away.

Log-in steps (FR-2): phone + password -> two tickets (see security.py).
A wrong phone and a wrong password get the SAME answer (R9), so nobody can
use the log-in form to find out which phone numbers have accounts.
"""
from datetime import datetime, timedelta, timezone

from pymongo.errors import DuplicateKeyError

from app.audit import write_audit
from app.config import settings
from app.db import client
from app.errors import AppError
from app.notify import mask_email, send_code
from app.ratelimit import check_limit
from app.security import (
    code_matches,
    create_access_token,
    hash_code,
    hash_password,
    hash_token,
    new_code,
    new_refresh_token,
    verify_password,
)
from app.modules.auth import repository
from app.modules.auth.schemas import LoginIn, RegisterIn, VerifyIn

ONE_HOUR = 3600

# Used when the phone number is unknown, so a wrong phone takes as long to check
# as a wrong password (otherwise attackers could tell them apart by timing).
_DUMMY_HASH = hash_password("not-a-real-account-0")


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


def verify_code(data: VerifyIn, user_agent: str) -> tuple[dict, dict]:
    """Check the sign-up code. On success: activate the account and log the person in."""
    now = datetime.now(timezone.utc)
    user = repository.find_user_by_email(data.email)
    if user and user["status"] == "active":
        raise AppError(409, "already_verified", "This account is already confirmed. Please log in.")

    code = repository.find_open_code(data.email, "register")
    if not user or not code or code["expires_at"] <= now:
        raise AppError(400, "code_invalid", "This code is wrong or has expired. Ask for a new one.")

    if not code_matches(data.code, data.email, "register", code["code_hash"]):
        tries = repository.count_wrong_try(code["_id"])
        left = settings.max_code_attempts - tries
        if left <= 0:
            repository.delete_code(code["_id"])  # too many guesses: this code is finished
            raise AppError(400, "code_invalid", "Too many wrong tries. Ask for a new code.")
        raise AppError(400, "wrong_code", f"Wrong code. {left} tries left.",
                       {"code": f"Wrong code. {left} tries left."})

    # Correct code: mark it used + activate the account + audit, all together.
    with client.start_session() as session:
        with session.start_transaction():
            repository.mark_code_used(code["_id"], now, session=session)
            repository.activate_user(user["_id"], now, session=session)
            write_audit("user.verify", "users", entity_id=user["_id"], actor_id=user["_id"],
                        actor_role=user["role"], session=session)

    user = repository.find_user_by_id(user["_id"])
    return user, _start_session(user, user_agent)


def login(data: LoginIn, user_agent: str) -> tuple[dict, dict]:
    """Check phone + password and give out the log-in tickets."""
    user = repository.find_user_by_phone(data.phone)
    password_ok = verify_password(data.password, user["password_hash"] if user else _DUMMY_HASH)
    if not user or not password_ok:
        raise AppError(401, "wrong_login", "Phone number or password is wrong.")

    if user["status"] == "pending_verify":
        raise AppError(403, "account_not_verified",
                       "Confirm your account first with the 6-digit code we sent to your email.")
    if user["status"] != "active":
        raise AppError(403, "account_unavailable", "This account cannot log in. Contact SafeZone staff.")

    write_audit("user.login", "users", entity_id=user["_id"], actor_id=user["_id"], actor_role=user["role"])
    return user, _start_session(user, user_agent)


def public_user(user: dict) -> dict:
    """Only the fields the website may see (never the password hash)."""
    return {
        "id": str(user["_id"]),
        "name_en": user["name_en"],
        "name_bn": user.get("name_bn", ""),
        "phone": user["phone"],
        "email": user["email"],
        "role": user["role"],
        "status": user["status"],
        "nid_added": bool(user.get("nid_hash")),
        "nid_last4": user.get("nid_last4"),
    }


# ---------------------------------------------------------------- helpers
def _start_session(user: dict, user_agent: str) -> dict:
    """Create the two log-in tickets. Only a hash of the long ticket is saved."""
    refresh = new_refresh_token()
    repository.insert_session(
        user["_id"],
        hash_token(refresh),
        datetime.now(timezone.utc) + timedelta(days=settings.refresh_days),
        user_agent,
    )
    return {"access": create_access_token(str(user["_id"]), user["role"]), "refresh": refresh}


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
