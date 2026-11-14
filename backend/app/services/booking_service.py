"""Booking business rules."""
import logging

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.trip import Trip

logger = logging.getLogger(__name__)


def check_capacity(
    db: Session,
    trip_id: int,
    travelers: int,
    booking_status: BookingStatus,
    exclude_booking_id: int | None = None,
) -> None:
    """Raise 409 if non-cancelled travelers on the trip would exceed capacity."""
    if booking_status == BookingStatus.cancelled:
        return
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trip not found")
    stmt = select(func.coalesce(func.sum(Booking.travelers), 0)).where(
        Booking.trip_id == trip_id, Booking.status != BookingStatus.cancelled
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(Booking.id != exclude_booking_id)
    booked = int(db.scalar(stmt) or 0)
    if booked + travelers > trip.capacity:
        logger.warning("Capacity exceeded for trip %s", trip_id)
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Trip capacity exceeded: {trip.capacity - booked} spots left",
        )
