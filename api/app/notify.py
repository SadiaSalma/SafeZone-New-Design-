"""
notify.py - delivers one-time codes to people (Design Revisions R1).

Three channels, chosen with OTP_CHANNEL in .env:
  console      - prints the code in the backend window (development only, free)
  email        - sends a real email through the SMTP server in .env
  demo_screen  - the code is returned to the website to show on screen (development only)
"""
import smtplib
from email.message import EmailMessage

from app.config import settings
from app.errors import AppError

PURPOSE_TEXT = {
    "register": "confirm your SafeZone account",
    "reset": "reset your SafeZone password",
    "delete": "delete your SafeZone data",
}


def mask_email(email: str) -> str:
    """'rahim@example.com' -> 'r****@example.com' (so screens don't show the full address)."""
    name, _, domain = email.partition("@")
    return f"{name[:1]}{'*' * max(len(name) - 1, 3)}@{domain}"


def send_code(email: str, code: str, purpose: str) -> None:
    """Deliver a code using the configured channel."""
    channel = settings.otp_channel
    if channel in ("console", "demo_screen") and settings.app_env != "development":
        # R1: these channels must never be used on a real server
        raise AppError(500, "otp_channel_not_allowed", "Codes cannot be delivered right now.")

    why = PURPOSE_TEXT.get(purpose, "use SafeZone")
    if channel in ("console", "demo_screen"):
        print(f"\n[SafeZone code] {mask_email(email)} -> {code}  (to {why}, valid {settings.otp_minutes} min)\n", flush=True)
        return
    if channel == "email":
        _send_email(email, f"Your SafeZone code: {code}", f"Your code to {why} is {code}.\n"
                    f"It is valid for {settings.otp_minutes} minutes. If you did not ask for it, ignore this email.")
        return
    raise AppError(500, "otp_channel_unknown", "Codes cannot be delivered right now.")


def send_notice(email: str, subject: str, body: str) -> None:
    """A security message to the account owner (e.g. 'your account was locked').
    Uses the same channel as codes. A notice that fails to send never breaks the request."""
    if settings.otp_channel == "email":
        try:
            _send_email(email, subject, body)
        except AppError:
            pass
        return
    print(f"\n[SafeZone notice] to {mask_email(email)}: {subject} - {body}\n", flush=True)


def _send_email(to: str, subject: str, body: str) -> None:
    if not settings.smtp_host:
        raise AppError(500, "email_not_configured", "Email is not set up on the server yet.")
    message = EmailMessage()
    message["From"] = settings.smtp_from or settings.smtp_user
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()  # encrypt the connection
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as error:
        raise AppError(502, "email_failed", "We could not send the email. Please try again.") from error
