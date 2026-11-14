import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthStatus, LoginRequest, RegisterRequest, TokenResponse, UserRead

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def _user_count(db: Session) -> int:
    return db.scalar(select(func.count(User.id))) or 0


@router.get("/status", response_model=AuthStatus)
async def auth_status(db: Session = Depends(get_db)) -> AuthStatus:
    """Tell the UI whether sign-up is currently allowed."""
    return AuthStatus(registration_open=settings.allow_registration or _user_count(db) == 0)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if not (settings.allow_registration or _user_count(db) == 0):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Registration is closed")
    email = data.email.lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(email=email, hashed_password=hash_password(data.password), full_name=data.full_name)
    db.add(user)
    db.commit()
    logger.info("User registered: id=%s", user.id)
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    valid = user is not None and user.is_active
    if not valid or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)) -> User:
    return user
