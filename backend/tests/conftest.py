import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-use-0123456789")

from collections.abc import Generator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.models  # noqa: E402, F401
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

CREDENTIALS = {"email": "admin@example.com", "password": "correct-horse-1", "full_name": "Admin"}


@pytest.fixture()
def anon_client() -> Generator[TestClient, None, None]:
    """Test client with an empty database and no login."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def client(anon_client: TestClient) -> TestClient:
    """Test client logged in as the first registered user."""
    token = anon_client.post("/api/v1/auth/register", json=CREDENTIALS).json()["access_token"]
    anon_client.headers["Authorization"] = f"Bearer {token}"
    return anon_client
