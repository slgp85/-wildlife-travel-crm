"""FastAPI application entrypoint."""
import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.deps import get_current_user
from app.config import settings
from app.routers import auth, bookings, clients, dashboard, trips

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Wildlife Travel CRM", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
# Every data route requires a logged-in user.
for module in (clients, trips, bookings, dashboard):
    app.include_router(module.router, prefix=PREFIX, dependencies=[Depends(get_current_user)])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
