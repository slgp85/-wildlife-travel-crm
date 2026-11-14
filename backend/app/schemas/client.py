from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.client import ClientStatus


class ClientBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = None
    country: str | None = None
    status: ClientStatus = ClientStatus.lead
    interests: str | None = None
    notes: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    pass


class ClientRead(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
