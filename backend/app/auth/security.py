"""Password hashing and JWT helpers."""
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.config import settings


def hash_password(password: str) -> str:
    """Hash a password with bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Check a password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def create_access_token(user_id: int) -> str:
    """Create a signed JWT whose subject is the user id."""
    expires = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    claims = {"sub": str(user_id), "exp": expires}
    return jwt.encode(claims, settings.secret_key, settings.algorithm)


def decode_access_token(token: str) -> int | None:
    """Return the user id from a valid token, or None if invalid or expired."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
