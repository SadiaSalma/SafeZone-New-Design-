"""
security.py - safety checks that run on every request.

For now: the CSRF header check (design doc, Section 9).

CSRF ("cross-site request forgery") is a trick where a bad website makes your
browser send a request to SafeZone without you knowing. Browsers do not let
other websites add custom headers, so we require our own header
    X-SafeZone: 1
on every request that CHANGES data (POST, PUT, PATCH, DELETE).
Our website (lib/api.ts) always adds it; a bad website cannot.
"""
from fastapi import Request
from fastapi.responses import JSONResponse

from app.errors import error_body

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
