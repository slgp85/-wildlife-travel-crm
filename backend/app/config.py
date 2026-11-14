"""Application settings loaded from environment."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://user:password@localhost:5432/wildlife_travel_crm"
    cors_origins: list[str] = ["http://localhost:5173"]
    # Required: no default so a missing secret fails fast instead of using a known key.
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 720
    # The very first account can always register; further sign-ups need this enabled.
    allow_registration: bool = False


settings = Settings()
