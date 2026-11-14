from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.client import Client, ClientStatus
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate

router = APIRouter(prefix="/clients", tags=["clients"])


def _get_or_404(db: Session, client_id: int) -> Client:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    return client


@router.get("", response_model=list[ClientRead])
async def list_clients(
    status_filter: ClientStatus | None = None,
    db: Session = Depends(get_db),
) -> list[Client]:
    stmt = select(Client).order_by(Client.id)
    if status_filter is not None:
        stmt = stmt.where(Client.status == status_filter)
    return list(db.scalars(stmt))


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(data: ClientCreate, db: Session = Depends(get_db)) -> Client:
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientRead)
async def get_client(client_id: int, db: Session = Depends(get_db)) -> Client:
    return _get_or_404(db, client_id)


@router.put("/{client_id}", response_model=ClientRead)
async def update_client(
    client_id: int, data: ClientUpdate, db: Session = Depends(get_db)
) -> Client:
    client = _get_or_404(db, client_id)
    for key, value in data.model_dump().items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get_or_404(db, client_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
