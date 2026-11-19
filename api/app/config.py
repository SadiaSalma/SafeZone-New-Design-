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

    # Read values from the .env file in the folder where we start the server.
    model_config = SettingsConfigDict(env_file=".env")


# ONE settings object, created once, that every other file imports.
settings = Settings()
