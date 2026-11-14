from fastapi.testclient import TestClient

from app.auth.security import create_access_token
from app.config import settings
from tests.conftest import CREDENTIALS

P = "/api/v1"


def test_data_routes_require_login(anon_client: TestClient) -> None:
    for path in ("clients", "trips", "bookings", "dashboard"):
        assert anon_client.get(f"{P}/{path}").status_code == 401


def test_invalid_and_expired_tokens_rejected(anon_client: TestClient) -> None:
    bad = {"Authorization": "Bearer not-a-token"}
    assert anon_client.get(f"{P}/clients", headers=bad).status_code == 401
    # A well-formed token for a user that does not exist is rejected.
    ghost = {"Authorization": f"Bearer {create_access_token(1)}"}
    assert anon_client.get(f"{P}/clients", headers=ghost).status_code == 401
    # An expired token is rejected.
    settings.access_token_expire_minutes = -1
    try:
        expired = {"Authorization": f"Bearer {create_access_token(1)}"}
    finally:
        settings.access_token_expire_minutes = 720
    assert anon_client.get(f"{P}/clients", headers=expired).status_code == 401


def test_register_login_me(anon_client: TestClient) -> None:
    assert anon_client.get(f"{P}/auth/status").json() == {"registration_open": True}
    r = anon_client.post(f"{P}/auth/register", json=CREDENTIALS)
    assert r.status_code == 201
    login = anon_client.post(
        f"{P}/auth/login", json={"email": "ADMIN@example.com", "password": CREDENTIALS["password"]}
    )
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    me = anon_client.get(f"{P}/auth/me", headers=headers).json()
    assert me["email"] == "admin@example.com"
    assert "hashed_password" not in me
    assert anon_client.get(f"{P}/clients", headers=headers).status_code == 200


def test_wrong_password_rejected(client: TestClient) -> None:
    wrong_pw = {"email": CREDENTIALS["email"], "password": "nope-nope-1"}
    assert client.post(f"{P}/auth/login", json=wrong_pw).status_code == 401
    unknown = {"email": "who@example.com", "password": "nope-nope-1"}
    assert client.post(f"{P}/auth/login", json=unknown).status_code == 401


def test_registration_closes_after_first_user(client: TestClient) -> None:
    assert client.get(f"{P}/auth/status").json() == {"registration_open": False}
    other = {"email": "b@example.com", "password": "another-pass-1", "full_name": "B"}
    assert client.post(f"{P}/auth/register", json=other).status_code == 403


def test_password_rules(anon_client: TestClient) -> None:
    short = {**CREDENTIALS, "password": "short"}
    assert anon_client.post(f"{P}/auth/register", json=short).status_code == 422
    long = {**CREDENTIALS, "password": "x" * 73}
    assert anon_client.post(f"{P}/auth/register", json=long).status_code == 422
