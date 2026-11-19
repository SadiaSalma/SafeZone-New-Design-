"""
schemas.py (auth) - the rules for data coming IN and going OUT.

Pydantic checks every request against these classes automatically.
If something is wrong, the person gets a clear message for that field
(e.g. {"phone": "Enter a Bangladeshi mobile number like 01712345678."}).
"""
import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

# Bangladeshi mobile numbers: 01 + operator digit 3-9 + 8 digits (11 digits in total)
LOCAL_MOBILE = re.compile(r"^01[3-9]\d{8}$")


def normalize_phone(raw: str) -> str:
    """Accept '01712345678', '+880 1712-345678', '8801712345678' ... and return '+8801712345678'."""
    digits = re.sub(r"[\s\-()]", "", raw).lstrip("+")
    if digits.startswith("880"):
        digits = "0" + digits[3:]
    if not LOCAL_MOBILE.match(digits):
        raise ValueError("Enter a Bangladeshi mobile number like 01712345678.")
    return "+88" + digits


class RegisterIn(BaseModel):
    """What the sign-up form sends (FR-1, with email from revision R1)."""

    name_en: str = Field(min_length=2, max_length=80, examples=["Rahim Uddin"])
    name_bn: str | None = Field(default=None, max_length=80, examples=["রহিম উদ্দিন"])
    phone: str = Field(examples=["01712345678"])
    email: EmailStr = Field(examples=["rahim@example.com"])
    password: str = Field(min_length=8, max_length=128, examples=["safe-pass-123"])

    @field_validator("name_en", "name_bn")
    @classmethod
    def strip_spaces(cls, value: str | None) -> str | None:
        return value.strip() if value else value

    @field_validator("phone")
    @classmethod
    def check_phone(cls, value: str) -> str:
        return normalize_phone(value)

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("password")
    @classmethod
    def strong_enough(cls, value: str) -> str:
        if not (re.search(r"[A-Za-z]", value) and re.search(r"\d", value)):
            raise ValueError("Use at least one letter and one number.")
        return value


class RegisterOut(BaseModel):
    """What the backend answers after a successful sign-up."""

    user_id: str
    status: str  # "pending_verify" until the code is confirmed (Task 8)
    code_sent_to: str  # masked, e.g. "r****@example.com"
    channel: str  # how the code was delivered
    demo_code: str | None = None  # only filled in demo_screen mode
    message: str


class ResendIn(BaseModel):
    email: EmailStr
    purpose: Literal["register"] = "register"

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.lower()


class MessageOut(BaseModel):
    message: str
    demo_code: str | None = None
