"""
main.py - the starting point of the SafeZone backend.

The server program (uvicorn) loads the `app` object from this file:
    uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI

from app.config import settings

# Create the web application. The title and version appear on the /docs page.
app = FastAPI(title=settings.app_name, version="0.1.0")


@app.get("/api/v1/health")
def health():
    """Answer 'I am alive'. Used to check that the server is running."""
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}
