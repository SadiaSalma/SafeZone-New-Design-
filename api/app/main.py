"""
main.py - the starting point of the SafeZone backend.

The server program (uvicorn) loads the `app` object from this file:
    uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import database_status
from app.errors import register_error_handlers
from app.security import csrf_header_check

# Create the web application. The title and version appear on the /docs page.
app = FastAPI(title=settings.app_name, version="0.3.0")

# Every error comes back in the same shape: {"error": {"code", "message", "fields"}}
register_error_handlers(app)

# Requests that change data must carry the X-SafeZone: 1 header (CSRF protection).
app.middleware("http")(csrf_header_check)

# CORS: only our own website may call this backend from a browser, never "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-SafeZone"],
)


@app.get("/api/v1/health")
def health():
    """Answer 'I am alive' and say whether the database is reachable.

    The website's status light calls this every 30 seconds.
    status is "ok" when everything works, "degraded" when the database is down.
    """
    database = database_status()
    return {
        "status": "ok" if database["ok"] else "degraded",
        "app": settings.app_name,
        "env": settings.app_env,
        "version": app.version,
        "database": database,
    }
