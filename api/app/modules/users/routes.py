"""
routes.py (users) - addresses about "my account".
"""
from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.modules.auth.schemas import UserOut
from app.modules.auth.service import public_user
from app.modules.users import service
from app.modules.users.schemas import NidIn

router = APIRouter(prefix="/api/v1", tags=["My account"])


@router.get("/me", response_model=UserOut, summary="Who am I?")
def me(user: dict = Depends(get_current_user)):
    """The logged-in person's details. Answers 401 if nobody is logged in."""
    return public_user(user)


@router.post("/me/nid", response_model=UserOut, summary="Add my NID number")
def add_my_nid(data: NidIn, user: dict = Depends(get_current_user)):
    """Link a national ID number (10, 13 or 17 digits) to my account. Needed before the first report."""
    return public_user(service.add_nid(user, data.nid))
