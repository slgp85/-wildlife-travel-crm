from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    client_id: int
    trip_id: int
    travelers: int = Field(default=1, ge=1)
    status: BookingStatus = BookingStatus.pending
    total_amount: Decimal | None = Field(default=None, ge=0)


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BookingBase):
    pass


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    trip_id: int
    travelers: int
    status: BookingStatus
    total_amount: Decimal
    created_at: datetime
