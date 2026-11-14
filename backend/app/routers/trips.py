from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripRead, TripUpdate

router = APIRouter(prefix="/trips", tags=["trips"])


def _get_or_404(db: Session, trip_id: int) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trip not found")
    return trip


@router.get("", response_model=list[TripRead])
async def list_trips(db: Session = Depends(get_db)) -> list[Trip]:
    return list(db.scalars(select(Trip).order_by(Trip.start_date)))


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
async def create_trip(data: TripCreate, db: Session = Depends(get_db)) -> Trip:
    trip = Trip(**data.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip(trip_id: int, db: Session = Depends(get_db)) -> Trip:
    return _get_or_404(db, trip_id)


@router.put("/{trip_id}", response_model=TripRead)
async def update_trip(trip_id: int, data: TripUpdate, db: Session = Depends(get_db)) -> Trip:
    trip = _get_or_404(db, trip_id)
    for key, value in data.model_dump().items():
        setattr(trip, key, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get_or_404(db, trip_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
