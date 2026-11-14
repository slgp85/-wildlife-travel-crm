from fastapi.testclient import TestClient

P = "/api/v1"


def make_client(c: TestClient) -> int:
    r = c.post(f"{P}/clients", json={"full_name": "Ann", "email": "ann@example.com"})
    assert r.status_code == 201
    return int(r.json()["id"])


def make_trip(c: TestClient, capacity: int = 4) -> int:
    r = c.post(
        f"{P}/trips",
        json={
            "name": "Safari",
            "destination": "Kenya",
            "start_date": "2099-01-01",
            "end_date": "2099-01-07",
            "price": "100.00",
            "capacity": capacity,
        },
    )
    assert r.status_code == 201
    return int(r.json()["id"])


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_client_crud(client: TestClient) -> None:
    cid = make_client(client)
    assert client.get(f"{P}/clients?status_filter=lead").json()[0]["id"] == cid
    body = {"full_name": "Ann B", "email": "ann@example.com", "status": "active"}
    assert client.put(f"{P}/clients/{cid}", json=body).json()["status"] == "active"
    assert client.delete(f"{P}/clients/{cid}").status_code == 204
    assert client.get(f"{P}/clients/{cid}").status_code == 404


def test_trip_date_validation(client: TestClient) -> None:
    r = client.post(
        f"{P}/trips",
        json={
            "name": "x",
            "destination": "y",
            "start_date": "2099-02-01",
            "end_date": "2099-01-01",
            "price": 1,
            "capacity": 1,
        },
    )
    assert r.status_code == 422


def test_capacity_409_and_dashboard(client: TestClient) -> None:
    cid, tid = make_client(client), make_trip(client, capacity=4)
    ok = client.post(f"{P}/bookings", json={"client_id": cid, "trip_id": tid, "travelers": 3})
    assert ok.status_code == 201
    assert float(ok.json()["total_amount"]) == 300.0
    bid = ok.json()["id"]
    over = client.post(f"{P}/bookings", json={"client_id": cid, "trip_id": tid, "travelers": 2})
    assert over.status_code == 409
    upd = {"client_id": cid, "trip_id": tid, "travelers": 5}
    assert client.put(f"{P}/bookings/{bid}", json=upd).status_code == 409
    upd.update(travelers=4, status="confirmed")
    assert client.put(f"{P}/bookings/{bid}", json=upd).status_code == 200
    upd.update(status="cancelled")
    client.put(f"{P}/bookings/{bid}", json=upd)
    again = client.post(f"{P}/bookings", json={"client_id": cid, "trip_id": tid, "travelers": 4})
    assert again.status_code == 201
    d = client.get(f"{P}/dashboard").json()
    assert d["clients_total"] == 1
    assert d["bookings_by_status"]["cancelled"] == 1
    assert len(d["upcoming_trips"]) == 1
