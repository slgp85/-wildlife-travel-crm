from pydantic import BaseModel

from app.schemas.trip import TripRead


class DashboardRead(BaseModel):
    clients_total: int
    clients_by_status: dict[str, int]
    upcoming_trips: list[TripRead]
    bookings_by_status: dict[str, int]
