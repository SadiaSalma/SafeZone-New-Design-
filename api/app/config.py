"""
config.py - reads SafeZone's settings.

Settings live in the file api/.env, not inside the code.
That way we can change them without editing code (requirement NFR-7).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Each line is one setting: its name, its type, and a default value
    # that is used when the .env file does not mention it.
    app_name: str = "SafeZone API"
    app_env: str = "development"  # "development" or "production"

    # The website's address. Only this address may call the backend from a browser (CORS).
    web_origin: str = "http://localhost:3000"

    # The database. Our own MongoDB runs on port 27018 as replica set "rs0"
    # (started with scripts/start_db.py). MONGODB_DB is the database's name.
    mongodb_uri: str = "mongodb://127.0.0.1:27018/?replicaSet=rs0"
    mongodb_db: str = "safezone"

    # --- One-time codes (Design Revisions R1) ---
    # How codes reach people:
    #   "console"     - printed in the backend window (development only, free)
    #   "email"       - sent by email through the SMTP settings below
    #   "demo_screen" - shown on screen, for the teacher demo (development only)
    otp_channel: str = "console"
    otp_secret: str = "dev-only-change-me"  # used to scramble codes before saving them
    otp_minutes: int = 10  # how long a code stays valid

    # Email server (only needed when otp_channel = "email"), e.g. Gmail with an app password
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    # --- Limits against spam (Design Revisions R9) ---
    codes_per_hour_per_target: int = 3
    registrations_per_hour_per_ip: int = 5

    # Read values from the .env file in the folder where we start the server.
    model_config = SettingsConfigDict(env_file=".env")


# ONE settings object, created once, that every other file imports.
settings = Settings()
