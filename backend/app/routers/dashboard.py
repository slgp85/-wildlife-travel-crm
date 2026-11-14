from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.client import Client, ClientStatus
from app.models.trip import Trip
from app.schemas.dashboard import DashboardRead
from app.schemas.trip import TripRead

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardRead)
async def get_dashboard(db: Session = Depends(get_db)) -> DashboardRead:
    client_rows = db.execute(select(Client.status, func.count(Client.id)).group_by(Client.status))
    clients_by_status = {s.value: 0 for s in ClientStatus}
    clients_by_status.update({s.value: n for s, n in client_rows})
    booking_rows = db.execute(
        select(Booking.status, func.count(Booking.id)).group_by(Booking.status)
    )
    bookings_by_status = {s.value: 0 for s in BookingStatus}
    bookings_by_status.update({s.value: n for s, n in booking_rows})
    upcoming = db.scalars(
        select(Trip).where(Trip.start_date >= date.today()).order_by(Trip.start_date).limit(10)
    )
    return DashboardRead(
        clients_total=sum(clients_by_status.values()),
        clients_by_status=clients_by_status,
        upcoming_trips=[TripRead.model_validate(t) for t in upcoming],
        bookings_by_status=bookings_by_status,
    )
