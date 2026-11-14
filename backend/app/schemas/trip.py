from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TripBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    destination: str = Field(min_length=1, max_length=200)
    start_date: date
    end_date: date
    price: Decimal = Field(ge=0)
    capacity: int = Field(ge=1)
    description: str | None = None

    @model_validator(mode="after")
    def check_dates(self) -> "TripBase":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class TripCreate(TripBase):
    pass


class TripUpdate(TripBase):
    pass


class TripRead(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
