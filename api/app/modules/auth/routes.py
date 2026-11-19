"""
routes.py (auth) - the web addresses for accounts.

Each function here is small: it receives the request, calls service.py,
and returns the answer. The real work happens in service.py.
"""
from fastapi import APIRouter, Request

from app.modules.auth import service
from app.modules.auth.schemas import MessageOut, RegisterIn, RegisterOut, ResendIn

router = APIRouter(prefix="/api/v1/auth", tags=["Accounts"])


def client_ip(request: Request) -> str:
    """The visitor's IP address (used for spam limits)."""
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=RegisterOut, status_code=201, summary="Sign up")
def register(data: RegisterIn, request: Request):
    """Create an account (status pending_verify) and send a 6-digit code to the email."""
    return service.register(data, client_ip(request))


@router.post("/resend-otp", response_model=MessageOut, summary="Send the code again")
def resend_otp(data: ResendIn):
    """Send a new code. Max 3 codes per hour for one email."""
    return service.resend_code(data.email, data.purpose)
