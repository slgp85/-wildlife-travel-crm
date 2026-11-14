# PRP: Wildlife Travel in CRM

> Lean implementation blueprint (base functionality only)

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | Wildlife Travel in CRM |
| **Type** | SaaS |
| **Version** | 1.0 |
| **Created** | 2026-11-14 |
| **Complexity** | Low |

---

## PRODUCT OVERVIEW

**Description:** Simple CRM for wildlife tour operators, safari lodges and travel agents to manage clients, trips and bookings.

**Value Proposition:** One place to track enquiries, define trips and confirm bookings without spreadsheets.

**MVP Scope:**
- [ ] CRUD for Clients, Trips, Bookings
- [ ] Bookings link a client and a trip, with capacity check
- [ ] Dashboard with basic counts

---

## TECH STACK

| Layer | Technology | Skill |
|-------|------------|-------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| Frontend | React + TypeScript + Vite | skills/FRONTEND.md |
| Database | PostgreSQL + SQLAlchemy + Alembic | skills/DATABASE.md |
| Auth | Deferred (placeholder) | - |
| UI | Tailwind + shadcn/ui | skills/FRONTEND.md |
| Testing | pytest (basic) | skills/TESTING.md |

---

## DATABASE MODELS

- **Client:** id, full_name, email, phone, country, status (lead|active|past), interests, notes, created_at
- **Trip:** id, name, destination, start_date, end_date, price, capacity, description
- **Booking:** id, client_id (FK Client), trip_id (FK Trip), travelers, status (pending|confirmed|cancelled), total_amount, created_at

Relationships: Client 1-N Booking, Trip 1-N Booking. No User model until auth is added.

---

## MODULES

### Module 1: Authentication (Deferred)
No work in this PRP. API is open. Add `user_id` ownership when auth is chosen.

### Module 2: Clients
**Agents:** BACKEND + FRONTEND

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/clients | List (status filter) |
| POST | /api/v1/clients | Create |
| GET | /api/v1/clients/{id} | Get one |
| PUT | /api/v1/clients/{id} | Update |
| DELETE | /api/v1/clients/{id} | Delete |

| Route | Page |
|-------|------|
| /clients | ClientsPage (list + filter) |
| /clients/new, /clients/:id | ClientFormPage |

### Module 3: Trips
**Agents:** BACKEND + FRONTEND

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/trips | List |
| POST | /api/v1/trips | Create |
| GET | /api/v1/trips/{id} | Get one |
| PUT | /api/v1/trips/{id} | Update |
| DELETE | /api/v1/trips/{id} | Delete |

| Route | Page |
|-------|------|
| /trips | TripsPage |
| /trips/new, /trips/:id | TripFormPage |

Rule: `end_date >= start_date`.

### Module 4: Bookings
**Agents:** BACKEND + FRONTEND

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/bookings | List |
| POST | /api/v1/bookings | Create (409 if over capacity) |
| GET | /api/v1/bookings/{id} | Get one |
| PUT | /api/v1/bookings/{id} | Update |
| DELETE | /api/v1/bookings/{id} | Delete |

| Route | Page |
|-------|------|
| /bookings | BookingsPage |
| /bookings/new, /bookings/:id | BookingFormPage |

Rule: sum of non-cancelled `travelers` for a trip must not exceed `capacity`.

### Module 5: Dashboard
**Agents:** BACKEND + FRONTEND

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/dashboard | Counts: clients, upcoming trips, bookings by status |

| Route | Page |
|-------|------|
| /dashboard | DashboardPage (stat cards + upcoming trips) |

---

## PHASE EXECUTION PLAN

**Phase 1: Foundation (3 agents parallel)**
- DATABASE-AGENT: models, initial Alembic migration, database.py
- BACKEND-AGENT: main.py, config.py, router scaffolding, `/health`
- FRONTEND-AGENT: Vite + Tailwind + shadcn/ui setup, routing, API client

**Validation Gate 1:** `pip install`, `alembic upgrade head`, `npm install`

**Phase 2: Modules (backend + frontend in parallel per module)**
- Clients, Trips, Bookings (capacity rule), Dashboard

**Validation Gate 2:** `ruff check backend/`, `npm run lint`, `npm run type-check`

**Phase 3: Quality (lean)**
- Basic pytest for capacity rule and CRUD happy paths. DevOps and Review agents skipped unless requested.

**Final Validation:** `pytest`, app starts, `curl localhost:8000/health`

---

## VALIDATION GATES

| Gate | Commands |
|------|----------|
| 1 | `alembic upgrade head`, `npm install` |
| 2 | `ruff check backend/`, `npm run type-check` |
| 3 | `pytest backend/tests -v`, `npm run lint` |
| Final | `uvicorn app.main:app`, `curl localhost:8000/health` |

---

## ENVIRONMENT VARIABLES

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wildlife_travel_crm
VITE_API_URL=http://localhost:8000
```

---

## NEXT STEP

/execute-prp PRPs/wildlife-travel-crm-prp.md
