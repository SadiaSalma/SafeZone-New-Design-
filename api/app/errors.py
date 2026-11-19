"""
errors.py - makes EVERY error from the backend look the same.

Design doc, Section 7: errors always come back in one shape:
    {"error": {"code": "...", "message": "...", "fields": {...}}}

  code    - a short word the website can check, e.g. "not_found"
  message - a sentence a person can read
  fields  - which form fields were wrong (only for bad input), e.g. {"phone": "..."}

Why? The website then needs only ONE piece of code to show any error.
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    """Raise this anywhere in our code to send a clean error to the website.

    Example:  raise AppError(404, "report_not_found", "This report does not exist.")
    """

    def __init__(self, status: int, code: str, message: str, fields: dict | None = None):
        self.status = status
        self.code = code
        self.message = message
        self.fields = fields or {}


def error_body(code: str, message: str, fields: dict | None = None) -> dict:
    """Build the standard error shape."""
    return {"error": {"code": code, "message": message, "fields": fields or {}}}


# Friendly words for common HTTP status numbers
_CODES = {
    400: ("bad_request", "The request is not valid."),
    401: ("not_logged_in", "Please log in first."),
    403: ("forbidden", "You are not allowed to do this."),
    404: ("not_found", "This address does not exist."),
    405: ("method_not_allowed", "This action is not allowed here."),
    429: ("too_many_requests", "Too many requests. Please wait a moment."),
}


def register_error_handlers(app: FastAPI) -> None:
    """Tell FastAPI to use our error shape for every kind of error."""

    # 1) Our own errors (AppError)
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError):
        return JSONResponse(error_body(exc.code, exc.message, exc.fields), status_code=exc.status)

    # 2) Built-in HTTP errors, e.g. an address that does not exist (404)
    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(request: Request, exc: StarletteHTTPException):
        code, message = _CODES.get(exc.status_code, ("error", "Something went wrong."))
        return JSONResponse(error_body(code, message), status_code=exc.status_code)

    # 3) Bad input: wrong type, missing field... (Pydantic checks it for us)
    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        fields = {}
        for problem in exc.errors():
            # problem["loc"] looks like ("body", "phone") -> we keep the last part: "phone"
            name = str(problem["loc"][-1]) if problem.get("loc") else "request"
            fields[name] = problem.get("msg", "Invalid value")
        return JSONResponse(
            error_body("invalid_input", "Some fields are not valid.", fields), status_code=422
        )

    # 4) Anything unexpected (a bug): never show the technical details to the user
    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception):
        return JSONResponse(
            error_body("server_error", "Something went wrong on our side. Please try again."),
            status_code=500,
        )
