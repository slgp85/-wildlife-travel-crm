from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.client import Client
from app.models.trip import Trip
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate
from app.services.booking_service import check_capacity

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _get_or_404(db: Session, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    return booking


def _prepare(
    db: Session, data: BookingCreate | BookingUpdate, exclude_id: int | None
) -> dict[str, Any]:
    if db.get(Client, data.client_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    trip = db.get(Trip, data.trip_id)
    if trip is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trip not found")
    check_capacity(db, data.trip_id, data.travelers, data.status, exclude_id)
    values = data.model_dump()
    if values["total_amount"] is None:
        values["total_amount"] = trip.price * Decimal(data.travelers)
    return values


@router.get("", response_model=list[BookingRead])
async def list_bookings(db: Session = Depends(get_db)) -> list[Booking]:
    return list(db.scalars(select(Booking).order_by(Booking.id)))


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(data: BookingCreate, db: Session = Depends(get_db)) -> Booking:
    booking = Booking(**_prepare(db, data, None))
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(booking_id: int, db: Session = Depends(get_db)) -> Booking:
    return _get_or_404(db, booking_id)


@router.put("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: int, data: BookingUpdate, db: Session = Depends(get_db)
) -> Booking:
    booking = _get_or_404(db, booking_id)
    for key, value in _prepare(db, data, booking_id).items():
        setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(booking_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get_or_404(db, booking_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
