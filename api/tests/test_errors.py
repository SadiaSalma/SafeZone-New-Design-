"""
Tests for Task 4: the standard error shape, the X-SafeZone safety header and CORS.

Every error must look like: {"error": {"code": ..., "message": ..., "fields": {...}}}
"""
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.errors import AppError, register_error_handlers
from app.main import app

client = TestClient(app)


def assert_error_shape(body: dict, code: str):
    """Helper: check the body has the standard error shape with the expected code."""
    assert set(body) == {"error"}
    assert body["error"]["code"] == code
    assert isinstance(body["error"]["message"], str) and body["error"]["message"]
    assert isinstance(body["error"]["fields"], dict)


def test_unknown_address_gives_not_found():
    response = client.get("/api/v1/this-does-not-exist")
    assert response.status_code == 404
    assert_error_shape(response.json(), "not_found")


def test_change_without_safety_header_is_blocked():
    response = client.post("/api/v1/health")  # no X-SafeZone header
    assert response.status_code == 403
    assert_error_shape(response.json(), "missing_safety_header")


def test_change_with_safety_header_passes_the_check():
    # The header is fine, so the request reaches FastAPI; health only allows GET -> 405
    response = client.post("/api/v1/health", headers={"X-SafeZone": "1"})
    assert response.status_code == 405
    assert_error_shape(response.json(), "method_not_allowed")


def test_reading_needs_no_safety_header():
    assert client.get("/api/v1/health").status_code == 200


def test_cors_allows_only_our_website():
    preflight = {"Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "X-SafeZone"}
    ours = client.options("/api/v1/health", headers={"Origin": "http://localhost:3000", **preflight})
    assert ours.headers.get("access-control-allow-origin") == "http://localhost:3000"

    stranger = client.options("/api/v1/health", headers={"Origin": "https://evil.example", **preflight})
    assert stranger.headers.get("access-control-allow-origin") is None


# --- The tests below use a tiny practice app with the same error handlers ---

practice = FastAPI()
register_error_handlers(practice)


@practice.get("/number/{n}")
def needs_a_number(n: int):
    return {"n": n}


@practice.get("/duplicate")
def raises_app_error():
    raise AppError(409, "duplicate_gd", "This GD number was already reported.")


@practice.get("/crash")
def has_a_bug():
    raise ValueError("secret technical detail")


practice_client = TestClient(practice, raise_server_exceptions=False)


def test_bad_input_lists_the_wrong_field():
    response = practice_client.get("/number/abc")  # "abc" is not a number
    assert response.status_code == 422
    body = response.json()
    assert_error_shape(body, "invalid_input")
    assert "n" in body["error"]["fields"]


def test_app_error_keeps_our_code_and_message():
    response = practice_client.get("/duplicate")
    assert response.status_code == 409
    assert_error_shape(response.json(), "duplicate_gd")


def test_unexpected_bug_hides_technical_details():
    response = practice_client.get("/crash")
    assert response.status_code == 500
    body = response.json()
    assert_error_shape(body, "server_error")
    assert "secret" not in response.text  # never leak details to users
