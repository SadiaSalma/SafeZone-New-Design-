"""
security.py - SafeZone's safety tools.

1) Passwords: we NEVER save a real password. We save an Argon2 "hash":
   a one-way scramble. To check a login we scramble the typed password
   the same way and compare. Nobody (not even us) can turn a hash back
   into the password.

2) One-time codes (OTP): 6 random digits. We save only an HMAC of the code
   (another one-way scramble, mixed with our secret OTP_SECRET).

3) CSRF header check: requests that CHANGE data must carry X-SafeZone: 1
   (see the explanation further down).
"""
import hashlib
import hmac
import secrets

from fastapi import Request
from fastapi.responses import JSONResponse
from pwdlib import PasswordHash

from app.config import settings
from app.errors import error_body

# ---------------------------------------------------------------- passwords
_hasher = PasswordHash.recommended()  # Argon2, the current recommended method


def hash_password(password: str) -> str:
    """Turn a password into an Argon2 hash (looks like '$argon2id$v=19$...')."""
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """True if the typed password matches the saved hash."""
    return _hasher.verify(password, password_hash)


# ---------------------------------------------------------------- one-time codes
def new_code() -> str:
    """6 random digits, e.g. '048213'. 'secrets' is Python's safe random generator."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_code(code: str, target: str, purpose: str) -> str:
    """Scramble a code together with who it is for and why (so it can't be reused elsewhere)."""
    message = f"{purpose}:{target}:{code}".encode()
    return hmac.new(settings.otp_secret.encode(), message, hashlib.sha256).hexdigest()


def code_matches(code: str, target: str, purpose: str, saved_hash: str) -> bool:
    """Compare in constant time (so attackers can't guess codes by timing the answer)."""
    return hmac.compare_digest(hash_code(code, target, purpose), saved_hash)


# ---------------------------------------------------------------- CSRF header check
# CSRF ("cross-site request forgery") is a trick where a bad website makes your
# browser send a request to SafeZone without you knowing. Browsers do not let
# other websites add custom headers, so we require our own header
#     X-SafeZone: 1
# on every request that CHANGES data (POST, PUT, PATCH, DELETE).
# Our website (lib/api.ts) always adds it; a bad website cannot.
CHANGING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


async def csrf_header_check(request: Request, call_next):
    """Middleware: runs before every request reaches its endpoint."""
    if request.method in CHANGING_METHODS and request.url.path.startswith("/api/"):
        if request.headers.get("X-SafeZone") != "1":
            return JSONResponse(
                error_body("missing_safety_header", "This request is missing the X-SafeZone header."),
                status_code=403,
            )
    return await call_next(request)  # all good: continue to the endpoint
